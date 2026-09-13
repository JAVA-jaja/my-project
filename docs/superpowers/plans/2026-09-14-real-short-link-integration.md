# Real Short-Link Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Frontend mocks with the Go/PostgreSQL API and enforce optional UTC activation windows without counting blocked redirects.

**Architecture:** Add nullable activation timestamps through an incremental migration, extend the Go model/service/controller contract, and centralize active-window decisions in the service. Add a small Frontend API module that converts local form values to UTC and supplies real create/statistics data to existing views.

**Tech Stack:** Go 1.25, Gin, GORM, PostgreSQL, React 18, React Router, Vite, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-09-14-real-short-link-integration-design.md`

## Global Constraints

- Existing rows with null `start_at` and `end_at` remain permanently active.
- Redirect windows are start-inclusive and end-exclusive.
- Blocked redirects never increment `click_count`.
- Browser-local timestamps are converted to UTC ISO 8601 strings.
- API origin defaults to `http://localhost:8080`; allowed Frontend origin defaults to `http://localhost:5173`.

---

### Task 1: Persistence and activation-window service

**Files:**
- Create: `Backend/migrations/000002_add_link_active_window.up.sql`
- Create: `Backend/migrations/000002_add_link_active_window.down.sql`
- Modify: `Backend/models/link.go`
- Modify: `Backend/services/link_service.go`
- Test: `Backend/services/link_service_test.go`

**Interfaces:**
- Produces: `Create(ctx context.Context, destinationURL string, startAt, endAt *time.Time) (*models.Link, error)`
- Produces: `ResolveAndIncrement(ctx context.Context, code string, now time.Time) (string, error)` and errors `ErrLinkNotActive`, `ErrLinkExpired`.

- [ ] Write service tests using an in-memory GORM test database for permanent, future, active, and expired links; assert blocked counters remain zero.
- [ ] Run `go test ./services` and verify failures caused by missing timestamp fields/signatures.
- [ ] Add nullable `StartAt`/`EndAt` fields and migrations:

```sql
ALTER TABLE links ADD COLUMN IF NOT EXISTS start_at TIMESTAMPTZ NULL;
ALTER TABLE links ADD COLUMN IF NOT EXISTS end_at TIMESTAMPTZ NULL;
```

- [ ] Update create and atomic redirect queries so the update predicate requires `start_at IS NULL OR start_at <= ?` and `end_at IS NULL OR end_at > ?`; distinguish missing, future, and expired rows after a zero-row update.
- [ ] Run `go test ./services` and verify all cases pass.

### Task 2: HTTP API contract, validation, and CORS

**Files:**
- Modify: `Backend/controllers/link_controller.go`
- Modify: `Backend/routes/routes.go`
- Modify: `Backend/cmd/api/main.go`
- Test: `Backend/controllers/link_controller_test.go`
- Test: `Backend/routes/routes_test.go`

**Interfaces:**
- Consumes: Task 1 service signatures and errors.
- Produces: JSON fields `startAt` and `endAt`; redirect statuses 403 and 410; configurable `FRONTEND_ORIGIN` CORS.

- [ ] Write controller tests for omitted timestamps, valid RFC3339 timestamps, one missing boundary, reversed boundaries, future redirect, expired redirect, and successful redirect.
- [ ] Write route tests asserting preflight responses contain `Access-Control-Allow-Origin`, methods, and headers only for the configured origin.
- [ ] Run `go test ./controllers ./routes` and verify contract tests fail.
- [ ] Parse optional `*time.Time` request fields, require both-or-neither, validate `endAt.After(startAt)`, pass them to the service, and map inactive/expired errors to 403/410 JSON responses.
- [ ] Add a Gin CORS middleware allowing `GET, POST, OPTIONS` and `Content-Type` for `FRONTEND_ORIGIN` (default `http://localhost:5173`).
- [ ] Run `go test ./controllers ./routes` and verify all cases pass.

### Task 3: Runnable incremental migrations

**Files:**
- Create: `Backend/cmd/migrate/main.go`
- Modify: `Backend/README.md`
- Test: `Backend/cmd/migrate/main_test.go`

**Interfaces:**
- Produces: a `go run ./cmd/migrate` command that discovers numbered `*.up.sql` files, records versions in `schema_migrations`, and applies each file once in a transaction.

- [ ] Write tests for migration filename ordering and version parsing through `migrationFiles(fsys fs.FS) ([]migrationFile, error)`.
- [ ] Run `go test ./cmd/migrate` and verify failure because the command/helper is absent.
- [ ] Implement migration discovery from the repository `migrations` directory, then execute pending files transactionally and record their numeric versions.
- [ ] Update README commands to copy `.env`, start PostgreSQL, migrate, and start the API.
- [ ] Run `go test ./cmd/migrate` and `go test ./...`.

### Task 4: Frontend API client and UTC conversion

**Files:**
- Create: `Frontend/src/lib/api.js`
- Test: `Frontend/src/lib/api.test.js`
- Modify: `Frontend/src/components/ShortenView.jsx`
- Modify: `Frontend/src/components/StatsView.jsx`
- Modify: `Frontend/src/App.jsx`
- Test: `Frontend/src/App.test.jsx`
- Create: `Frontend/.env.example`

**Interfaces:**
- Produces: `createLink({url, startAt, endAt})`, `getLink(code)`, `toUtcTimestamp(date, time)`, and `extractShortCode(value)`.
- Consumes: Backend Task 2 API contract.

- [ ] Write API tests with a stubbed `fetch` for successful JSON, non-2xx JSON errors, unreachable API, local-to-UTC conversion, raw codes, and URL code extraction.
- [ ] Run `npm.cmd test -- --run src/lib/api.test.js` and verify missing-module failure.
- [ ] Implement the API module with `import.meta.env.VITE_API_URL || 'http://localhost:8080'`, encoded path segments, and an `ApiError` carrying the server message.
- [ ] Replace mock creation with awaited `createLink`; require both dates when expiration is enabled; convert local date/time values with `new Date(`${date}T${time}`).toISOString()`; disable submit while loading.
- [ ] Replace mock statistics with awaited `getLink(extractShortCode(value))`; display real `clickCount`; disable check while loading.
- [ ] Update App data flow to accept API response names and revise component tests to stub `fetch` responses rather than asserting deterministic mock values.
- [ ] Run `npm.cmd test -- --run` and verify all Frontend tests pass.

### Task 5: End-to-end verification and documentation

**Files:**
- Modify: `Backend/.env.example`
- Modify: `Backend/README.md`
- Modify: `my-project/README.md`

**Interfaces:**
- Documents: `DATABASE_URL`, `BASE_URL`, `PORT`, `FRONTEND_ORIGIN`, and `VITE_API_URL`.

- [ ] Add exact local setup values and terminal commands for PostgreSQL, migrations, API, and Vite.
- [ ] Run `gofmt` on changed Go files.
- [ ] Run `go test ./...` from `Backend`.
- [ ] Run `npm.cmd test -- --run` and `npm.cmd run build` from `Frontend`.
- [ ] Run `git diff --check` and confirm no Backend-unrelated or generated build files are included.
