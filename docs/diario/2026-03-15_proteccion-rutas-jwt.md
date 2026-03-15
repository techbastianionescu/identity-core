# Sesión 6 — Protección de rutas con JWT
**Fecha:** 15 de marzo de 2026

## Lo que hice hoy

En esta sesión implementé la protección de rutas mediante tokens JWT, completando el ciclo completo de autenticación del sistema.

### 1. `security/dependencies.py` — Dependencia de autenticación

Creé un nuevo archivo `dependencies.py` dentro de la carpeta `security/`. Este archivo contiene la función `get_current_user`, que actúa como una dependencia reutilizable que cualquier endpoint puede usar para exigir autenticación.

El flujo de `get_current_user`:
1. Extrae el token JWT de la cabecera `Authorization: Bearer <token>` automáticamente usando `OAuth2PasswordBearer`
2. Decodifica el token con `decode_access_token`
3. Si el payload es `None` (token inválido) → lanza `HTTPException(401)`
4. Extrae el username del campo `"sub"` del payload
5. Si no hay username → lanza `HTTPException(401)`
6. Busca el usuario en la base de datos por username
7. Si no existe → lanza `HTTPException(401)`
8. Devuelve el usuario autenticado

También incluye la función `get_db` para la inyección de sesión de base de datos.

**Concepto clave — `OAuth2PasswordBearer`:**
FastAPI extrae automáticamente el token de la cabecera HTTP. Si no hay cabecera `Authorization`, FastAPI devuelve `401 Not Authenticated` antes de entrar a la función. Esto significa que la protección tiene dos niveles: FastAPI verifica que el token existe, y `get_current_user` verifica que es válido.

### 2. Manejo de errores en `jwt_handler.py`

`decode_access_token` lanzaba una excepción `JWTError` cuando el token era inválido o había sido manipulado, lo que causaba un `500 Internal Server Error` en lugar de un `401`. Añadí un bloque `try/except JWTError` para capturar el error y devolver `None` en su lugar:

```python
def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None
```

Esto permite que `get_current_user` maneje el caso limpiamente devolviendo `401 Invalid Credentials`.

### 3. Endpoint protegido `GET /users/me`

Añadí un endpoint protegido en `user_router.py`:

```python
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

`Depends(get_current_user)` hace que FastAPI ejecute automáticamente toda la lógica de verificación antes de entrar al endpoint. Si algo falla, el endpoint nunca se ejecuta. Si todo es correcto, `current_user` contiene el usuario autenticado listo para usar.

### 4. Verificación

Probé tres escenarios en Bruno:

- **Sin token** → `401 Not Authenticated` (FastAPI lo detecta automáticamente) ✓
- **Token inválido** → `401 Invalid Credentials` ✓
- **Token válido** → `200 OK` con datos del usuario autenticado ✓

## Conceptos aprendidos

**Multi-tenancy vs sistema centralizado:** El proyecto es un sistema de autenticación centralizado pensado para ser desplegado por cada cliente/empresa en su propio servidor mediante Docker. No es multi-tenant (una instancia para todos) — eso sería una ampliación futura que requeriría añadir un campo `tenant_id` a cada tabla y cambios arquitectónicos significativos.

**Capas de protección:**
- `OAuth2PasswordBearer` → verifica que existe el token
- `get_current_user` → verifica que el token es válido y el usuario existe
- Roles y permisos (próxima fase) → verifica que el usuario tiene acceso al recurso específico

## Estado del proyecto

```
✅ Registro de usuarios
✅ Autenticación con JWT
✅ Persistencia en base de datos
✅ Protección de rutas
⬜ Gestión de roles y permisos
⬜ Manejo de errores completo
⬜ Panel de administración
⬜ Despliegue en servidor real
```

## Próximos pasos

- Gestión de roles y permisos (asignar roles a usuarios, proteger endpoints por rol)
- Manejo de errores completo (duplicados, validaciones, token expirado)
- Panel de administración frontend
