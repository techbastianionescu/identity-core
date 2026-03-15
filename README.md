# Identity Core

Centralized authentication and user management API for web applications.

Built as a Final Degree Project (DAM).

## What it does

Identity Core provides a complete authentication cycle that any web application can use as an independent security layer:

- User registration with bcrypt-hashed passwords
- Login with JWT token generation
- Protected routes that require a valid token
- Persistent storage with PostgreSQL
- Full deployment with Docker Compose

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Language       | Python 3.12                       |
| Framework      | FastAPI                           |
| ORM            | SQLAlchemy                        |
| Database       | PostgreSQL 16                     |
| Auth           | JWT (python-jose) + bcrypt        |
| Infrastructure | Docker + Docker Compose           |

## Getting started

### Requirements

- Docker
- Docker Compose

### Setup

1. Clone the repository:

```bash
git clone https://github.com/techbastianionescu/identity-core
cd identity-core
```

2. Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL=postgresql://{user}:{password}@db:5432/{db_name}
SECRET_KEY={your-secret-key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

3. Start the services:

```bash
docker-compose up --build
```

4. The API will be available at: `http://localhost:8000`

Swagger docs: `http://localhost:8000/docs`

## API Endpoints

| Method | Endpoint           | Auth required | Description              |
|--------|--------------------|---------------|--------------------------|
| GET    | /health            | No            | Health check             |
| POST   | /users/register    | No            | Register a new user      |
| POST   | /auth/login        | No            | Login and get JWT token  |
| GET    | /users/me          | Yes           | Get current user info    |

## Project structure

```
identity-core/
├── backend/
│   ├── app/
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   ├── routers/       # API endpoints
│   │   ├── security/      # JWT + bcrypt + dependencies
│   │   ├── database.py    # DB connection and session
│   │   └── main.py        # App entry point
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── docker-compose.yml
└── docs/
    └── diario/            # Development diary (Spanish)
```

## Project status

**Phase 1 (complete):**
- User registration
- JWT authentication
- Protected routes
- Docker deployment

**Phase 2 (in progress):**
- Role and permission management
- Complete error handling
- Admin panel (frontend)
- Production deployment with Nginx

## Author

Andrei Sebastian Ionescu
DAM Final Degree Project
