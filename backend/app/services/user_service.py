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
    