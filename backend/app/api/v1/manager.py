from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_role
from app.schemas.manager import DashboardStatsResponse, ChecklistCreate, ChecklistUpdate, ChecklistResponse, InspectionListItem
from app.schemas.operator import ResponseSaveRequest
from app.services import manager_service, operator_service
from app.models.user import User
from app.utils.helpers import log_audit

router = APIRouter(tags=["manager"])

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard(current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    return manager_service.get_dashboard_stats(db)

@router.get("/inspections", response_model=list[InspectionListItem])
def get_inspections(current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    return manager_service.get_inspections(db)

@router.get("/inspection/{inspection_id}")
def get_inspection_details(inspection_id: int, current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    return operator_service.get_inspection(db, inspection_id)

@router.get("/checklist", response_model=list[ChecklistResponse])
def get_checklist(current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    return manager_service.get_checklist_all(db)

@router.post("/checklist", response_model=ChecklistResponse)
def create_checklist(req: ChecklistCreate, current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    return manager_service.create_checklist(db, current_user.user_id, req.model_dump())

@router.put("/checklist/{item_id}", response_model=ChecklistResponse)
def update_checklist(item_id: int, req: ChecklistUpdate, current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    return manager_service.update_checklist(db, current_user.user_id, item_id, req.model_dump(exclude_unset=True))

@router.delete("/checklist/{item_id}")
def delete_checklist(item_id: int, current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    manager_service.delete_checklist(db, current_user.user_id, item_id)
    return {"message": "Deleted"}

@router.put("/inspection/response")
def save_response(req: ResponseSaveRequest, current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    log_audit(db, current_user.user_id, "INSPECTION", req.inspection_id, "MANAGER_ENTERED_OPERATOR_MODE", "Manager interacted with inspection")
    db.commit()
    return operator_service.save_response(db, current_user.user_id, req, role="MANAGER")

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/inspection/photo")
def upload_photo(
    inspection_id: int = Form(...),
    checklist_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("MANAGER")),
    db: Session = Depends(get_db)
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG/JPEG/PNG allowed.")
    
    data = file.file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
        
    photo = operator_service.save_photo(db, current_user.user_id, inspection_id, checklist_id, file, data, role="MANAGER")
    return {"photo_id": photo.photo_id}

@router.delete("/inspection/photo/{photo_id}")
def delete_photo(photo_id: int, current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    operator_service.delete_photo(db, current_user.user_id, photo_id, role="MANAGER")
    return {"message": "Deleted"}

@router.post("/inspection/{inspection_id}/submit")
def submit(inspection_id: int, current_user: User = Depends(require_role("MANAGER")), db: Session = Depends(get_db)):
    operator_service.submit_inspection(db, current_user.user_id, inspection_id, role="MANAGER")
    return {"message": "Submitted"}
