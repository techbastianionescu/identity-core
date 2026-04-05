from sqlalchemy.orm import Session
from app.models.role import Role
from app.schemas.role import RoleCreate

def create_role(db: Session, role_data: RoleCreate):
    db_role = Role(name=role_data.name)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def get_roles(db:Session):
    roles = db.query(Role).all()
    return roles

def get_role_by_id(db, role_id: int):
    role = db.query(Role).filter(Role.id == role_id).first()
    return role