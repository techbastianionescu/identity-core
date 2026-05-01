from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.models.permission import Permission
from app.models.role import Role
from app.schemas.permission import PermissionCreate, PermissionUpdate

def create_permission(db: Session, data: PermissionCreate):
    db_permission = Permission(name=data.name, description=data.description)
    db.add(db_permission)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Permission already exists")
    db.refresh(db_permission)
    return db_permission

def get_permissions(db: Session):
    return db.query(Permission).all()

def get_permission_by_id(db: Session, permission_id: int):
    return db.query(Permission).filter(Permission.id == permission_id).first()

def update_permission(db: Session, permission_id: int, data: PermissionUpdate) -> Permission | None:
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if permission is None:
        return None
    if data.name is not None:
        permission.name = data.name
    if data.description is not None:
        permission.description = data.description
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Permission already exists")
    db.refresh(permission)
    return permission

def delete_permission(db: Session, permission_id: int) -> bool:
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if permission is None:
        return False
    db.delete(permission)
    db.commit()
    return True

def assign_permission_to_role(db: Session, role_id: int, permission_id: int):
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        return None
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if permission is None:
        return None
    if permission not in role.permissions:
        role.permissions.append(permission)
        db.commit()
        db.refresh(role)
    return permission

def remove_permission_from_role(db: Session, role_id: int, permission_id: int) -> bool:
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        return False
    permission = db.query(Permission).filter(Permission.id == permission_id).first()
    if permission is None:
        return False
    if permission in role.permissions:
        role.permissions.remove(permission)
        db.commit()
    return True
