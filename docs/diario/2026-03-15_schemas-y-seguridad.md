# Sesión 4 — Schemas de Pydantic y capa de seguridad
**Fecha:** 15 de marzo de 2026

## Lo que hice hoy

En esta sesión implementé dos capas fundamentales del proyecto: los schemas de validación de datos con Pydantic y los módulos de seguridad (hashing de contraseñas y tokens JWT).

### 1. Modelos SQLAlchemy (continuación de sesión anterior)

Committeé los tres modelos ORM que había escrito en la sesión anterior:

- **`Role`** — tabla `roles` con `id` y `name` (único, no nulo)
- **`Permission`** — tabla `permissions` con `id`, `name` y `description` (opcional)
- **`User`** — tabla `users` con `id`, `username`, `email`, `hashed_password`, `is_active` y `role_id` (clave foránea a `roles.id`)

Una decisión importante: el campo se llama `hashed_password` y no `password` porque nunca se almacena la contraseña en texto plano. Aunque la base de datos sufra una brecha de seguridad, bcrypt aplica un hash unidireccional con sal aleatoria, por lo que nadie puede recuperar la contraseña original.

### 2. Schemas de Pydantic (`schemas/`)

Los schemas de Pydantic definen la forma de los datos que entran y salen de la API. Son distintos de los modelos SQLAlchemy: los modelos representan filas en la base de datos, los schemas representan el contrato de la API con el cliente.

Cada campo se define con anotaciones de tipo Python (`campo: tipo`), y Pydantic valida automáticamente que los datos recibidos coincidan con los tipos esperados.

**`schemas/user.py`:**
- `UserCreate` — datos que envía el cliente al registrarse: `username`, `email`, `password` (todos `str`)
- `UserResponse` — datos que devuelve la API: `id`, `username`, `email`, `is_active`. Sin contraseña. Incluye `model_config = {"from_attributes": True}` para poder leer objetos SQLAlchemy directamente.

**`schemas/auth.py`:**
- `LoginRequest` — credenciales de login: `username` y `password`
- `TokenResponse` — respuesta tras login exitoso: `access_token` y `token_type`

### 3. Hashing de contraseñas (`security/hashing.py`)

Implementé dos funciones usando `passlib` con bcrypt:

- `hash_password(password: str) -> str` — recibe una contraseña en texto plano y devuelve su hash bcrypt
- `verify_password(plain_password: str, hashed_password: str) -> bool` — compara una contraseña en texto plano con un hash almacenado y devuelve `True` o `False`

La verificación nunca compara texto plano con texto plano — siempre se hashea el input y se compara el resultado con el hash almacenado.

### 4. Gestión de tokens JWT (`security/jwt_handler.py`)

Implementé dos funciones usando `python-jose`:

- `create_access_token(data: dict) -> str` — recibe un payload (por ejemplo `{"sub": "username"}`), le añade una fecha de expiración calculada a partir de `ACCESS_TOKEN_EXPIRE_MINUTES`, y lo firma con `SECRET_KEY` usando el algoritmo `ALGORITHM` (HS256). Devuelve el token como string.
- `decode_access_token(token: str) -> dict` — verifica la firma del token y devuelve el payload original.

Las tres variables de configuración (`SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`) se leen del archivo `.env` mediante `os.getenv()`. Un detalle importante: `os.getenv()` siempre devuelve un string, por lo que `ACCESS_TOKEN_EXPIRE_MINUTES` requiere conversión explícita a `int` antes de usarse con `timedelta`.

## Decisiones tomadas

- Los schemas están completamente separados de los modelos. Esto permite controlar exactamente qué datos se exponen en la API sin acoplarlo a la estructura de la base de datos.
- La clave secreta JWT nunca se hardcodea en el código — vive exclusivamente en `.env`, que está excluido del repositorio.

## Próximos pasos

Implementar la capa de servicios (`services/`) — la lógica de negocio real: registro de usuarios, autenticación y gestión de roles.
