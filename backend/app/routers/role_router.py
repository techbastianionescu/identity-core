from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.role import RoleCreate, RoleResponse, RoleUpdate
from app.services.role_service import create_role, get_roles, get_role_by_id, update_role, delete_role
from app.security.dependencies import get_db, require_permission

router = APIRouter()

@router.post("/", response_model=RoleResponse)
def role(role_data: RoleCreate, db: Session = Depends(get_db), _=Depends(require_permission("roles:create"))):
    return create_role(db, role_data)

@router.get("/", response_model=list[RoleResponse])
def list_roles(db: Session = Depends(get_db), _=Depends(require_permission("roles:read"))):
    return get_roles(db)

@router.get("/{role_id}", response_model=RoleResponse)
def get_role(role_id: int, db: Session = Depends(get_db), _=Depends(require_permission("roles:read"))):
    role = get_role_by_id(db, role_id)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.put("/{role_id}", response_model=RoleResponse)
def edit_role(role_id: int, data: RoleUpdate, db: Session = Depends(get_db), _=Depends(require_permission("roles:update"))):
    role = update_role(db, role_id, data)
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.delete("/{role_id}", status_code=204)
def remove_role(role_id: int, db: Session = Depends(get_db), _=Depends(require_permission("roles:delete"))):
    if not delete_role(db, role_id):
        raise HTTPException(status_code=404, detail="Role not found")
