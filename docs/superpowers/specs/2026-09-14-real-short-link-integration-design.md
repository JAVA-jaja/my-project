# Real Short-Link Integration Design

## Goal

Replace the Frontend mock shortener with the existing Go API and extend the Backend so optional activation and expiration times are stored and enforced. Links outside their active window must not redirect or increment their click count.

## Architecture

The React Frontend calls the Go REST API. The API validates input, stores links in PostgreSQL through GORM, returns the canonical short URL, exposes link statistics, and performs redirects. Browser-local date and time values are converted to UTC ISO 8601 strings before requests are sent.

The Frontend reads the API origin from `VITE_API_URL`, defaulting to `http://localhost:8080`. The Backend permits the configured Frontend origin through CORS, defaulting to Vite's local origin `http://localhost:5173`.

## API Contract

`POST /api/links` accepts:

```json
{
  "url": "https://example.com",
  "startAt": "2026-09-14T07:30:00.000Z",
  "endAt": "2026-09-14T08:30:00.000Z"
}
```

`startAt` and `endAt` are optional together. If supplied, both are required and `endAt` must be after `startAt`. The response includes `shortCode`, `shortUrl`, `destinationUrl`, `clickCount`, `startAt`, `endAt`, and `createdAt`.

`GET /api/links/:code` returns the stored metadata and click count. It remains available outside the redirect window so users can inspect statistics.

`GET /:code` redirects only when the current server time is within the optional inclusive start and exclusive end window. It returns `403` before activation, `410` after expiration, and does not increment the counter in either case.

## Database and Migration

Add nullable `start_at TIMESTAMPTZ` and `end_at TIMESTAMPTZ` columns using a new incremental migration. Existing links remain permanently active because both fields are null. Restore a runnable migration command that applies pending SQL migrations and records applied versions.

## Frontend Behavior

The shortening form sends the URL and, when expiration is enabled, combines each local date/time pair and converts it with `Date.toISOString()`. Both dates are required when expiration is enabled. API validation or network failures are displayed in the existing form message area.

The result page displays the URL returned by the Backend. The statistics form extracts the short code from a Juno Short URL or accepts a raw code, calls `GET /api/links/:code`, and displays the real `clickCount`. Loading states prevent duplicate submissions.

## Error Handling

The Backend returns stable JSON error messages for malformed URLs, incomplete or invalid windows, missing links, inactive links, expired links, and internal failures. Database errors are logged server-side without exposing internals. The Frontend maps API errors to readable messages and handles an unreachable API.

## Testing

Backend tests cover request validation, timestamp persistence, active-window decisions, redirects, and click-count behavior. Service tests use a test database abstraction or SQL mock as appropriate. Frontend tests mock the HTTP boundary, not application components, and cover payload conversion, successful creation, statistics, and errors. Final verification runs all Go tests, Frontend tests, and both builds.

## Scope

Changes are limited to this repository's Backend and Frontend. Authentication, custom aliases, analytics history, and deployment configuration are out of scope.
