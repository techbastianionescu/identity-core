from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.user import User
from app.security.hashing import hash_password

PERMISSIONS = [
    ("roles:create", "Permite crear nuevos roles en el sistema"),
    ("roles:read", "Permite consultar los roles existentes"),
    ("permissions:create", "Permite crear nuevos permisos en el sistema"),
    ("permissions:read", "Permite consultar los permisos existentes"),
    ("users:read", "Permite consultar la lista de usuarios"),
    ("users:assign_role", "Permite asignar un rol a un usuario"),
]

def seed_data():
    db: Session = SessionLocal()
    try:
        role = db.query(Role).filter(Role.name == "admin").first()
        if role is None:
            role = Role(name="admin")
            db.add(role)
            db.commit()
            db.refresh(role)

        for perm_name, perm_description in PERMISSIONS:
            permission = db.query(Permission).filter(Permission.name == perm_name).first()
            if permission is None:
                permission = Permission(name=perm_name, description=perm_description)
                db.add(permission)
                db.commit()
                db.refresh(permission)
            elif permission.description != perm_description:
                permission.description = perm_description
            if permission not in role.permissions:
                role.permissions.append(permission)

        db.commit()

        admin_user = db.query(User).filter(User.username == "admin").first()
        if admin_user is None:
            admin_user = User(
                username="admin",
                email="admin@identitycore.com",
                hashed_password=hash_password("admin123"),
                role_id=role.id,
            )
            db.add(admin_user)
            db.commit()
    finally:
        db.close()
