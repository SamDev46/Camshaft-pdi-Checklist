from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AdminDashboardStats(BaseModel):
    total_users: int
    operators: int
    managers: int
    admins: int

class UserCreate(BaseModel):
    employee_id: str
    full_name: str
    password: str
    role: str
    is_active: int

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[int] = None

class PasswordUpdate(BaseModel):
    password: str

class UserResponse(BaseModel):
    user_id: int
    employee_id: str
    full_name: str
    role: str
    is_active: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class AuditLogResponse(BaseModel):
    audit_id: int
    timestamp: datetime
    employee_id: str
    full_name: str
    action: str
    entity: str
    description: str
