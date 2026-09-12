# Juno Short Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive React + Vite mock frontend that reproduces the supplied Juno Short screens and interactions.

**Architecture:** A single React application uses top-level view state to switch between shortening, result, and click-count views. Focused components own each view, while pure utility functions provide deterministic mock short codes, click counts, and URL/date validation.

**Tech Stack:** React 18, Vite 5, Vitest, Testing Library, CSS, Google Fonts Jua

**Spec:** `Frontend/docs/2026-09-12-juno-short-frontend-design.md`

## Global Constraints

- All created and modified files remain under `my-project/Frontend`.
- Do not read or modify `my-project/Backend`.
- Use mock data and browser APIs only; do not call a backend.
- Use the Jua typeface with a local sans-serif fallback.
- Support desktop and narrow mobile layouts.
- Present validation and clipboard feedback inline without browser alerts.

---

## File Map

- `Frontend/package.json` — scripts and frontend dependencies.
- `Frontend/index.html` — Vite document entry and metadata.
- `Frontend/src/main.jsx` — React bootstrap.
- `Frontend/src/App.jsx` — application navigation and shared layout.
- `Frontend/src/styles.css` — complete responsive visual system.
- `Frontend/src/lib/mockShortener.js` — pure URL/date validation and deterministic mock values.
- `Frontend/src/lib/mockShortener.test.js` — unit tests for pure functions.
- `Frontend/src/components/Header.jsx` — brand and click-check navigation.
- `Frontend/src/components/InfoCard.jsx` — shared explanatory footer.
- `Frontend/src/components/Mascot.jsx` — original CSS-drawn mascot variants.
- `Frontend/src/components/ShortenView.jsx` — shortening and expiration form.
- `Frontend/src/components/ResultView.jsx` — generated link output and copy action.
- `Frontend/src/components/StatsView.jsx` — click-count checker.
- `Frontend/src/App.test.jsx` — end-to-end component interaction tests.
- `Frontend/src/test/setup.js` — DOM matcher and clipboard test setup.
- `Frontend/vite.config.js` — Vite and Vitest configuration.

### Task 1: Scaffold and Pure Mock Domain

**Files:**
- Create: `Frontend/package.json`
- Create: `Frontend/index.html`
- Create: `Frontend/vite.config.js`
- Create: `Frontend/src/test/setup.js`
- Create: `Frontend/src/lib/mockShortener.js`
- Test: `Frontend/src/lib/mockShortener.test.js`

**Interfaces:**
- Produces: `validateHttpUrl(value): boolean`
- Produces: `validateDateRange(startDate, endDate): string`
- Produces: `makeShortUrl(value): string`
- Produces: `mockClickCount(value): number`

- [ ] **Step 1: Add the Vite/Vitest scaffold**

Create package scripts `dev`, `build`, `preview`, and `test`; dependencies `react` and `react-dom`; and dev dependencies `@vitejs/plugin-react`, `vite`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event`. Configure Vitest with `environment: 'jsdom'` and `setupFiles: './src/test/setup.js'`.

- [ ] **Step 2: Write failing pure-function tests**

```js
import { describe, expect, it } from 'vitest'
import { makeShortUrl, mockClickCount, validateDateRange, validateHttpUrl } from './mockShortener'

describe('mock shortener domain', () => {
  it('accepts only http and https URLs', () => {
    expect(validateHttpUrl('https://example.com/path')).toBe(true)
    expect(validateHttpUrl('ftp://example.com')).toBe(false)
    expect(validateHttpUrl('hello')).toBe(false)
  })

  it('rejects an end date before the start date', () => {
    expect(validateDateRange('2026-09-12', '2026-09-11')).toBe('End date must be on or after start date.')
    expect(validateDateRange('2026-09-12', '2026-09-12')).toBe('')
  })

  it('returns stable mock values', () => {
    expect(makeShortUrl('https://example.com/a')).toBe(makeShortUrl('https://example.com/a'))
    expect(makeShortUrl('https://example.com/a')).toMatch(/^https:\/\/junoshort.com\/[A-Za-z0-9]{6}$/)
    expect(mockClickCount('https://junoshort.com/ABC123')).toBe(mockClickCount('https://junoshort.com/ABC123'))
    expect(mockClickCount('https://junoshort.com/ABC123')).toBeGreaterThanOrEqual(0)
  })
})
```

- [ ] **Step 3: Run the test to verify failure**

Run: `npm install && npm test -- --run src/lib/mockShortener.test.js`

Expected: FAIL because `mockShortener.js` does not exist.

- [ ] **Step 4: Implement the pure functions**

Use `new URL(value)` plus a protocol allowlist. Return a date error only when both dates exist and `endDate < startDate`. Derive a 32-bit integer hash from the input; map it into a six-character alphanumeric code for `makeShortUrl` and into `0..99` for `mockClickCount`.

- [ ] **Step 5: Run unit tests**

Run: `npm test -- --run src/lib/mockShortener.test.js`

Expected: all four assertions groups PASS.

- [ ] **Step 6: Commit**

```powershell
git add Frontend/package.json Frontend/package-lock.json Frontend/index.html Frontend/vite.config.js Frontend/src/test/setup.js Frontend/src/lib
git commit -m "chore: scaffold Juno Short frontend"
```

### Task 2: Shared Shell and Shortening Flow

**Files:**
- Create: `Frontend/src/main.jsx`
- Create: `Frontend/src/App.jsx`
- Create: `Frontend/src/components/Header.jsx`
- Create: `Frontend/src/components/InfoCard.jsx`
- Create: `Frontend/src/components/Mascot.jsx`
- Create: `Frontend/src/components/ShortenView.jsx`
- Create: `Frontend/src/styles.css`
- Test: `Frontend/src/App.test.jsx`

**Interfaces:**
- Consumes: `validateHttpUrl`, `validateDateRange`, and `makeShortUrl` from Task 1.
- Produces: `App()` with initial view `shorten`.
- Produces: `ShortenView({ onShorten })`, where `onShorten({ originalUrl, shortUrl, startDate, endDate })` opens the result view.
- Produces: `Header({ onLogoClick, onStatsClick })`.

- [ ] **Step 1: Write failing tests for initial and expiration states**

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('shortening flow', () => {
  it('reveals expiration fields and validates URLs', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { name: /shorten a link in one click/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /set expiration/i }))
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument()
    await user.type(screen.getByLabelText(/url to shorten/i), 'not-a-url')
    await user.click(screen.getByRole('button', { name: /short url/i }))
    expect(screen.getByText(/enter a valid http or https url/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL because `App.jsx` does not exist.

- [ ] **Step 3: Implement shared layout and shortening form**

Build semantic header, main, form, and footer markup. Keep URL, expiration toggle, dates, error, and clipboard status in `ShortenView`; submit a generated result only after URL/date validation. Implement Paste using `navigator.clipboard.readText()` and catch rejected promises into an inline message.

- [ ] **Step 4: Add the reference-aligned responsive styles**

Define CSS custom properties for cream `#fffdf0`, purple `#a784e8`, mint `#bee4df`, ink `#111111`, and pale input `#fffdf4`. Use a centered maximum width of 1180px, rounded panels, Jua typography, visible focus rings, and a mobile breakpoint at 700px. Draw mascot faces with CSS circles, ears, eyes, and accent marks; do not embed copied artwork.

- [ ] **Step 5: Run the interaction test and build**

Run: `npm test -- --run src/App.test.jsx`

Expected: PASS.

Run: `npm run build`

Expected: production bundle created successfully.

- [ ] **Step 6: Commit**

```powershell
git add Frontend/src
git commit -m "feat: add Juno Short shortening form"
```

### Task 3: Result and Clipboard Flow

**Files:**
- Modify: `Frontend/src/App.jsx`
- Create: `Frontend/src/components/ResultView.jsx`
- Modify: `Frontend/src/App.test.jsx`
- Modify: `Frontend/src/styles.css`

**Interfaces:**
- Consumes: result object `{ originalUrl, shortUrl, startDate, endDate }` from `ShortenView`.
- Produces: `ResultView({ result, onRestart })`.

- [ ] **Step 1: Add a failing result-flow test**

```jsx
it('shows and copies a generated short URL, then restarts', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.type(screen.getByLabelText(/url to shorten/i), 'https://example.com/long-path')
  await user.click(screen.getByRole('button', { name: /short url/i }))
  expect(screen.getByRole('heading', { name: /your short link is ready/i })).toBeInTheDocument()
  expect(screen.getByDisplayValue('https://example.com/long-path')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /^copy$/i }))
  expect(screen.getByText(/copied/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: /another one/i }))
  expect(screen.getByRole('heading', { name: /shorten a link/i })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL because the result view is absent.

- [ ] **Step 3: Implement result rendering and copying**

Render both URLs in readonly inputs, write `result.shortUrl` through `navigator.clipboard.writeText`, catch failures, announce status with `aria-live="polite"`, and make “Do you want another one?” a real button that resets the app to the shorten view.

- [ ] **Step 4: Run tests and build**

Run: `npm test -- --run src/App.test.jsx && npm run build`

Expected: all tests PASS and build succeeds.

- [ ] **Step 5: Commit**

```powershell
git add Frontend/src/App.jsx Frontend/src/App.test.jsx Frontend/src/components/ResultView.jsx Frontend/src/styles.css
git commit -m "feat: add mock short-link result flow"
```

### Task 4: Click-Count Checker and Final Verification

**Files:**
- Modify: `Frontend/src/App.jsx`
- Modify: `Frontend/src/components/Header.jsx`
- Create: `Frontend/src/components/StatsView.jsx`
- Modify: `Frontend/src/App.test.jsx`
- Modify: `Frontend/src/styles.css`

**Interfaces:**
- Consumes: `mockClickCount(value): number` from Task 1.
- Produces: `StatsView()` with local URL, count, error, and clipboard status state.

- [ ] **Step 1: Add a failing stats-flow test**

```jsx
it('checks a short URL and returns a stable mock count', async () => {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('button', { name: /check total press/i }))
  expect(screen.getByRole('heading', { name: /click count right here/i })).toBeInTheDocument()
  await user.type(screen.getByLabelText(/short url to check/i), 'https://junoshort.com/ABC123')
  await user.click(screen.getByRole('button', { name: /^check$/i }))
  expect(screen.getByTestId('click-count')).toHaveTextContent(/^\d+$/)
  expect(screen.getByText('Times!')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify failure**

Run: `npm test -- --run src/App.test.jsx`

Expected: FAIL because the stats view is absent.

- [ ] **Step 3: Implement stats navigation and interaction**

Make the header brand return to `shorten` and “Check Total Press” open `stats`. In `StatsView`, validate non-empty input, implement Paste with clipboard failure feedback, calculate the stable mock count on submit, and show the count only after a valid check.

- [ ] **Step 4: Run complete automated verification**

Run: `npm test -- --run`

Expected: all unit and interaction tests PASS.

Run: `npm run build`

Expected: Vite production build succeeds with no errors.

- [ ] **Step 5: Perform visual verification**

Run: `npm run dev -- --host 127.0.0.1`

Inspect the shorten view with expiration closed and open, result view, stats view before checking, and stats view after checking at 1200px desktop width. Repeat at 390px width and confirm there is no horizontal overflow, controls remain operable, focus indicators are visible, and text does not overlap.

- [ ] **Step 6: Commit**

```powershell
git add Frontend/src
git commit -m "feat: add mock click-count checker"
```

