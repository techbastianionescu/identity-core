from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.role import RoleAssign
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import create_user, assign_role
from app.models.user import User
from app.security.dependencies import get_current_user, get_db

router = APIRouter()
        
@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user_data)
    
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/{user_id}/role", response_model=UserResponse)
def assign_user_role(user_id: int, role_data: RoleAssign, db: Session = Depends(get_db)):
    return assign_role(db, user_id, role_data.role_id)