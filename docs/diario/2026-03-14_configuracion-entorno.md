# Sesión 1 — Configuración del entorno de desarrollo
**Fecha:** 14 de marzo de 2026

## Lo que hice hoy

Hoy configuré el entorno base del proyecto desde cero. Partía sin nada instalado salvo Git, VSCode y Docker Desktop, así que el objetivo principal era dejar el proyecto listo para empezar a escribir código real en la próxima sesión.

### 1. `.gitignore`

Lo primero que hice fue crear el archivo `.gitignore` en la raíz del repositorio. Este archivo le indica a Git qué ficheros y carpetas debe ignorar y no incluir nunca en el historial de commits. En concreto, configuré las siguientes exclusiones:

- `venv/` — el entorno virtual de Python, que contiene miles de archivos de dependencias que no son código propio del proyecto
- `.env` — archivo con variables de entorno sensibles como contraseñas y claves secretas
- `__pycache__/`, `*.pyc`, `*.pyo` — archivos generados automáticamente por Python que no aportan valor al repositorio

La razón de crear este archivo antes que cualquier otra cosa es evitar comprometer accidentalmente información sensible o archivos innecesarios. Confirmé que funcionaba correctamente ejecutando `git status` tras crear el entorno virtual y comprobando que Git no lo detectaba.

### 2. Entorno virtual (`venv`)

Creé un entorno virtual de Python dentro de la carpeta `backend/` con el comando `python -m venv venv`. Un entorno virtual es un intérprete de Python aislado, exclusivo para este proyecto. Esto evita conflictos entre versiones de paquetes cuando se trabaja en varios proyectos a la vez en la misma máquina.

Lo activé con `source venv/Scripts/activate` y verifiqué que el prompt del terminal mostraba `(venv)`, confirmando que cualquier paquete instalado a partir de ese momento quedaría confinado al proyecto.

### 3. `requirements.txt`

Creé el archivo `requirements.txt` con las dependencias necesarias para el proyecto:

- **fastapi** — framework web para construir la API REST
- **uvicorn** — servidor ASGI que ejecuta la aplicación FastAPI
- **sqlalchemy** — ORM para interactuar con la base de datos usando Python en lugar de SQL puro
- **psycopg2-binary** — driver de conexión entre Python y PostgreSQL
- **pydantic-settings** — gestión de configuración a partir de variables de entorno
- **python-jose[cryptography]** — generación y validación de tokens JWT
- **passlib[bcrypt]** — hashing seguro de contraseñas
- **python-multipart** — soporte para datos de formulario en FastAPI

Instalé todas las dependencias con `pip install -r requirements.txt` y a continuación pinné las versiones exactas usando `pip freeze`, actualizando el archivo con los números de versión concretos. Fijar versiones garantiza que el proyecto funcione igual en cualquier máquina y en cualquier momento futuro.

### 4. Variables de entorno (`.env` y `.env.example`)

Creé dos archivos para gestionar la configuración sensible del proyecto:

- `.env` — contiene los valores reales de configuración (credenciales de base de datos, clave secreta JWT, etc.). Este archivo está excluido del repositorio mediante `.gitignore` y nunca será committeado.
- `.env.example` — plantilla con las mismas claves pero sin valores reales. Este sí se incluye en el repositorio para que cualquier persona que clone el proyecto sepa exactamente qué variables necesita definir.

Las variables configuradas son:
- `DATABASE_URL` — cadena de conexión a PostgreSQL
- `SECRET_KEY` — clave secreta para firmar los tokens JWT
- `ALGORITHM` — algoritmo de firma JWT (HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES` — tiempo de expiración de los tokens de acceso

## Decisiones tomadas

- Usaré **Docker** tanto en desarrollo como en producción para garantizar que el entorno sea idéntico en ambos contextos. PostgreSQL no está instalado localmente; correrá como un contenedor.
- El repositorio es un **monorepo** que contendrá backend, frontend y toda la documentación, lo que facilita el seguimiento del trabajo y la presentación del proyecto.

## Próximos pasos

Configurar Docker: crear el `Dockerfile` de la aplicación y el `docker-compose.yml` que orquestará el contenedor de la API junto con el de PostgreSQL.
