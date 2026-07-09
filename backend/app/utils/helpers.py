from sqlalchemy.orm import Session
from app.models.audit import Audit

def log_audit(db: Session, user_id: int, entity: str, entity_id: int, action: str, desc: str):
    audit = Audit(user_id=user_id, entity=entity, entity_id=entity_id, action=action, description=desc)
    db.add(audit)
