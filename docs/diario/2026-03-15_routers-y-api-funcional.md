# Sesión 5 — Routers, wiring y primera API funcional
**Fecha:** 15 de marzo de 2026

## Lo que hice hoy

En esta sesión completé la capa de routers, conecté todas las capas del sistema y verifiqué que la API funciona de extremo a extremo con registro de usuarios y autenticación JWT real.

### 1. Capa de servicios (`services/`)

Implementé la lógica de negocio del sistema en dos archivos:

**`user_service.py` — `create_user`:**
Recibe una sesión de base de datos y un objeto `UserCreate`. El flujo es:
1. Hashear la contraseña usando `hash_password()` antes de tocar la base de datos
2. Crear una instancia del modelo `User` con los datos del schema y la contraseña hasheada
3. Añadir el objeto a la sesión (`db.add`)
4. Confirmar la transacción (`db.commit`)
5. Refrescar el objeto para obtener el `id` generado por la base de datos (`db.refresh`)
6. Devolver el usuario creado

**`auth_service.py` — `authenticate_user`:**
Recibe una sesión, username y password. El flujo es:
1. Buscar el usuario en la base de datos filtrando por username
2. Si no existe → devolver `None`
3. Verificar la contraseña con `verify_password()` comparando el input con el hash almacenado
4. Si no coincide → devolver `None`
5. Si todo es correcto → devolver el usuario

La decisión de devolver `None` en ambos casos de fallo (usuario no encontrado y contraseña incorrecta) es intencionada: el cliente recibe el mismo error `401 Invalid Credentials` sin saber cuál de los dos falló. Esto evita ataques de enumeración de usuarios.

### 2. Capa de routers (`routers/`)

Los routers son el punto de entrada HTTP de la aplicación. Cada router agrupa endpoints relacionados.

**Concepto clave — Dependency Injection:**
FastAPI tiene un sistema de inyección de dependencias. La función `get_db()` crea una sesión de base de datos, la cede al endpoint mediante `yield`, y la cierra automáticamente al finalizar la petición en el bloque `finally`. Esto garantiza que ninguna sesión quede abierta accidentalmente.

**`user_router.py` — `POST /users/register`:**
- Recibe un `UserCreate` como cuerpo de la petición
- Obtiene una sesión de base de datos via `Depends(get_db)`
- Llama a `create_user(db, user_data)`
- Devuelve un `UserResponse` (sin contraseña)

**`auth_router.py` — `POST /auth/login`:**
- Recibe un `LoginRequest` con username y password
- Llama a `authenticate_user`
- Si devuelve `None` → lanza `HTTPException(401)` con mensaje "Invalid Credentials"
- Si es correcto → genera un token JWT con `create_access_token({"sub": user.username})`
- Devuelve un `TokenResponse` con el token y el tipo "bearer"

### 3. Wiring en `main.py`

Conecté todos los routers en la aplicación principal:

```python
app.include_router(user_router, prefix="/users")
app.include_router(auth_router, prefix="/auth")
```

También añadí la creación automática de tablas al arrancar la aplicación:

```python
Base.metadata.create_all(bind=engine)
```

Esta línea le dice a SQLAlchemy que compare los modelos definidos con el estado actual de la base de datos y cree las tablas que falten. Es importante importar todos los modelos antes de llamarla, ya que SQLAlchemy solo conoce los modelos que han sido importados.

### 4. Resolución de errores

**Error 1 — Incompatibilidad passlib/bcrypt:**
`passlib 1.7.4` no es compatible con `bcrypt >= 4.0.0` porque bcrypt eliminó el atributo `__about__` en versiones recientes. Solución: fijar `bcrypt==4.0.1` explícitamente en `requirements.txt`.

**Error 2 — Tablas inexistentes:**
La primera vez que se intenta escribir en la base de datos, SQLAlchemy lanzaba un error porque las tablas no existían. Solución: añadir `Base.metadata.create_all(bind=engine)` en `main.py` para que las tablas se creen automáticamente al arrancar la aplicación.

## Verificación final

Probé los dos endpoints con Bruno:

**`POST /users/register`** con body `{"username": "techbastian", "email": "...", "password": "prueba123"}`:
- Respuesta: `200 OK`
- Body: `{"id": 1, "username": "techbastian", "email": "...", "is_active": true}`
- La contraseña no aparece en la respuesta ✓

**`POST /auth/login`** con body `{"username": "techbastian", "password": "prueba123"}`:
- Respuesta: `200 OK`
- Body: `{"access_token": "eyJhbGci...", "token_type": "bearer"}`
- Token JWT real y válido ✓

## Estado del proyecto

El núcleo de la API está funcional. Las capas models → schemas → security → services → routers → main están todas implementadas y conectadas correctamente.

## Próximos pasos

- Implementar protección de rutas con el token JWT (middleware de autenticación)
- Añadir gestión de roles y permisos
- Implementar el panel de administración (frontend)
- Configurar Alembic para migraciones de base de datos
