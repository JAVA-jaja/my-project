# Short URL Backend

Go API using Gin, GORM, and PostgreSQL.

## Run with Docker

From this directory, run `docker compose up --build -d`. This starts PostgreSQL,
runs the SQL migrations, then starts the API and Frontend. Open the Frontend at
`http://localhost:5173`, the API at `http://localhost:8080`, or pgAdmin at
`http://localhost:5050`. Run `docker compose down` to stop the services while
keeping database data.

The container database hostname is `postgres`. Compose uses `DATABASE_URL_DOCKER`
if it is set; otherwise it uses the bundled PostgreSQL credentials. The existing
`DATABASE_URL` in `.env` remains for running Go commands on the host.

For a separate Render Frontend service, set its `BACKEND_URL` environment variable
to the reachable Backend origin (for example, `https://your-backend.onrender.com`,
without a trailing slash), then redeploy. Compose sets this variable to
`http://backend:8080` automatically. The Frontend serves `/api/` and `/health`
through this backend; Render cannot resolve Compose's `backend` hostname.

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

Set `BASE_URL` to the public redirect origin so `shortUrl` is copyable. Without it, the API uses the request host. Local Compose allows all frontend origins so it also works through VM or cluster-assigned ports. In production, set `FRONTEND_ORIGIN` to the exact deployed Frontend origin; multiple origins may be comma-separated. The Frontend development server proxies `/api` to port 8080; set `VITE_API_BASE_URL` for a separately hosted API.
