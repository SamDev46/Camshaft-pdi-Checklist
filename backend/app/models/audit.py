from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class Audit(Base):
    __tablename__ = "tcl_cam_audit"
    audit_id = Column("audit_id", Integer, primary_key=True, index=True)
    user_id = Column("user_id", Integer, ForeignKey("tcl_cam_user.user_id"))
    entity = Column("entity", String)
    entity_id = Column("entity_id", Integer)
    action = Column("action", String)
    description = Column("description", String)
    created_at = Column("created_at", TIMESTAMP, server_default=func.now())
