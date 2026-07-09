from pydantic import BaseModel

class LoginRequest(BaseModel):
    employee_id: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    employee_id: str
    full_name: str
    role: str

class UserResponse(BaseModel):
    user_id: int
    employee_id: str
    full_name: str
    role: str
