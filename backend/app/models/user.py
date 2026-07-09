from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class Role(Base):
    __tablename__ = "tcl_cam_role"
    role_id = Column("role_id", Integer, primary_key=True, index=True)
    role_name = Column("role_name", String, nullable=False)
    description = Column("description", String)
    created_at = Column("created_at", TIMESTAMP)

class User(Base):
    __tablename__ = "tcl_cam_user"
    user_id = Column("user_id", Integer, primary_key=True, index=True)
    employee_id = Column("employee_id", String, unique=True, index=True, nullable=False)
    full_name = Column("full_name", String, nullable=False)
    password = Column("password", String, nullable=False)
    role_id = Column("role_id", Integer, ForeignKey("tcl_cam_role.role_id"))
    is_active = Column("is_active", Integer, default=1)
    last_login = Column("last_login", TIMESTAMP)
    created_at = Column("created_at", TIMESTAMP, server_default=func.now())
    updated_at = Column("updated_at", TIMESTAMP, onupdate=func.now())

    role = relationship("Role")
