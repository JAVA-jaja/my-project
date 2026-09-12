# Short URL Backend

Go API using Gin, GORM, and PostgreSQL.

## Run locally

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with `docker compose up -d`.
3. Apply `migrations/000001_create_links.up.sql` to the database.
4. Run `go mod tidy` and `go run ./cmd/api`.

## Endpoints

- `GET /health`
- `POST /api/links` with `{ "url": "https://example.com" }`
- `GET /api/links/:code`
- `GET /:code`
