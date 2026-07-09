from fastapi import APIRouter
from app.api.v1 import health, auth, operator, manager, admin

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(operator.router, prefix="/operator", tags=["operator"])
api_router.include_router(manager.router, prefix="/manager", tags=["manager"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
