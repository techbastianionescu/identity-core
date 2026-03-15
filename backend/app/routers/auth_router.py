from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import authenticate_user
from app.security.jwt_handler import create_access_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
    
@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user: raise HTTPException(status_code=401, detail="Invalid Credentials")
    token = create_access_token(data={"sub": user.username}) 
    return TokenResponse(access_token=token, token_type="bearer")
