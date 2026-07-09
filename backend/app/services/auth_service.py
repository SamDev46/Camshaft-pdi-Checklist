from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import create_access_token
from app.utils.helpers import log_audit
from fastapi import HTTPException, status
from datetime import datetime

def authenticate_user(db: Session, employee_id: str, password: str):
    user = db.query(User).filter(User.employee_id == employee_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Employee ID or Password.")
    if user.password != password:
        log_audit(db, user.user_id, "AUTH", user.user_id, "FAILED_LOGIN", "Invalid password attempt")
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Employee ID or Password.")
    if user.is_active != 1:
        log_audit(db, user.user_id, "AUTH", user.user_id, "INACTIVE_USER_LOGIN", "Inactive user attempted login")
        db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is inactive.")
    return user

def login(db: Session, employee_id: str, password: str):
    user = authenticate_user(db, employee_id, password)
    log_audit(db, user.user_id, "AUTH", user.user_id, "LOGIN", "Successful login")
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    access_token = create_access_token(data={"sub": str(user.user_id), "role": user.role.role_name})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "employee_id": user.employee_id,
        "full_name": user.full_name,
        "role": user.role.role_name
    }

def logout(db: Session, user_id: int):
    log_audit(db, user_id, "AUTH", user_id, "LOGOUT", "Successful logout")
    db.commit()
