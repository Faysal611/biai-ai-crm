from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime
from .database import Base

class Enquiry(Base):
    __tablename__ = "enquiries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    original_id = Column(Integer, nullable=True)
    channel = Column(String(100), default="Unknown")
    received_at = Column(String(50), nullable=True)
    sender_name = Column(String(150), default="Anonymous")
    phone = Column(String(50), nullable=True)
    raw_message = Column(Text, nullable=False)
    
    # AI Processed fields
    category = Column(String(100), default="General Inquiry")  # Bootcamp, Fellowship, Corporate Training, etc.
    detected_language = Column(String(50), default="English")   # Bangla, Banglish, English
    suggested_reply = Column(Text, nullable=True)
    priority = Column(String(50), default="Normal")            # Normal, High, Urgent
    
    # CRM Pipeline Stage
    status = Column(String(50), default="New", index=True)      # New, Contacted, Interested, Paid, Lost
    
    # Staff updates & follow-up tracking
    notes = Column(Text, nullable=True)
    last_contacted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))
