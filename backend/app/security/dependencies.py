from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.security.jwt_handler import decode_access_token
from fastapi import HTTPException, Depends
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload: raise HTTPException(status_code=401, detail="Invalid Credentials")
    username = payload.get("sub")
    if not username: raise HTTPException(status_code=401, detail="Invalid Credentials")
    user = db.query(User).filter(User.username == username).first()
    if not user: raise HTTPException(status_code=401, detail="Invalid Credentials")
    return user