from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.security.hashing import hash_password

def create_user(db: Session, user_data: UserCreate) -> User:
    hashed_password = hash_password(user_data.password)
    db_user = User(username=user_data.username, email=user_data.email, hashed_password= hashed_password)  
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def assign_role(db: Session, user_id: int, role_id: int) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    user.role_id = role_id
    db.commit()
    db.refresh(user)
    return user
    