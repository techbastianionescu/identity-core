# Identity Core

Centralized authentication, RBAC and user-management platform for web applications, with a ready-to-use admin panel.

Built as a Final Degree Project (TFG) — DAM, *Desarrollo de Aplicaciones Multiplataforma*.

---

## Overview

Identity Core is a self-contained identity layer that any web application can plug into. It exposes a REST API for authentication and access control, ships its own administration SPA, and is fully containerized so the whole stack starts with a single command.

Three pieces, one compose file:

```
┌────────────────────┐      ┌──────────────────────┐      ┌────────────────┐
│  Admin Panel SPA   │      │  REST API            │      │  PostgreSQL    │
│  React + Vite      │ ───▶ │  FastAPI · JWT       │ ───▶ │  Users · Roles │
│  Nginx (container) │      │  RBAC dependency     │      │  Permissions   │
└────────────────────┘      └──────────────────────┘      └────────────────┘
       :5173                       :8000                       :5432
```

## Features

### API (backend)

- User registration with bcrypt-hashed passwords
- Login with stateless JWT access tokens (HS256, configurable TTL)
- `OAuth2PasswordBearer` token extraction and `get_current_user` dependency
- Role-Based Access Control through a `require_permission(name)` dependency factory
- Full CRUD on **users**, **roles** and **permissions**
- Many-to-many `role ↔ permission` relation with assignment / unassignment endpoints
- One-role-per-user model with role assignment endpoint
- Layered architecture: `models` → `schemas` → `services` → `routers` → `security`
- Idempotent startup seed: creates the `admin` role, the full permission catalog and a bootstrap admin user
- Correct HTTP semantics: `401` no/invalid token, `403` missing permission, `404` not found, `409` integrity conflict
- Foreign-key safety: a role in use by any user cannot be deleted (`409`)
- Configurable CORS via `CORS_ORIGINS`

### Admin panel (frontend)

- Login flow with JWT persisted in `localStorage` and silent session restoration via `/users/me`
- Protected routes with redirect-to-login and loading state
- Pages: **Dashboard**, **Usuarios**, **Roles**, **Permisos**, **Mi perfil**
- Per-action UI gating with a `usePermissions` hook so buttons only appear when the user can actually perform the action
- Responsive layout with a collapsible mobile sidebar
- Dark theme by default (Tailwind v4 + shadcn/ui + Radix UI)
- PWA-ready: manifest, service worker, iOS safe-area handling and standalone display
- Axios client with automatic token injection and global 401 → logout interceptor
- Toast notifications for every mutation (sonner)

### Infrastructure

- One `docker-compose.yml` for development (API + SPA + Postgres on a healthcheck-gated network)
- A thin `docker-compose.prod.yml` overlay that binds services to `127.0.0.1` so they sit behind an Nginx reverse proxy
- Multi-stage frontend Dockerfile (Node build → Nginx runtime) with build-time `VITE_API_URL`
- Postgres healthcheck (`pg_isready`) so the API never starts against a cold database

## Tech stack

| Layer          | Stack                                                                         |
|----------------|-------------------------------------------------------------------------------|
| Backend        | Python 3.12 · FastAPI · SQLAlchemy 2 · Pydantic · python-jose · passlib/bcrypt |
| Frontend       | React 19 · TypeScript · Vite · TailwindCSS 4 · shadcn/ui · Radix UI · React Router 7 · axios · vite-plugin-pwa |
| Database       | PostgreSQL 16                                                                 |
| Infrastructure | Docker · Docker Compose · Nginx                                               |
| Tooling        | Bruno (manual API testing) · ESLint · TypeScript                              |

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

2. Create `backend/.env` (a template is provided in `backend/.env.example`):

   ```env
   DATABASE_URL=postgresql://techbastian:<password>@db:5432/identitydb
   SECRET_KEY=<your-secret-key>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. Start the full stack:

   ```bash
   docker compose up --build
   ```

4. Open the services:

   - Admin panel: <http://localhost:5173>
   - API: <http://localhost:8000>
   - Swagger docs: <http://localhost:8000/docs>

### Default admin

The startup seed creates a bootstrap administrator so the panel is usable on first launch:

| Username | Password   |
|----------|------------|
| `admin`  | `admin123` |

> Change this password — or delete the user and create a fresh administrator — before exposing the service outside a development machine.

### Production deployment

`docker-compose.prod.yml` is an overlay, not a replacement. It rebinds the API and the SPA to `127.0.0.1`, sets `VITE_API_URL=/api` (so the SPA talks to the API through a reverse proxy on the same origin) and tightens `CORS_ORIGINS`. Bring it up with:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Then point an Nginx vhost on the host machine at `127.0.0.1:5173` (SPA) and `127.0.0.1:8001/` proxied under `/api/`.

## API reference

| Method | Endpoint                                       | Auth | Permission                | Description                              |
|--------|------------------------------------------------|------|---------------------------|------------------------------------------|
| GET    | `/health`                                      | —    | —                         | Health check                             |
| POST   | `/auth/login`                                  | —    | —                         | Exchange credentials for a JWT           |
| POST   | `/users/register`                              | —    | —                         | Register a new user (no role)            |
| GET    | `/users/me`                                    | JWT  | —                         | Current user info                        |
| GET    | `/users/`                                      | JWT  | `users:read`              | List users                               |
| GET    | `/users/{id}`                                  | JWT  | `users:read`              | Get a user                               |
| PUT    | `/users/{id}`                                  | JWT  | `users:update`            | Update username / email / active flag    |
| DELETE | `/users/{id}`                                  | JWT  | `users:delete`            | Delete a user                            |
| PATCH  | `/users/{id}/role`                             | JWT  | `users:assign_role`       | Assign or clear a user's role            |
| POST   | `/roles/`                                      | JWT  | `roles:create`            | Create a role                            |
| GET    | `/roles/`                                      | JWT  | `roles:read`              | List roles (with their permissions)      |
| GET    | `/roles/{id}`                                  | JWT  | `roles:read`              | Get a role                               |
| PUT    | `/roles/{id}`                                  | JWT  | `roles:update`            | Rename a role                            |
| DELETE | `/roles/{id}`                                  | JWT  | `roles:delete`            | Delete a role (blocked if users hold it) |
| POST   | `/permissions/`                                | JWT  | `permissions:create`      | Create a permission                      |
| GET    | `/permissions/`                                | JWT  | `permissions:read`        | List permissions                         |
| GET    | `/permissions/{id}`                            | JWT  | `permissions:read`        | Get a permission                         |
| PUT    | `/permissions/{id}`                            | JWT  | `permissions:update`      | Update a permission                      |
| DELETE | `/permissions/{id}`                            | JWT  | `permissions:delete`      | Delete a permission                      |
| POST   | `/permissions/roles/{role_id}/assign`          | JWT  | `roles:assign_permission` | Grant a permission to a role             |
| DELETE | `/permissions/roles/{role_id}/{permission_id}` | JWT  | `roles:remove_permission` | Revoke a permission from a role          |

## Permission catalog

The seed registers fifteen permissions, all granted to the `admin` role:

| Domain        | Permissions                                                                                          |
|---------------|------------------------------------------------------------------------------------------------------|
| `users`       | `read`, `create`, `update`, `delete`, `assign_role`                                                  |
| `roles`       | `read`, `create`, `update`, `delete`, `assign_permission`, `remove_permission`                       |
| `permissions` | `read`, `create`, `update`, `delete`                                                                 |

## Project structure

```
identity-core/
├── backend/
│   ├── app/
│   │   ├── models/          # SQLAlchemy: user, role, permission (+ role_permissions table)
│   │   ├── schemas/         # Pydantic: user, role, permission, auth
│   │   ├── services/        # Business logic: user, role, permission, auth
│   │   ├── routers/         # FastAPI routers: /users, /roles, /permissions, /auth
│   │   ├── security/        # hashing, jwt_handler, dependencies (get_db, get_current_user, require_permission)
│   │   ├── database.py      # Engine + SessionLocal + DeclarativeBase
│   │   ├── seed.py          # Idempotent bootstrap: admin role, permissions, admin user
│   │   └── main.py          # FastAPI app, CORS, router registration
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # axios client + typed endpoint helpers
│   │   ├── components/      # layout, protected-route, page-header, no-permission, ui/ (shadcn)
│   │   ├── context/         # auth-context (login, logout, refreshUser)
│   │   ├── hooks/           # use-permissions (can(...))
│   │   ├── pages/           # login, dashboard, users, roles, permissions, me
│   │   ├── types/           # shared TypeScript types
│   │   ├── router.tsx       # React Router config + ProtectedRoute composition
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile           # Multi-stage: node build → nginx runtime
│   ├── nginx.conf           # SPA fallback + cache headers
│   ├── vite.config.ts       # PWA manifest + service worker
│   └── package.json
├── docs/
│   └── diario/              # Development diary, one entry per session (Spanish)
├── docker-compose.yml       # Dev: api + frontend + db
└── docker-compose.prod.yml  # Prod overlay: bind to 127.0.0.1, VITE_API_URL=/api
```

## Project status

**Done**

- User registration and JWT authentication
- Protected routes and `OAuth2PasswordBearer` extraction
- Full RBAC: roles, permissions, many-to-many assignment, `require_permission` enforcement
- Full CRUD on users, roles and permissions
- Idempotent data seed (admin role + admin user + permission catalog)
- Correct HTTP error handling (`401`, `403`, `404`, `409`)
- Configurable CORS
- React admin panel with all CRUD flows and permission-gated UI
- Responsive layout + PWA support (manifest, service worker, iOS safe areas)
- Containerized stack with dev + prod compose files and Nginx-friendly production layout

**Next**

- Automated test suite (pytest for the API, component tests for the SPA)
- Refresh tokens / configurable session policies
- Audit log of sensitive operations
- Public-facing deployment behind Nginx + TLS on `identity.techbastian.com`

## Documentation

Detailed per-session development notes live in [`docs/diario/`](docs/diario/) (Spanish). Each file documents one work session: what was built, why, the decisions taken, and the manual verification performed with Bruno. They are part of the academic deliverable alongside this README and the project memoir.

## Author

**Andrei Sebastian Ionescu**
TFG — DAM, *Desarrollo de Aplicaciones Multiplataforma*
