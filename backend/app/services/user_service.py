from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate
from app.security.hashing import hash_password

def create_user(db: Session, user_data: UserCreate) -> User:
    hashed_password = hash_password(user_data.password)
    db_user = User(username=user_data.username, email=user_data.email, hashed_password= hashed_password)  
    db.add(db_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Username or email already exists")
    db.refresh(db_user)
    return db_user

def get_users(db: Session) -> list[User]:
    return db.query(User).all()

def assign_role(db: Session, user_id: int, role_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        return None
    role = db.query(Role).filter(Role.id == role_id).first()
    if role is None:
        return None
    user.role_id= role_id
    db.commit()
    db.refresh(user)
    return user
    