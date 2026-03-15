from sqlalchemy.orm import Session
from app.models.user import User
from app.security.hashing import verify_password

def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = db.query(User).filter(User.username == username).first()
    if not user: return None
    is_password_correct = verify_password(password, user.hashed_password)
    if not is_password_correct: return None
    return user