from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.models.role import Role
from app.models.user import User
from app.schemas.role import RoleCreate, RoleUpdate

def create_role(db: Session, role_data: RoleCreate):
    db_role = Role(name=role_data.name)
    db.add(db_role)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Role already exists")
    db.refresh(db_role)
    return db_role

def get_roles(db: Session):
    return db.query(Role).all()

def get_role_by_id(db: Session, role_id: int):
    return db.query(Role).filter(Role.id == role_id).first()

def update_role(db: Session, role_id: int, data: RoleUpdate) -> Role | None:
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        return None
    role.name = data.name
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Role already exists")
    db.refresh(role)
    return role

def delete_role(db: Session, role_id: int) -> bool:
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        return False
    users_with_role = db.query(User).filter(User.id != None, User.role_id == role_id).count()
    if users_with_role > 0:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete role: {users_with_role} user(s) are using it"
        )
    db.delete(role)
    db.commit()
    return True
