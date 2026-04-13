# Mobile Preview Shell Design

## Goal

Provide a local mobile preview workspace inside the app so development can be inspected on `localhost` without pushing to Vercel first.

The preview must support real navigation into these existing routes:

- `/diagnose`
- `/plan`
- `/library`
- `/profile`

It must not create a second product UI. It should preview the real routes inside a mobile-sized shell.

## Scope

### In scope

- A dedicated `/mobile-preview` route
- A mobile-sized shell with a large-phone width target
- Route tabs for the four supported entry routes
- A same-origin embedded preview of the real route
- Query-param based initial route selection such as `?route=/library`
- Safe local workflow for VSCode and browser-based development

### Out of scope

- Any change to the actual business logic of `/diagnose`, `/plan`, `/library`, `/profile`
- Any product behavior changes outside the preview route
- Complex iframe-to-parent route synchronization
- Mock pages or duplicated route implementations
- Mobile layout redesign of `/library` itself in this slice

## Key decisions

### Preview architecture

Use a dedicated preview page at `/mobile-preview` that renders a phone-style shell and loads the chosen real route inside a same-origin `iframe`.

Reason:

- It previews the real route instead of a copied mock
- It avoids leaking preview logic into production routes
- It gives the user a stable local “mobile lab” for iterative work

### Default device shape

The shell targets a larger phone width, roughly `430px` wide, with top safe-area padding and a bottom inset area.

This is intentionally larger than a compact phone preview because the user asked for a “偏大的” mobile frame.

### Route control

The preview route owns only the entry route selection.

- `/mobile-preview?route=/library` sets the starting page
- Clicking route tabs updates the query param and iframe `src`
- If the embedded route later navigates internally, the parent preview URL does not attempt to mirror every internal change

This keeps the implementation simple and robust.

### Browser chrome

Do not simulate a full Safari or Chrome shell.

Instead, use a light preview header that shows:

- a preview title
- the current entry route
- route tabs
- the current route text

This keeps the work focused on product preview, not fake browser visuals.

## UX structure

The `/mobile-preview` page has three layers:

1. Desktop canvas
   Centers the phone shell and gives enough room for local inspection

2. Mobile shell
   Fixed-width phone container with rounded corners, shadow, safe area, and internal scrolling

3. Embedded route
   The real app route rendered in an iframe sized to the mobile viewport

## Data flow

1. Read the `route` search param
2. Validate it against the supported route allowlist
3. Fallback to `/library` if invalid or missing
4. Render route tabs using the current value
5. Set iframe `src` to the selected real route

## Constraints

- Only the four approved routes may be embedded
- Unsupported `route` values must fall back to `/library`
- Preview logic must be isolated to the preview page and any small helper created for it
- No changes to retrieval, ranking, or study flow behavior

## Testing strategy

Add focused tests for:

- route param allowlist / fallback behavior
- tab selection behavior
- iframe `src` generation
- default route rendering

Do not broaden this slice into visual redesign tests for `/library`.

## Follow-up slices

This preview shell exists to support later mobile layout work.

Likely next slices:

- `/library` mobile-specific layout tuning
- Xiaohongshu two-column card experiments inside real mobile preview
- preview polish such as copyable route link or viewport presets

Those are explicitly separate from this slice.

## Approved follow-up update: Xiaohongshu mobile masonry in `/library`

This design is now extended with one narrow follow-up behavior:

- only on `/library`
- only at mobile width
- only when the platform filter is explicitly `Xiaohongshu`

the results list may switch from the default single-column mobile list into a two-column Xiaohongshu-style masonry feed.

### Follow-up scope

In scope:

- conditional two-column masonry layout for `/library`
- reuse of the existing `ContentCard`
- continued use of the Xiaohongshu `3:4` portrait media ratio

Out of scope:

- changing the default `/library` layout for other platforms
- changing desktop layout behavior
- changing `/diagnose`, `/plan`, or `/profile`
- introducing a second card component

### Follow-up trigger rule

Enable the masonry layout only when all conditions are true:

1. current page is `/library`
2. viewport is mobile-sized
3. `selectedPlatform === "Xiaohongshu"`

Otherwise preserve the current layout.

### Follow-up implementation direction

Use a small library-layout helper plus a conditional list-container class switch.

Prefer a true masonry-like presentation such as CSS columns over a generic equal-row grid, so the result feels closer to a RedNote note feed.
