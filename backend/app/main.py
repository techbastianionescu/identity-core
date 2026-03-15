from fastapi import FastAPI
from app.routers.user_router import router as user_router
from app.routers.auth_router import router as auth_router
from app.database import engine, Base
from app.models import user, role, permission

Base.metadata.create_all(bind=engine)
app = FastAPI()
app.include_router(user_router, prefix="/users")
app.include_router(auth_router, prefix="/auth")

@app.get("/health")
def health():
    return{"status":"OK"}