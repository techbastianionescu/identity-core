from pydantic import BaseModel

class PermissionCreate(BaseModel):
    name: str
    description: str | None = None

class PermissionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class PermissionResponse(BaseModel):
    id: int
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}

class PermissionAssign(BaseModel):
    permission_id: int
