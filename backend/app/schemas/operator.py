from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class QRRequest(BaseModel):
    qr_text: str

class InspectionStartResponse(BaseModel):
    inspection_id: int
    part_number: str
    serial_number: str
    vendor_code: str
    current_step: int
    status: str

class ChecklistItem(BaseModel):
    checklist_id: int
    question: str
    sequence_no: int
    photo_required: int

class ResponseSaveRequest(BaseModel):
    inspection_id: int
    checklist_id: int
    result: str
    description: Optional[str] = None
    photo_id: Optional[int] = None

class InspectionDetailResponse(BaseModel):
    inspection_id: int
    part_number: str
    serial_number: str
    status: str
    current_step: int
    responses: list
