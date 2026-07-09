from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, LargeBinary
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base

class Checklist(Base):
    __tablename__ = "tcl_cam_checklist"
    checklist_id = Column("checklist_id", Integer, primary_key=True, index=True)
    question = Column("question", String, nullable=False)
    sequence_no = Column("sequence_no", Integer, unique=True, nullable=False)
    photo_required = Column("photo_required", Integer, default=0)
    is_active = Column("is_active", Integer, default=1)
    created_by_user_id = Column("created_by_user_id", Integer, ForeignKey("tcl_cam_user.user_id"))
    created_at = Column("created_at", TIMESTAMP, server_default=func.now())
    updated_at = Column("updated_at", TIMESTAMP, onupdate=func.now())

class Inspection(Base):
    __tablename__ = "tcl_cam_inspection"
    inspection_id = Column("inspection_id", Integer, primary_key=True, index=True)
    part_number = Column("part_number", String, index=True, nullable=False)
    serial_number = Column("serial_number", String, index=True, nullable=False)
    vendor_code = Column("vendor_code", String)
    operator_id = Column("operator_id", Integer, ForeignKey("tcl_cam_user.user_id"))
    status = Column("status", String, nullable=False)
    current_step = Column("current_step", Integer, default=0)
    started_at = Column("started_at", TIMESTAMP, server_default=func.now())
    submitted_at = Column("submitted_at", TIMESTAMP)
    updated_at = Column("updated_at", TIMESTAMP, onupdate=func.now())

    responses = relationship("Response", back_populates="inspection")

class Photo(Base):
    __tablename__ = "tcl_cam_photo"
    photo_id = Column("photo_id", Integer, primary_key=True, index=True)
    inspection_id = Column("inspection_id", Integer, ForeignKey("tcl_cam_inspection.inspection_id"))
    checklist_id = Column("checklist_id", Integer, ForeignKey("tcl_cam_checklist.checklist_id"))
    file_name = Column("file_name", String, nullable=False)
    content_type = Column("content_type", String, nullable=False)
    file_size = Column("file_size", Integer)
    image_data = Column("image_data", LargeBinary)
    created_at = Column("created_at", TIMESTAMP, server_default=func.now())

class Response(Base):
    __tablename__ = "tcl_cam_response"
    response_id = Column("response_id", Integer, primary_key=True, index=True)
    inspection_id = Column("inspection_id", Integer, ForeignKey("tcl_cam_inspection.inspection_id"))
    checklist_id = Column("checklist_id", Integer, ForeignKey("tcl_cam_checklist.checklist_id"))
    result = Column("result", String, nullable=False)
    description = Column("description", String)
    photo_id = Column("photo_id", Integer, ForeignKey("tcl_cam_photo.photo_id"))
    created_at = Column("created_at", TIMESTAMP, server_default=func.now())
    updated_at = Column("updated_at", TIMESTAMP, onupdate=func.now())

    inspection = relationship("Inspection", back_populates="responses")
    photo = relationship("Photo")
