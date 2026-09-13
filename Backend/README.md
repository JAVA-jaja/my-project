# Short URL Backend

Go API using Gin, GORM, and PostgreSQL.

## Run locally

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d`.
3. Apply both `*.up.sql` migrations in numeric order to the database.
4. Run `go mod tidy` and `go run ./cmd/api`.

## Endpoints

- `GET /health`
- `POST /api/links` with `{ "url": "https://example.com", "startDate": "2026-09-13", "endDate": "2026-10-13" }`. Dates are optional. Redirects before the start or after the end return HTTP 410.
- `GET /api/links/:code`
- `GET /:code`

Set `BASE_URL` to the public redirect origin so `shortUrl` is copyable. Without it, the API uses the request host. The frontend development server proxies `/api` to port 8080; set `VITE_API_BASE_URL` for a separately hosted API.
