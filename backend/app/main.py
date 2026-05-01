from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.user_router import router as user_router
from app.routers.auth_router import router as auth_router
from app.routers.role_router import router as role_router
from app.routers.permission_router import router as permission_router
from app.database import engine, Base
from app.models import user, role, permission
from app.seed import seed_data

Base.metadata.create_all(bind=engine)
seed_data()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/users")
app.include_router(auth_router, prefix="/auth")
app.include_router(role_router, prefix="/roles")
app.include_router(permission_router, prefix="/permissions")

@app.get("/health")
def health():
    return{"status":"OK"}