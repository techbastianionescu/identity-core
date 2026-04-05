from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.permission import PermissionCreate, PermissionResponse, PermissionAssign  
from app.services.permission_service import create_permission, get_permissions, get_permission_by_id, assign_permission_to_role
from app.security.dependencies import get_db

router = APIRouter()

@router.post("/", response_model=PermissionResponse)
def create(data: PermissionCreate, db: Session = Depends(get_db)):
    return create_permission(db, data)

@router.get("/", response_model=list[PermissionResponse])
def list_permissions(db: Session = Depends(get_db)):
    return get_permissions(db)

@router.get("/{permission_id}", response_model=PermissionResponse)
def get_permission(permission_id: int, db: Session = Depends(get_db)):
    permission = get_permission_by_id(db, permission_id)
    if permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission

@router.post("/roles/{role_id}/assign", response_model=PermissionResponse)
def assign(role_id: int, data: PermissionAssign, db: Session = Depends(get_db)):
    result = assign_permission_to_role(db, role_id, data.permission_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Role or permission not found")        
    return result