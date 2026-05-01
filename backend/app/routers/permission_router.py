from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.permission import PermissionCreate, PermissionResponse, PermissionAssign, PermissionUpdate
from app.services.permission_service import (
    create_permission,
    get_permissions,
    get_permission_by_id,
    update_permission,
    delete_permission,
    assign_permission_to_role,
    remove_permission_from_role,
)
from app.security.dependencies import get_db, require_permission

router = APIRouter()

@router.post("/", response_model=PermissionResponse)
def create(data: PermissionCreate, db: Session = Depends(get_db), _=Depends(require_permission("permissions:create"))):
    return create_permission(db, data)

@router.get("/", response_model=list[PermissionResponse])
def list_permissions(db: Session = Depends(get_db), _=Depends(require_permission("permissions:read"))):
    return get_permissions(db)

@router.get("/{permission_id}", response_model=PermissionResponse)
def get_permission(permission_id: int, db: Session = Depends(get_db), _=Depends(require_permission("permissions:read"))):
    permission = get_permission_by_id(db, permission_id)
    if permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission

@router.put("/{permission_id}", response_model=PermissionResponse)
def edit_permission(permission_id: int, data: PermissionUpdate, db: Session = Depends(get_db), _=Depends(require_permission("permissions:update"))):
    permission = update_permission(db, permission_id, data)
    if permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission

@router.delete("/{permission_id}", status_code=204)
def remove_permission(permission_id: int, db: Session = Depends(get_db), _=Depends(require_permission("permissions:delete"))):
    if not delete_permission(db, permission_id):
        raise HTTPException(status_code=404, detail="Permission not found")

@router.post("/roles/{role_id}/assign", response_model=PermissionResponse)
def assign(role_id: int, data: PermissionAssign, db: Session = Depends(get_db), _=Depends(require_permission("roles:assign_permission"))):
    result = assign_permission_to_role(db, role_id, data.permission_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Role or permission not found")
    return result

@router.delete("/roles/{role_id}/{permission_id}", status_code=204)
def unassign(role_id: int, permission_id: int, db: Session = Depends(get_db), _=Depends(require_permission("roles:remove_permission"))):
    if not remove_permission_from_role(db, role_id, permission_id):
        raise HTTPException(status_code=404, detail="Role or permission not found")
