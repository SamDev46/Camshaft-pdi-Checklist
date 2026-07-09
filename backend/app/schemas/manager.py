from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DashboardStatsResponse(BaseModel):
    total: int
    in_progress: int
    submitted: int

class ChecklistCreate(BaseModel):
    question: str
    sequence_no: int
    photo_required: int

class ChecklistUpdate(BaseModel):
    question: Optional[str] = None
    sequence_no: Optional[int] = None
    photo_required: Optional[int] = None
    is_active: Optional[int] = None

class ChecklistResponse(BaseModel):
    checklist_id: int
    question: str
    sequence_no: int
    photo_required: int
    is_active: int
    created_at: datetime

class InspectionListItem(BaseModel):
    inspection_id: int
    part_number: str
    serial_number: str
    vendor_code: str
    operator_name: str
    status: str
    current_step: int
    started_at: datetime
    submitted_at: Optional[datetime] = None
