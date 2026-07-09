from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Response
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_role
from app.schemas.operator import QRRequest, InspectionStartResponse, ChecklistItem, ResponseSaveRequest, InspectionDetailResponse
from app.services import operator_service
from app.models.user import User

router = APIRouter(tags=["operator"])

@router.post("/inspection", response_model=InspectionStartResponse)
def process_qr(req: QRRequest, current_user: User = Depends(require_role("OPERATOR")), db: Session = Depends(get_db)):
    return operator_service.process_inspection_qr(db, current_user.user_id, req.qr_text)

@router.get("/checklist", response_model=list[ChecklistItem])
def get_checklist(current_user: User = Depends(require_role("OPERATOR")), db: Session = Depends(get_db)):
    return operator_service.get_checklist(db)

@router.get("/inspection/{inspection_id}", response_model=InspectionDetailResponse)
def get_inspection(inspection_id: int, current_user: User = Depends(require_role("OPERATOR")), db: Session = Depends(get_db)):
    return operator_service.get_inspection(db, inspection_id)

@router.put("/response")
def save_response(req: ResponseSaveRequest, current_user: User = Depends(require_role("OPERATOR")), db: Session = Depends(get_db)):
    return operator_service.save_response(db, current_user.user_id, req)

ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/photos")
def upload_photo(
    inspection_id: int = Form(...),
    checklist_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("OPERATOR")),
    db: Session = Depends(get_db)
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG/JPEG/PNG allowed.")
    
    data = file.file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
        
    photo = operator_service.save_photo(db, current_user.user_id, inspection_id, checklist_id, file, data)
    return {"photo_id": photo.photo_id}

@router.get("/photos/{photo_id}")
def get_photo(photo_id: int, db: Session = Depends(get_db)):
    photo = operator_service.get_photo(db, photo_id)
    return Response(content=photo.image_data, media_type=photo.content_type)

@router.delete("/photos/{photo_id}")
def delete_photo(photo_id: int, current_user: User = Depends(require_role("OPERATOR")), db: Session = Depends(get_db)):
    operator_service.delete_photo(db, current_user.user_id, photo_id)
    return {"message": "Deleted"}

@router.post("/inspection/{inspection_id}/submit")
def submit(inspection_id: int, current_user: User = Depends(require_role("OPERATOR")), db: Session = Depends(get_db)):
    operator_service.submit_inspection(db, current_user.user_id, inspection_id)
    return {"message": "Submitted"}
