# SQL Dojo

Local SQL learning app with a React + Vite frontend, Express backend, and PostgreSQL tutorial database.

## Run

```sh
docker compose up --build
```

Then open:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:4000/health

## Services

- `db`: PostgreSQL 16 seeded with tutorial tables.
- `backend`: Express API with `GET /lessons/:level` and safe `POST /query`.
- `frontend`: React + Vite shell with Easy, Intermediate, and Hard lesson navigation.

The query endpoint only accepts one `SELECT` or `WITH` statement, rejects destructive SQL keywords, uses a read-only database user, and runs each query inside a read-only transaction.
