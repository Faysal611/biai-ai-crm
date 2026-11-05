import os
import csv
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .database import engine, Base, get_db, DATABASE_URL
from .models import Enquiry
from .schemas import (
    EnquiryCreate,
    EnquiryUpdate,
    EnquiryResponse,
    PasteMessageRequest,
    AIExtractionResult,
)
from .ai_service import (
    process_message_with_ai,
    generate_weekly_summary,
    GEMINI_API_KEY,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] Tables created/verified in database.")
    except Exception as e:
        print(f"[ERROR] Error creating tables: {e}")
    yield

app = FastAPI(
    title="BIAI CRM API",
    description="Backend API for BIAI AI-Powered CRM Pipeline",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend (local and deployed on Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "BIAI CRM Backend",
        "database_type": "MySQL (Aiven Cloud)",
        "active_ai_provider": "Google Gemini" if GEMINI_API_KEY else "Offline / Heuristic"
    }

# ----------------- AI Endpoints -----------------

@app.post("/api/ai/parse-message", response_model=AIExtractionResult)
def parse_message(request: PasteMessageRequest):
    """
    Parses a single raw customer message (e.g. from WhatsApp/Facebook).
    Returns extracted sender, phone, program category, language, priority, and suggested reply.
    """
    if not request.raw_text.strip():
        raise HTTPException(status_code=400, detail="Message text cannot be empty.")
    
    result = process_message_with_ai(
        raw_text=request.raw_text,
        channel=request.channel or "WhatsApp"
    )
    return result

@app.post("/api/ai/batch-enrich")
def batch_enrich_enquiries(force: bool = False, db: Session = Depends(get_db)):
    """
    Runs AI analysis across all enquiries in the database to categorize them
    and generate suggested replies matching their language (Bangla, Banglish, English).
    """
    enquiries = db.query(Enquiry).all()
    enriched_count = 0
    for e in enquiries:
        if force or not e.suggested_reply or e.category == "General Inquiry":
            ai_data = process_message_with_ai(
                raw_text=e.raw_message,
                channel=e.channel or "WhatsApp",
                existing_sender=e.sender_name,
                existing_phone=e.phone or ""
            )
            e.category = ai_data.get("category", e.category)
            e.detected_language = ai_data.get("detected_language", e.detected_language)
            e.priority = ai_data.get("priority", e.priority)
            e.suggested_reply = ai_data.get("suggested_reply", "")
            if not e.phone and ai_data.get("phone"):
                e.phone = ai_data.get("phone")
            if (not e.sender_name or e.sender_name == "Unknown") and ai_data.get("sender_name"):
                e.sender_name = ai_data.get("sender_name")
            enriched_count += 1
            
    db.commit()
    return {"message": f"Successfully enriched {enriched_count} enquiries with AI.", "total": len(enquiries)}

@app.get("/api/ai/weekly-summary")
def get_weekly_summary(db: Session = Depends(get_db)):
    """
    Generates an executive weekly summary of all CRM leads.
    """
    enquiries = db.query(Enquiry).all()
    enquiries_list = [
        {
            "id": e.id,
            "sender_name": e.sender_name,
            "channel": e.channel,
            "category": e.category,
            "status": e.status,
            "priority": e.priority,
            "raw_message": e.raw_message,
        }
        for e in enquiries
    ]
    summary_markdown = generate_weekly_summary(enquiries_list)
    return {"summary": summary_markdown, "total_leads": len(enquiries)}

# ----------------- CRM Pipeline CRUD -----------------

@app.get("/api/enquiries", response_model=List[EnquiryResponse])
def get_enquiries(
    status: Optional[str] = Query(None, description="Filter by status: New, Contacted, Interested, Paid, Lost"),
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name, phone, or message content"),
    db: Session = Depends(get_db)
):
    query = db.query(Enquiry)
    if status:
        query = query.filter(Enquiry.status == status)
    if category:
        query = query.filter(Enquiry.category == category)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Enquiry.sender_name.ilike(search_filter)) |
            (Enquiry.phone.ilike(search_filter)) |
            (Enquiry.raw_message.ilike(search_filter))
        )
    return query.order_by(desc(Enquiry.id)).all()

@app.get("/api/enquiries/{enquiry_id}", response_model=EnquiryResponse)
def get_enquiry(enquiry_id: int, db: Session = Depends(get_db)):
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    return enquiry

@app.post("/api/enquiries", response_model=EnquiryResponse)
def create_enquiry(data: EnquiryCreate, db: Session = Depends(get_db)):
    payload = data.model_dump()
    
    # Auto-enrich with AI if fields are not explicitly set
    if not payload.get("suggested_reply") or payload.get("category") == "General Inquiry":
        ai_data = process_message_with_ai(
            raw_text=payload["raw_message"],
            channel=payload.get("channel", "WhatsApp"),
            existing_sender=payload.get("sender_name", ""),
            existing_phone=payload.get("phone", "") or ""
        )
        payload["category"] = ai_data.get("category", payload.get("category"))
        payload["detected_language"] = ai_data.get("detected_language", "English")
        payload["priority"] = ai_data.get("priority", "Normal")
        payload["suggested_reply"] = ai_data.get("suggested_reply", "")
        if not payload.get("phone") and ai_data.get("phone"):
            payload["phone"] = ai_data.get("phone")
        if (not payload.get("sender_name") or payload["sender_name"] == "Anonymous") and ai_data.get("sender_name"):
            payload["sender_name"] = ai_data.get("sender_name")

    enquiry = Enquiry(**payload)
    db.add(enquiry)
    db.commit()
    db.refresh(enquiry)
    return enquiry

@app.patch("/api/enquiries/{enquiry_id}", response_model=EnquiryResponse)
def update_enquiry(enquiry_id: int, data: EnquiryUpdate, db: Session = Depends(get_db)):
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")

    update_data = data.model_dump(exclude_unset=True)
    
    if update_data.get("status") == "Contacted" and not enquiry.last_contacted_at:
        enquiry.last_contacted_at = datetime.utcnow()

    for key, value in update_data.items():
        setattr(enquiry, key, value)

    db.commit()
    db.refresh(enquiry)
    return enquiry

@app.delete("/api/enquiries/{enquiry_id}")
def delete_enquiry(enquiry_id: int, db: Session = Depends(get_db)):
    enquiry = db.query(Enquiry).filter(Enquiry.id == enquiry_id).first()
    if not enquiry:
        raise HTTPException(status_code=404, detail="Enquiry not found")
    db.delete(enquiry)
    db.commit()
    return {"message": f"Enquiry {enquiry_id} deleted successfully"}

# ----------------- Sample Data Seeding & Reset -----------------

@app.post("/api/enquiries/seed-sample")
def seed_sample_data(enrich_ai: bool = True, db: Session = Depends(get_db)):
    """Seeds the 20 enquiries from the task CSV with AI classification."""
    csv_path = os.path.join(os.path.dirname(__file__), "../sample-enquiries.csv")

    existing_count = db.query(Enquiry).count()
    if existing_count > 0:
        return {
            "message": f"Database already has {existing_count} records.",
            "count": existing_count
        }

    seeded_enquiries = []
    with open(csv_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            msg = row.get("message", "")
            channel = row.get("channel", "WhatsApp")
            name = row.get("sender name", "Unknown")
            phone = row.get("phone") or None

            # Enrich with AI during seed if requested
            category = "General Inquiry"
            lang = "English"
            priority = "Normal"
            reply = ""
            if enrich_ai:
                ai_data = process_message_with_ai(
                    raw_text=msg,
                    channel=channel,
                    existing_sender=name,
                    existing_phone=phone or ""
                )
                category = ai_data.get("category", category)
                lang = ai_data.get("detected_language", lang)
                priority = ai_data.get("priority", priority)
                reply = ai_data.get("suggested_reply", "")

            enquiry = Enquiry(
                original_id=int(row.get("id")) if row.get("id") else None,
                channel=channel,
                received_at=row.get("received at"),
                sender_name=name,
                phone=phone,
                raw_message=msg,
                category=category,
                detected_language=lang,
                priority=priority,
                suggested_reply=reply,
                status="New"
            )
            seeded_enquiries.append(enquiry)

    db.add_all(seeded_enquiries)
    db.commit()
    return {
        "message": f"Successfully loaded and AI-enriched {len(seeded_enquiries)} sample enquiries.",
        "count": len(seeded_enquiries)
    }

@app.post("/api/enquiries/reset-data")
def reset_enquiries(db: Session = Depends(get_db)):
    """Clears and re-seeds the database for a fresh demo."""
    db.query(Enquiry).delete()
    db.commit()
    return seed_sample_data(enrich_ai=True, db=db)
