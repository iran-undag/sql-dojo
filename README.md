# SQL Dojo

Local SQL learning app with a React + Vite frontend, Express backend, and PostgreSQL tutorial database.

## Run

### Prerequisites

- Docker
- Docker Compose

### Start the app

From the repository root:

```sh
docker compose up --build -d
```

Wait for the services to start, then open:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:4000/health

### Stop the app

```sh
docker compose down
```

### Reset the database

```sh
docker compose down -v
```

### Get list of tables

```sh
select * from information_schema.tables where table_schema='public';
```

## Services

- `db`: PostgreSQL 16 seeded with tutorial tables.
- `backend`: Express API with `GET /lessons/:level` and safe `POST /query`.
- `frontend`: React + Vite shell with Easy, Intermediate, and Hard lesson navigation.

The query endpoint only accepts one `SELECT` or `WITH` statement, rejects destructive SQL keywords, uses a read-only database user, and runs each query inside a read-only transaction.
