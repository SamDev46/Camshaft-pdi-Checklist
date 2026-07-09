from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, LoginResponse, UserResponse
from app.api.dependencies import get_db, get_current_user
from app.services import auth_service
from app.models.user import User
from fastapi import HTTPException

router = APIRouter(tags=["auth"])

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, request.employee_id, request.password)

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    auth_service.logout(db, current_user.user_id)
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "user_id": current_user.user_id,
        "employee_id": current_user.employee_id,
        "full_name": current_user.full_name,
        "role": current_user.role.role_name
    }

@router.post("/refresh")
def refresh_token():
    raise HTTPException(status_code=501, detail="Not Implemented")
