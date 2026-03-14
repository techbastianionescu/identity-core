# Sesión 2 — Configuración de Docker
**Fecha:** 14 de marzo de 2026

## Lo que hice hoy

En esta sesión configuré el entorno de contenedores del proyecto, definiendo cómo se construye y ejecuta la aplicación tanto en desarrollo como en producción.

### 1. `Dockerfile`

Creé el archivo `Dockerfile` dentro de la carpeta `backend/`. Este archivo es una receta que Docker sigue paso a paso para construir una imagen de la aplicación — una especie de snapshot que contiene Python, las dependencias y el código.

Las instrucciones que escribí, en orden:

1. `FROM python:3.12-slim` — se parte de la imagen oficial de Python 3.12 en su versión ligera
2. `WORKDIR /app` — se establece `/app` como directorio de trabajo dentro del contenedor
3. `COPY requirements.txt .` — se copia primero el archivo de dependencias
4. `RUN pip install --no-cache-dir -r requirements.txt` — se instalan las dependencias
5. `COPY . .` — se copia el resto del código de la aplicación
6. `CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]` — se arranca el servidor

El motivo de copiar `requirements.txt` antes que el resto del código es el **sistema de caché de capas de Docker**: cada instrucción genera una capa que Docker cachea. Como las dependencias cambian raramente, Docker puede reutilizar esa capa en cada reconstrucción y evitar reinstalar todos los paquetes cuando solo cambia el código de la aplicación. Esto acelera significativamente el proceso de desarrollo.

### 2. `docker-compose.yml`

Creé el archivo `docker-compose.yml` en la raíz del repositorio. Este archivo orquesta múltiples contenedores y define cómo se relacionan entre sí. Configuré dos servicios:

**Servicio `api`:**
- Se construye a partir del `Dockerfile` en `./backend`
- Expone el puerto `8000` de la máquina al puerto `8000` del contenedor
- Carga las variables de entorno desde `./backend/.env`
- Depende del servicio `db` (espera a que la base de datos esté disponible antes de arrancar)

**Servicio `db`:**
- Usa la imagen oficial `postgres:16`
- Configura las credenciales y el nombre de la base de datos mediante variables de entorno
- Expone el puerto `5432`
- Usa un volumen nombrado (`postgres_data`) para persistir los datos aunque el contenedor se detenga o se elimine

La decisión de usar Docker para la base de datos en lugar de instalar PostgreSQL directamente en la máquina garantiza que el entorno de desarrollo sea idéntico al de producción, eliminando el clásico problema de "en mi máquina funciona".

## Decisiones tomadas

- El `Dockerfile` vive dentro de `backend/` porque describe únicamente cómo construir el servicio de la API.
- El `docker-compose.yml` vive en la raíz del repositorio porque orquesta todos los servicios del proyecto en conjunto.
- No se instala ninguna base de datos en la máquina local; todo corre en contenedores.

## Próximos pasos

Escribir un `main.py` mínimo para verificar que el stack completo (API + base de datos) arranca correctamente con `docker-compose up`. A continuación, implementar la conexión a la base de datos en `database.py`.
