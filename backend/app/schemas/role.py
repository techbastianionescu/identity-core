from pydantic import BaseModel
from app.schemas.permission import PermissionResponse

class RoleCreate(BaseModel):
    name: str

class RoleResponse(BaseModel):
    id: int
    name: str
    permissions: list[PermissionResponse] = []

    model_config = {"from_attributes": True}

class RoleAssign(BaseModel):
    role_id: int
