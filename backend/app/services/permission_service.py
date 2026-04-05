from sqlalchemy.orm import Session
from app.models.permission import Permission
from app.models.role import Role
from app.schemas.permission import PermissionCreate

def create_permission(db: Session, data: PermissionCreate):
    db_permission = Permission(name=data.name, description=data.description)
    db.add(db_permission)
    db.commit()
    db.refresh(db_permission)
    return db_permission

def get_permissions(db: Session):
    return db.query(Permission).all()

def get_permission_by_id(db: Session, permission_id: int):
    return db.query(Permission).filter(Permission.id == permission_id).first()

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