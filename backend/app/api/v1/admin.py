from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_role
from app.schemas.admin import AdminDashboardStats, UserCreate, UserUpdate, PasswordUpdate, UserResponse, AuditLogResponse
from app.schemas.manager import InspectionListItem
from app.services import admin_service, manager_service, operator_service
from app.models.user import User

router = APIRouter(tags=["admin"])

@router.get("/dashboard", response_model=AdminDashboardStats)
def get_dashboard(current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return admin_service.get_dashboard_stats(db)

@router.get("/users", response_model=list[UserResponse])
def get_users(current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return admin_service.get_users(db)

@router.post("/users", response_model=UserResponse)
def create_user(req: UserCreate, current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return admin_service.create_user(db, current_user.user_id, req.model_dump())

@router.put("/users/{id}", response_model=UserResponse)
def update_user(id: int, req: UserUpdate, current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return admin_service.update_user(db, current_user.user_id, id, req.model_dump(exclude_unset=True))

@router.patch("/users/{id}/activate")
def activate_user(id: int, current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    admin_service.activate_user(db, current_user.user_id, id)
    return {"message": "Activated"}

@router.patch("/users/{id}/deactivate")
def deactivate_user(id: int, current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    admin_service.deactivate_user(db, current_user.user_id, id)
    return {"message": "Deactivated"}

@router.patch("/users/{id}/password")
def reset_password(id: int, req: PasswordUpdate, current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    admin_service.reset_password(db, current_user.user_id, id, req.password)
    return {"message": "Password reset successfully"}

@router.get("/users/{id}/password")
def get_password(id: int, current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return admin_service.get_password(db, current_user.user_id, id)

@router.get("/inspections", response_model=list[InspectionListItem])
def get_inspections(current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return manager_service.get_inspections(db)

@router.get("/inspection/{inspection_id}")
def get_inspection_details(inspection_id: int, current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return operator_service.get_inspection(db, inspection_id)

@router.get("/checklist")
def get_checklist(current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return manager_service.get_checklist_all(db)

@router.get("/audit", response_model=list[AuditLogResponse])
def get_audit_logs(current_user: User = Depends(require_role("ADMIN")), db: Session = Depends(get_db)):
    return admin_service.get_audit_logs(db)

