# Sesión 7 — Gestión de roles, permisos y manejo de errores

**Fecha:** 2026-04-05  
**Duración:** ~6 horas

## Objetivo de la sesión

Avanzar del 50% al 85% del proyecto implementando la gestión de roles, el sistema de permisos con control de acceso basado en roles (RBAC), el bootstrap de datos iniciales y el manejo de errores HTTP correcto en todos los endpoints.

## Lo que se hizo

### Limpieza de código — DRY

Se detectó que la función `get_db()` estaba duplicada en tres sitios: `routers/user_router.py`, `routers/auth_router.py` y `security/dependencies.py`. Esta función ya existía en `dependencies.py` con el propósito explícito de ser reutilizada. Se eliminaron las copias locales de los routers y se importó desde `dependencies.py` en ambos casos.

Este cambio aplica el principio DRY (Don't Repeat Yourself): si en el futuro hay que modificar cómo se gestiona la sesión de base de datos, el cambio se hace en un único lugar.

### Gestión de roles

Se implementó la capa completa de gestión de roles siguiendo la misma arquitectura por capas del resto del proyecto:

- `schemas/role.py` — se crearon `RoleCreate`, `RoleResponse` y `RoleAssign` como schemas Pydantic para validar entrada y salida
- `services/role_service.py` — se implementaron las funciones `create_role`, `get_roles` y `get_role_by_id`. Se añadió captura de `IntegrityError` para devolver 409 si el nombre del rol ya existe.
- `routers/role_router.py` — se implementaron los endpoints `POST /roles`, `GET /roles` y `GET /roles/{role_id}`
- `main.py` — se registró el role_router con el prefix `/roles`

### Sistema de permisos (RBAC)

Se implementó un sistema de control de acceso basado en roles con una relación muchos a muchos entre roles y permisos:

- `models/role.py` — se añadió la tabla de asociación `role_permissions` y la relación `permissions` usando `relationship` de SQLAlchemy con `secondary`
- `models/permission.py` — se añadió la relación inversa `roles` para completar el many-to-many
- `schemas/permission.py` — se crearon `PermissionCreate`, `PermissionResponse` y `PermissionAssign`
- `services/permission_service.py` — se implementaron `create_permission`, `get_permissions`, `get_permission_by_id` y `assign_permission_to_role`
- `routers/permission_router.py` — se implementaron los endpoints `POST /permissions`, `GET /permissions`, `GET /permissions/{id}` y `POST /permissions/roles/{role_id}/assign`
- `main.py` — se registró el permission_router con el prefix `/permissions`

### Dependency factory — require_permission

Se implementó `require_permission(permission_name)` en `security/dependencies.py`. Es una función que devuelve otra función (patrón factory), lo que permite usarla como dependencia de FastAPI con un parámetro variable:

```python
_=Depends(require_permission("roles:create"))
```

Al ejecutarse, comprueba que el usuario autenticado tiene un rol asignado y que ese rol tiene el permiso requerido. Si no, devuelve 403 Forbidden.

Se aplicó en:
- `POST /roles` — requiere `roles:create`
- `PATCH /users/{user_id}/role` — requiere `users:assign_role`

### Seed de datos iniciales

Se identificó un problema de bootstrap: para crear el primer rol se necesita el permiso `roles:create`, pero para tener ese permiso se necesita un rol. Solución: un script `seed.py` que se ejecuta al arrancar la aplicación y crea los datos iniciales si no existen:

- Rol `admin`
- Todos los permisos del sistema (`roles:create`, `roles:read`, `permissions:create`, `permissions:read`, `users:read`, `users:assign_role`)
- Asignación de todos los permisos al rol `admin`
- Usuario `admin` con contraseña `admin123` y rol `admin` asignado

El seed es idempotente: comprueba si cada elemento ya existe antes de crearlo, por lo que es seguro ejecutarlo en cada arranque.

### Fix Docker — race condition

Se detectó que el contenedor de la API arrancaba antes de que PostgreSQL estuviese lista para aceptar conexiones, provocando un error de conexión y la caída del contenedor.

Solución en `docker-compose.yml`:
- Se añadió un `healthcheck` al servicio `db` que ejecuta `pg_isready` cada 5 segundos
- Se cambió `depends_on` en el servicio `api` para usar `condition: service_healthy`

Así Docker espera a que Postgres esté realmente lista antes de arrancar la API.

### Manejo de errores

Se añadieron respuestas HTTP correctas en todos los casos de error:

- `409 Conflict` en `POST /users/register` — username o email duplicado
- `409 Conflict` en `POST /roles` — nombre de rol duplicado
- `404 Not Found` en `GET /roles/{role_id}` — rol no existe
- `404 Not Found` en `GET /permissions/{id}` — permiso no existe
- `404 Not Found` en `PATCH /users/{user_id}/role` — usuario o rol no existen
- `401 Unauthorized` en rutas protegidas sin token
- `403 Forbidden` en rutas protegidas con token pero sin el permiso requerido

### Corrección de .env.example

Se corrigieron dos erratas en el archivo `.env.example`: `SECKRET_KEY` → `SECRET_KEY` y `ACCESS_TOKEN_EXPIRE_MINUTES_30` → `ACCESS_TOKEN_EXPIRE_MINUTES=30`.

## Verificación

Todos los endpoints se probaron con Bruno siguiendo el flujo completo:

- `GET /health` → 200 `{"status":"OK"}`
- `POST /auth/login` con `admin`/`admin123` → 200 con token JWT
- `GET /users/me` con token → 200 con `role_id: 1`
- `GET /roles/` → 200 con rol admin
- `GET /roles/1` → 200 OK
- `GET /roles/999` → 404 Role not found
- `POST /roles/` con token → crear rol `viewer` → 200
- `POST /roles/` con token → crear `viewer` de nuevo → 409 Role already exists
- `POST /roles/` sin token → 401
- `GET /permissions/` → 200 con lista de permisos
- `GET /permissions/999` → 404
- `POST /users/register` → 200
- `POST /users/register` con username duplicado → 409
- `GET /users/me` sin token → 401
- `PATCH /users/2/role` con token admin → 200
- `PATCH /users/999/role` → 404
- `POST /roles/` con token de usuario sin permisos → 403

## Feedback de la tutora

La tutora revisó la entrega parcial del 50% y valoró positivamente la arquitectura en capas, la separación entre modelos y schemas, la gestión de secretos con `.env`, el Dockerfile optimizado y la coherencia entre la memoria y el código. Señaló las dos erratas en `.env.example` y la duplicación de `get_db()`, ambas corregidas en esta sesión.

## Estado del proyecto

- ✅ Registro de usuarios
- ✅ Autenticación con JWT
- ✅ Protección de rutas
- ✅ Gestión de roles
- ✅ Sistema de permisos (RBAC)
- ✅ Asignación de roles a usuarios
- ✅ Manejo de errores HTTP
- ✅ Seed de datos iniciales
- ✅ Despliegue con Docker Compose
- ⏳ Panel de administración (frontend)
- ⏳ Despliegue en servidor real con Nginx
