from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.role import RoleCreate, RoleResponse
from app.services.role_service import create_role, get_roles, get_role_by_id
from app.security.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=RoleResponse)
def role(role_data: RoleCreate, db: Session = Depends(get_db)):
    return create_role(db, role_data)

@router.get("/", response_model=list[RoleResponse])
def list_roles(db: Session = Depends(get_db)):
    return get_roles(db)

@router.get("/{role_id}", response_model=RoleResponse)
def get_role(role_id: int, db: Session = Depends(get_db)):
    return get_role_by_id(db, role_id)