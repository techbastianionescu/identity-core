# identity-core

Centralized authentication and identity management service for applications and services.

This project is developed as a Final Degree Project (DAM) and aims to provide a reusable identity service capable of handling authentication, user management, roles and permissions for different types of clients such as web applications, mobile apps or backend services.

## Project goals

The main objective of this project is to build a centralized identity system that allows:

- User registration and authentication
- Role and permission management
- Secure access to protected resources
- Token-based authentication using JWT
- Integration with different types of applications through an API

## Architecture

The system follows an API-first approach.

Clients interact with the Identity Service through a REST API.

```
Client (Web / Mobile / Service)
        │
        ▼
Identity API (FastAPI)
        │
        ▼
PostgreSQL
```

## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication

### Frontend
- HTML
- CSS
- JavaScript
- Jinja2 templates

### Infrastructure
- Docker
- Uvicorn
- Nginx
- Deployment on a dedicated server

## Project status

This repository currently contains the initial architecture and will evolve during the development of the Final Degree Project.

## Author

Andrei Sebastian Ionescu  
DAM Final Degree Project
