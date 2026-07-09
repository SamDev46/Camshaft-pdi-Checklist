from sqlalchemy.orm import Session
from app.models.inspection import Inspection, Checklist, Response, Photo
from app.models.user import User
from fastapi import HTTPException
from app.utils.helpers import log_audit
from datetime import datetime

def get_dashboard_stats(db: Session):
    total = db.query(Inspection).count()
    in_progress = db.query(Inspection).filter(Inspection.status == 'IN_PROGRESS').count()
    submitted = db.query(Inspection).filter(Inspection.status == 'SUBMITTED').count()
    return {
        "total": total,
        "in_progress": in_progress,
        "submitted": submitted
    }

def get_inspections(db: Session):
    # Queries the logic of VW_TCL_CAM_INSPECTION_MONITOR directly via ORM for ease of pagination/search
    res = db.query(Inspection, User).join(User, Inspection.operator_id == User.user_id).order_by(Inspection.started_at.desc()).all()
    return [
        {
            "inspection_id": i.inspection_id,
            "part_number": i.part_number,
            "serial_number": i.serial_number,
            "vendor_code": i.vendor_code,
            "operator_name": u.full_name,
            "status": i.status,
            "current_step": i.current_step,
            "started_at": i.started_at,
            "submitted_at": i.submitted_at
        } for i, u in res
    ]

def get_checklist_all(db: Session):
    return db.query(Checklist).filter(Checklist.is_active == 1).order_by(Checklist.sequence_no).all()

def create_checklist(db: Session, user_id: int, data: dict):
    # Reorder existing if sequence conflict
    conflict = db.query(Checklist).filter(Checklist.sequence_no >= data["sequence_no"], Checklist.is_active == 1).order_by(Checklist.sequence_no).all()
    for c in conflict:
        c.sequence_no += 1
    
    new_item = Checklist(
        question=data["question"],
        sequence_no=data["sequence_no"],
        photo_required=data["photo_required"],
        created_by_user_id=user_id
    )
    db.add(new_item)
    db.flush()
    log_audit(db, user_id, "CHECKLIST", new_item.checklist_id, "CHECKLIST_CREATED", "Created checklist question")
    db.commit()
    db.refresh(new_item)
    return new_item

def update_checklist(db: Session, user_id: int, item_id: int, data: dict):
    item = db.query(Checklist).filter(Checklist.checklist_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist not found")
    
    if data.get("sequence_no") and data["sequence_no"] != item.sequence_no:
        # Reorder logic
        new_seq = data["sequence_no"]
        if new_seq > item.sequence_no:
            others = db.query(Checklist).filter(Checklist.sequence_no > item.sequence_no, Checklist.sequence_no <= new_seq, Checklist.is_active == 1).all()
            for o in others: o.sequence_no -= 1
        else:
            others = db.query(Checklist).filter(Checklist.sequence_no >= new_seq, Checklist.sequence_no < item.sequence_no, Checklist.is_active == 1).all()
            for o in others: o.sequence_no += 1
        item.sequence_no = new_seq

    if data.get("question"): item.question = data["question"]
    if data.get("photo_required") is not None: item.photo_required = data["photo_required"]
    item.updated_at = datetime.utcnow()
    
    db.flush()
    log_audit(db, user_id, "CHECKLIST", item_id, "CHECKLIST_UPDATED", "Updated checklist question")
    db.commit()
    return item

def delete_checklist(db: Session, user_id: int, item_id: int):
    item = db.query(Checklist).filter(Checklist.checklist_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist not found")
    item.is_active = 0
    item.updated_at = datetime.utcnow()
    log_audit(db, user_id, "CHECKLIST", item_id, "CHECKLIST_DISABLED", "Soft deleted checklist question")
    db.commit()
