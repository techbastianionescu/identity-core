from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.role import Role
from app.models.permission import Permission
from app.models.user import User
from app.security.hashing import hash_password

PERMISSIONS = [
    ("users:read", "Permite consultar la lista de usuarios"),
    ("users:create", "Permite crear nuevos usuarios desde el panel"),
    ("users:update", "Permite modificar los datos de un usuario"),
    ("users:delete", "Permite eliminar un usuario del sistema"),
    ("users:assign_role", "Permite asignar un rol a un usuario"),
    ("roles:read", "Permite consultar los roles existentes"),
    ("roles:create", "Permite crear nuevos roles en el sistema"),
    ("roles:update", "Permite modificar el nombre de un rol"),
    ("roles:delete", "Permite eliminar un rol del sistema"),
    ("roles:assign_permission", "Permite asignar permisos a un rol"),
    ("roles:remove_permission", "Permite quitar permisos de un rol"),
    ("permissions:read", "Permite consultar los permisos existentes"),
    ("permissions:create", "Permite crear nuevos permisos en el sistema"),
    ("permissions:update", "Permite modificar nombre o descripción de un permiso"),
    ("permissions:delete", "Permite eliminar un permiso del sistema"),
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
