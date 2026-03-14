# Sesión 3 — Smoke test: verificación del stack completo
**Fecha:** 14 de marzo de 2026

## Lo que hice hoy

En esta sesión verifiqué que el stack completo (API + base de datos) funciona correctamente antes de escribir lógica real. Esto se llama *smoke test*: una prueba mínima que confirma que la infraestructura no está rota.

### 1. `main.py` mínimo

Escribí una versión mínima de `main.py` con un único endpoint de salud:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health():
    return {"status": "OK"}
```

Este endpoint no hace nada útil todavía, pero sirve para confirmar que FastAPI arranca correctamente dentro del contenedor. El decorador `@app.get("/health")` le indica a FastAPI que cuando llegue una petición GET a la ruta `/health`, ejecute la función `health()` y devuelva su resultado como JSON.

### 2. Primer arranque con `docker-compose up --build`

Ejecuté `docker-compose up --build` desde la raíz del repositorio. Este comando:

1. Construyó la imagen de la API siguiendo las instrucciones del `Dockerfile`
2. Descargó la imagen oficial de PostgreSQL 16
3. Creó la red virtual entre los dos contenedores
4. Creó el volumen persistente para los datos de PostgreSQL
5. Arrancó ambos contenedores

Durante este proceso encontré un problema de conectividad: Docker no podía descargar la imagen de PostgreSQL desde los servidores de Cloudflare. La causa fue externa al proyecto — la operadora Telefónica bloquea temporalmente conexiones a determinados servidores de Cloudflare durante retransmisiones de partidos de La Liga para proteger derechos de emisión. La solución fue utilizar una VPN para enrutar el tráfico a través de otro país durante la descarga.

También instalé Docker Desktop en su versión x64 (había instalado inicialmente la versión ARM64 por error), lo que resolvió un problema adicional de compatibilidad.

### 3. Verificación con Bruno

Una vez los contenedores arrancados, realicé una petición GET a `http://localhost:8000/health` desde Bruno (cliente de API REST). La respuesta fue:

```json
{
  "status": "OK"
}
```

Con código de estado `200 OK` y un tiempo de respuesta de 16ms. Esto confirma que:

- El contenedor de la API construye e inicia correctamente
- Uvicorn sirve las peticiones en el puerto 8000
- El contenedor de PostgreSQL arranca y acepta conexiones
- La red entre contenedores funciona

## Decisiones tomadas

- El `main.py` actual es temporal — solo sirve para verificar el stack. Se irá completando progresivamente en las siguientes sesiones.
- Se mantiene el endpoint `/health` de forma permanente, ya que es una buena práctica en APIs en producción para verificar que el servicio está activo.

## Próximos pasos

Implementar `database.py` — la conexión real entre la aplicación y PostgreSQL usando SQLAlchemy. Este es el primer paso de lógica real del proyecto.
