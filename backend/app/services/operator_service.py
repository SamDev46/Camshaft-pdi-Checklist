from sqlalchemy.orm import Session
from app.models.inspection import Inspection, Checklist, Response, Photo
from app.schemas.operator import ResponseSaveRequest
from fastapi import HTTPException, status, UploadFile
from app.utils.helpers import log_audit
from datetime import datetime

def parse_qr(qr_text: str):
    parts = qr_text.split(";")
    if len(parts) != 3 or any(not p.strip() for p in parts):
        raise HTTPException(status_code=400, detail="Invalid QR Format. Expected PART_NUMBER;SERIAL_NUMBER;VENDOR_CODE")
    return parts[0], parts[1], parts[2]

def process_inspection_qr(db: Session, user_id: int, qr_text: str):
    part, serial, vendor = parse_qr(qr_text)
    # Only resume if IN_PROGRESS — submitted inspections are read-only
    inspection = db.query(Inspection).filter(
        Inspection.part_number == part,
        Inspection.serial_number == serial,
        Inspection.status == "IN_PROGRESS"
    ).first()
    if inspection:
        log_audit(db, user_id, "INSPECTION", inspection.inspection_id, "INSPECTION_RESUMED", f"Resumed inspection for {part}-{serial}")
        db.commit()
        return inspection
    
    # Create new
    inspection = Inspection(part_number=part, serial_number=serial, vendor_code=vendor, operator_id=user_id, status="IN_PROGRESS", current_step=1, started_at=datetime.utcnow())
    db.add(inspection)
    db.flush()
    log_audit(db, user_id, "INSPECTION", inspection.inspection_id, "INSPECTION_CREATED", f"Created inspection for {part}-{serial}")
    db.commit()
    db.refresh(inspection)
    return inspection

def get_checklist(db: Session):
    return db.query(Checklist).filter(Checklist.is_active == 1).order_by(Checklist.sequence_no).all()

def get_inspection(db: Session, inspection_id: int):
    inspection = db.query(Inspection).filter(Inspection.inspection_id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    
    responses = db.query(Response).filter(Response.inspection_id == inspection_id).all()
    photos = db.query(Photo).filter(Photo.inspection_id == inspection_id).all()
    
    res_dict = {r.checklist_id: {"checklist_id": r.checklist_id, "result": r.result, "description": r.description, "photo_id": r.photo_id} for r in responses}
    
    # Merge photos that were uploaded before a response was saved
    for p in photos:
        if p.checklist_id not in res_dict:
            res_dict[p.checklist_id] = {"checklist_id": p.checklist_id, "result": None, "description": "", "photo_id": p.photo_id}
        elif not res_dict[p.checklist_id]["photo_id"]:
            res_dict[p.checklist_id]["photo_id"] = p.photo_id
            
    res_list = list(res_dict.values())
    
    return {
        "inspection_id": inspection.inspection_id,
        "part_number": inspection.part_number,
        "serial_number": inspection.serial_number,
        "status": inspection.status,
        "current_step": inspection.current_step,
        "responses": res_list
    }

def save_response(db: Session, user_id: int, req: ResponseSaveRequest, role: str = "OPERATOR"):
    inspection = db.query(Inspection).filter(Inspection.inspection_id == req.inspection_id).first()
    if not inspection or inspection.status != "IN_PROGRESS":
        raise HTTPException(status_code=400, detail="Cannot edit submitted inspection")
    
    response = db.query(Response).filter(Response.inspection_id == req.inspection_id, Response.checklist_id == req.checklist_id).first()
    
    photo = db.query(Photo).filter(Photo.inspection_id == req.inspection_id, Photo.checklist_id == req.checklist_id).order_by(Photo.photo_id.desc()).first()
    current_photo_id = req.photo_id or (photo.photo_id if photo else None)
    
    if response:
        response.result = req.result
        response.description = req.description
        if current_photo_id: 
            response.photo_id = current_photo_id
        response.updated_at = datetime.utcnow()
    else:
        resp_data = req.model_dump()
        resp_data["photo_id"] = current_photo_id
        response = Response(**resp_data)
        db.add(response)
    
    chk = db.query(Checklist).filter(Checklist.checklist_id == req.checklist_id).first()
    if chk.sequence_no >= inspection.current_step:
        inspection.current_step = chk.sequence_no + 1
    inspection.updated_at = datetime.utcnow()
    
    db.flush()
    action = "MANAGER_EDITED_RESPONSE" if role == "MANAGER" else "RESPONSE_SAVED"
    log_audit(db, user_id, "RESPONSE", response.response_id, action, f"Saved response for checklist {req.checklist_id}")
    db.commit()
    return {"message": "Saved successfully", "current_step": inspection.current_step}

def save_photo(db: Session, user_id: int, inspection_id: int, checklist_id: int, file: UploadFile, image_data: bytes, role: str = "OPERATOR"):
    inspection = db.query(Inspection).filter(Inspection.inspection_id == inspection_id).first()
    if not inspection or inspection.status != "IN_PROGRESS":
        raise HTTPException(status_code=400, detail="Cannot edit submitted inspection")
    
    if len(image_data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (Limit 10MB)")
    if file.content_type not in ["image/jpeg", "image/jpg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only JPG/PNG allowed")
    
    photo = Photo(
        inspection_id=inspection_id,
        checklist_id=checklist_id,
        file_name=file.filename,
        content_type=file.content_type,
        file_size=len(image_data),
        image_data=image_data
    )
    db.add(photo)
    db.flush()

    resp = db.query(Response).filter(
        Response.inspection_id == inspection_id,
        Response.checklist_id == checklist_id
    ).first()
    if resp:
        resp.photo_id = photo.photo_id
        resp.updated_at = datetime.utcnow()

    action = "MANAGER_UPLOADED_PHOTO" if role == "MANAGER" else "PHOTO_UPLOADED"
    log_audit(db, user_id, "PHOTO", photo.photo_id, action, f"Uploaded photo for inspection {inspection_id}")
    db.commit()
    db.refresh(photo)
    return photo

def delete_photo(db: Session, user_id: int, photo_id: int, role: str = "OPERATOR"):
    photo = db.query(Photo).filter(Photo.photo_id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    inspection = db.query(Inspection).filter(Inspection.inspection_id == photo.inspection_id).first()
    if not inspection or inspection.status != "IN_PROGRESS":
        raise HTTPException(status_code=400, detail="Cannot edit submitted inspection")
    
    resp = db.query(Response).filter(Response.photo_id == photo_id).first()
    if resp:
        resp.photo_id = None
    
    db.delete(photo)
    action = "MANAGER_REPLACED_PHOTO" if role == "MANAGER" else "PHOTO_DELETED"
    log_audit(db, user_id, "PHOTO", photo_id, action, "Deleted photo")
    db.commit()

def get_photo(db: Session, photo_id: int):
    photo = db.query(Photo).filter(Photo.photo_id == photo_id).first()
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")
    return photo

def submit_inspection(db: Session, user_id: int, inspection_id: int, role: str = "OPERATOR"):
    inspection = db.query(Inspection).filter(Inspection.inspection_id == inspection_id).first()
    if not inspection or inspection.status != "IN_PROGRESS":
        raise HTTPException(status_code=400, detail="Invalid inspection")
    
    checklists = db.query(Checklist).filter(Checklist.is_active == 1).all()
    responses = {r.checklist_id: r for r in db.query(Response).filter(Response.inspection_id == inspection_id).all()}
    
    for c in checklists:
        r = responses.get(c.checklist_id)
        if not r:
            raise HTTPException(status_code=400, detail=f"Missing response for question {c.sequence_no}")
        if r.result == "NOT_OK" and not r.description:
            raise HTTPException(status_code=400, detail=f"Missing description for NOT OK on question {c.sequence_no}")
        if c.photo_required == 1 and not r.photo_id:
            raise HTTPException(status_code=400, detail=f"Missing photo for question {c.sequence_no}")
            
    inspection.status = "SUBMITTED"
    inspection.submitted_at = datetime.utcnow()
    action = "MANAGER_SUBMITTED_INSPECTION" if role == "MANAGER" else "INSPECTION_SUBMITTED"
    log_audit(db, user_id, "INSPECTION", inspection_id, action, "Submitted inspection")
    db.commit()
