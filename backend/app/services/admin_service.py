from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.audit import Audit
from fastapi import HTTPException
from app.utils.helpers import log_audit
from datetime import datetime

def get_dashboard_stats(db: Session):
    total = db.query(User).count()
    operators = db.query(User).join(Role).filter(Role.role_name == "OPERATOR").count()
    managers = db.query(User).join(Role).filter(Role.role_name == "MANAGER").count()
    admins = db.query(User).join(Role).filter(Role.role_name == "ADMIN").count()
    return {
        "total_users": total,
        "operators": operators,
        "managers": managers,
        "admins": admins
    }

def get_users(db: Session):
    users = db.query(User, Role).join(Role, User.role_id == Role.role_id).order_by(User.created_at.desc()).all()
    return [
        {
            "user_id": u.user_id,
            "employee_id": u.employee_id,
            "full_name": u.full_name,
            "role": r.role_name,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "updated_at": u.updated_at
        } for u, r in users
    ]

def create_user(db: Session, admin_id: int, data: dict):
    if not data["employee_id"].strip() or not data["password"].strip() or not data["role"].strip():
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    existing = db.query(User).filter(User.employee_id == data["employee_id"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
        
    role = db.query(Role).filter(Role.role_name == data["role"]).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")
        
    user = User(
        employee_id=data["employee_id"],
        full_name=data["full_name"],
        password=data["password"],
        role_id=role.role_id,
        is_active=data["is_active"]
    )
    db.add(user)
    db.flush()
    log_audit(db, admin_id, "USER", user.user_id, "USER_CREATED", f"Created user {user.employee_id}")
    db.commit()
    db.refresh(user)
    return {
        "user_id": user.user_id,
        "employee_id": user.employee_id,
        "full_name": user.full_name,
        "role": role.role_name,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

def update_user(db: Session, admin_id: int, user_id: int, data: dict):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if admin_id == user_id and data.get("role"):
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    if data.get("full_name"): user.full_name = data["full_name"]
    if data.get("is_active") is not None:
        if admin_id == user_id and data["is_active"] == 0:
             raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
        user.is_active = data["is_active"]
    if data.get("role"):
        role = db.query(Role).filter(Role.role_name == data["role"]).first()
        if not role: raise HTTPException(status_code=400, detail="Invalid role")
        user.role_id = role.role_id
        
    user.updated_at = datetime.utcnow()
    log_audit(db, admin_id, "USER", user_id, "USER_UPDATED", f"Updated user {user.employee_id}")
    db.commit()
    return get_user_by_id(db, user_id)

def get_user_by_id(db: Session, user_id: int):
    u, r = db.query(User, Role).join(Role, User.role_id == Role.role_id).filter(User.user_id == user_id).first()
    return {
        "user_id": u.user_id,
        "employee_id": u.employee_id,
        "full_name": u.full_name,
        "role": r.role_name,
        "is_active": u.is_active,
        "created_at": u.created_at,
        "updated_at": u.updated_at
    }

def activate_user(db: Session, admin_id: int, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    user.is_active = 1
    user.updated_at = datetime.utcnow()
    log_audit(db, admin_id, "USER", user_id, "USER_ACTIVATED", f"Activated user {user.employee_id}")
    db.commit()

def deactivate_user(db: Session, admin_id: int, user_id: int):
    if admin_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    user.is_active = 0
    user.updated_at = datetime.utcnow()
    log_audit(db, admin_id, "USER", user_id, "USER_DEACTIVATED", f"Deactivated user {user.employee_id}")
    db.commit()

def reset_password(db: Session, admin_id: int, user_id: int, new_pwd: str):
    if not new_pwd.strip():
        raise HTTPException(status_code=400, detail="Password cannot be empty")
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    user.password = new_pwd
    user.updated_at = datetime.utcnow()
    log_audit(db, admin_id, "USER", user_id, "PASSWORD_RESET", f"Password reset for {user.employee_id}")
    db.commit()

def get_password(db: Session, admin_id: int, user_id: int):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    log_audit(db, admin_id, "USER", user_id, "PASSWORD_VIEWED", f"Viewed password for {user.employee_id}")
    db.commit()
    return {"password": user.password}

def get_audit_logs(db: Session):
    logs = db.query(Audit, User).join(User, Audit.user_id == User.user_id).order_by(Audit.created_at.desc()).all()
    return [
        {
            "audit_id": a.audit_id,
            "timestamp": a.created_at,
            "employee_id": u.employee_id,
            "full_name": u.full_name,
            "action": a.action,
            "entity": a.entity,
            "description": a.description
        } for a, u in logs
    ]
