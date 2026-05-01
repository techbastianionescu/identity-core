from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserUpdate(BaseModel):
    username: str | None = None
    email: str | None = None
    is_active: bool | None = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    role_id: int | None = None

    model_config = {"from_attributes": True}
