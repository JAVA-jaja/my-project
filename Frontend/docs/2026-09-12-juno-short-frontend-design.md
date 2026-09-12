# Juno Short Frontend Design

## Scope

Create a standalone React + Vite frontend in `my-project/Frontend`. The app uses mock data and client-side interactions only. No Backend files are read or modified.

## Visual Direction

- Match the five supplied desktop references using a cream page background, purple header and buttons, and mint content panels.
- Use the Jua typeface throughout, loaded from Google Fonts with a local fallback.
- Keep the composition centered and responsive so controls stack cleanly on smaller screens.
- Use small, original CSS-drawn mascot illustrations rather than copying external image assets.

## Application Structure

The app is a single React page driven by view state rather than a router. Reusable components provide the header, information footer, form controls, and mascot treatment.

The three views are:

1. **Shorten form** — accepts a URL, supports clipboard paste, and optionally reveals start/end expiration dates.
2. **Short-link result** — displays the original URL and a deterministic mock short URL, supports copying, and returns to the form.
3. **Click-count checker** — opened from the header, accepts a short URL, supports clipboard paste, and displays a stable mock count.

## Interaction and Validation

- Shortening requires a syntactically valid `http` or `https` URL.
- When expiration is enabled, both dates are available and an end date earlier than the start date is rejected.
- Clipboard paste and copy use the browser Clipboard API, with clear success or failure feedback.
- Checking requires a non-empty URL. A mock count is computed consistently from the submitted value so repeated checks feel stable.
- Error and status messages are presented inline and do not use browser alerts.

## Testing and Verification

- Add component/interaction tests for view navigation, expiration controls, validation, shortening, copying where mockable, and click-count display.
- Run the automated test suite and production build.
- Visually inspect the rendered page at desktop and mobile widths against the supplied references.

## Boundaries

- All new files and changes remain under `my-project/Frontend`.
- There is no network integration with the Backend and no persistence beyond the current page session.
- No authentication, analytics, deployment, or API configuration is included.
