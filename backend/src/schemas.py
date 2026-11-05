from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class EnquiryBase(BaseModel):
    channel: str = "WhatsApp"
    sender_name: str = "Anonymous"
    phone: Optional[str] = None
    raw_message: str
    category: Optional[str] = "General Inquiry"
    detected_language: Optional[str] = "English"
    suggested_reply: Optional[str] = None
    priority: Optional[str] = "Normal"
    status: str = "New"
    notes: Optional[str] = None
    received_at: Optional[str] = None

class EnquiryCreate(EnquiryBase):
    pass

class EnquiryUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    suggested_reply: Optional[str] = None
    priority: Optional[str] = None
    last_contacted_at: Optional[datetime] = None

class EnquiryResponse(EnquiryBase):
    id: int
    original_id: Optional[int] = None
    last_contacted_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class PasteMessageRequest(BaseModel):
    raw_text: str
    channel: Optional[str] = "WhatsApp"

class AIExtractionResult(BaseModel):
    sender_name: str
    phone: Optional[str] = None
    category: str
    detected_language: str
    priority: str
    suggested_reply: str
    reasoning: Optional[str] = None
