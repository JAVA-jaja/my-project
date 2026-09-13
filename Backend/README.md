# Short URL Backend

Go API using Gin, GORM, and PostgreSQL.

## Run locally

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d`.
3. Run `go run ./cmd/migrate` to apply pending SQL files in `migrations/`.
4. Run `go run ./cmd/api`.

The migrate command reads `DATABASE_URL` from `.env`, applies each migration once,
and records completed versions in `schema_migrations`. It can be run again safely.
PostgreSQL must already be running; Docker is optional if you have PostgreSQL installed locally.

With Docker Compose, pgAdmin 4 is available at `http://localhost:5050`.
Sign in using `PGADMIN_DEFAULT_EMAIL` and `PGADMIN_DEFAULT_PASSWORD` from `.env`
(defaults: `admin@example.com` / `change-me`). To register this database in pgAdmin,
use host `postgres`, port `5432`, database `shorturl`, user `shorturl`, and password
`change-me`. The pgAdmin data volume keeps its settings across container restarts.

## Endpoints

- `GET /health`
- `POST /api/links` with `{ "url": "https://example.com", "startAt": "2026-09-14T07:30:00Z", "endAt": "2026-09-14T08:30:00Z" }`. The UTC timestamps are optional together.
- `GET /api/links/:code`
- `GET /:code`

Redirects before `startAt` return HTTP 403 and redirects at or after `endAt` return HTTP 410. Blocked redirects do not increase `clickCount`.

Set `BASE_URL` to the public redirect origin so `shortUrl` is copyable. Without it, the API uses the request host. Set `FRONTEND_ORIGIN` to the deployed Frontend origin when it differs from `http://localhost:5173`. The Frontend development server proxies `/api` to port 8080; set `VITE_API_BASE_URL` for a separately hosted API.
