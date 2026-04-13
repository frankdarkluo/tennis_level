# Mobile Preview Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local `/mobile-preview` route that renders a large-phone preview shell and loads the real `/diagnose`, `/plan`, `/library`, and `/profile` routes inside it.

**Architecture:** Add one isolated preview route plus a small shared helper for route validation. The preview route owns the selected entry route via query param and renders a phone-style container with a same-origin iframe pointing at the real route.

**Tech Stack:** Next.js App Router, React, TypeScript, existing UI primitives, Vitest/Jest-style component tests already used in the repo

---

### Task 1: Define preview-route validation helpers

**Files:**
- Create: `src/lib/mobilePreview/routes.ts`
- Test: `src/__tests__/mobile-preview-routes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import {
  DEFAULT_MOBILE_PREVIEW_ROUTE,
  getMobilePreviewRouteOptions,
  normalizeMobilePreviewRoute
} from "@/lib/mobilePreview/routes";

describe("mobile preview route helpers", () => {
  it("falls back to the default route for unsupported values", () => {
    expect(normalizeMobilePreviewRoute("/unknown")).toBe(DEFAULT_MOBILE_PREVIEW_ROUTE);
    expect(normalizeMobilePreviewRoute("javascript:alert(1)")).toBe(DEFAULT_MOBILE_PREVIEW_ROUTE);
  });

  it("keeps supported routes", () => {
    expect(normalizeMobilePreviewRoute("/library")).toBe("/library");
    expect(normalizeMobilePreviewRoute("/profile")).toBe("/profile");
  });

  it("returns the full supported route list", () => {
    expect(getMobilePreviewRouteOptions().map((option) => option.value)).toEqual([
      "/diagnose",
      "/plan",
      "/library",
      "/profile"
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/__tests__/mobile-preview-routes.test.ts
```

Expected: FAIL because `@/lib/mobilePreview/routes` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```ts
export const MOBILE_PREVIEW_ROUTE_OPTIONS = [
  { value: "/diagnose", label: "Diagnose" },
  { value: "/plan", label: "Plan" },
  { value: "/library", label: "Library" },
  { value: "/profile", label: "Profile" }
] as const;

export const DEFAULT_MOBILE_PREVIEW_ROUTE = "/library";

const SUPPORTED_ROUTES = new Set(MOBILE_PREVIEW_ROUTE_OPTIONS.map((option) => option.value));

export function normalizeMobilePreviewRoute(route: string | null | undefined) {
  if (!route) {
    return DEFAULT_MOBILE_PREVIEW_ROUTE;
  }

  return SUPPORTED_ROUTES.has(route as (typeof MOBILE_PREVIEW_ROUTE_OPTIONS)[number]["value"])
    ? route
    : DEFAULT_MOBILE_PREVIEW_ROUTE;
}

export function getMobilePreviewRouteOptions() {
  return [...MOBILE_PREVIEW_ROUTE_OPTIONS];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/__tests__/mobile-preview-routes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/mobilePreview/routes.ts src/__tests__/mobile-preview-routes.test.ts
git commit -m "Add mobile preview route helpers"
```

### Task 2: Add the mobile preview route UI

**Files:**
- Create: `src/app/mobile-preview/page.tsx`
- Modify: `src/app/library/page.tsx` (only if a shared layout pattern is worth reusing; otherwise leave untouched)
- Test: `src/__tests__/mobile-preview-page.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import MobilePreviewPage from "@/app/mobile-preview/page";

describe("MobilePreviewPage", () => {
  it("defaults to /library when no route is provided", async () => {
    const ui = await MobilePreviewPage({ searchParams: Promise.resolve({}) });
    render(ui);
    expect(screen.getByText("/library")).toBeInTheDocument();
    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute("src", "/library");
  });

  it("renders route tabs and a validated iframe src", async () => {
    const ui = await MobilePreviewPage({ searchParams: Promise.resolve({ route: "/plan" }) });
    render(ui);
    expect(screen.getByRole("link", { name: "Plan" })).toHaveAttribute("href", "/mobile-preview?route=%2Fplan");
    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute("src", "/plan");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/__tests__/mobile-preview-page.test.tsx
```

Expected: FAIL because `src/app/mobile-preview/page.tsx` does not exist yet.

- [ ] **Step 3: Write minimal implementation**

```tsx
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  getMobilePreviewRouteOptions,
  normalizeMobilePreviewRoute
} from "@/lib/mobilePreview/routes";

type MobilePreviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MobilePreviewPage({ searchParams }: MobilePreviewPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const routeParam = Array.isArray(resolvedSearchParams.route)
    ? resolvedSearchParams.route[0]
    : resolvedSearchParams.route;
  const currentRoute = normalizeMobilePreviewRoute(routeParam);
  const routeOptions = getMobilePreviewRouteOptions();

  return (
    <main className="min-h-screen bg-[var(--surface)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <div className="w-full max-w-[430px] rounded-[36px] border border-[var(--line)] bg-white p-4 shadow-soft">
          <div className="space-y-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mobile Preview</p>
              <p className="mt-1 text-sm text-slate-600">{currentRoute}</p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {routeOptions.map((option) => (
                <Link
                  key={option.value}
                  href={`/mobile-preview?route=${encodeURIComponent(option.value)}`}
                  className={option.value === currentRoute
                    ? "rounded-xl bg-brand-500 px-3 py-2 text-center text-sm font-semibold text-white"
                    : "rounded-xl border border-[var(--line)] px-3 py-2 text-center text-sm font-semibold text-slate-700"}
                >
                  {option.label}
                </Link>
              ))}
            </div>
            <Card className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white p-0">
              <div className="h-[calc(100vh-220px)] min-h-[780px] w-full bg-white">
                <iframe
                  title="Mobile preview frame"
                  src={currentRoute}
                  className="h-full w-full border-0"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm test -- src/__tests__/mobile-preview-page.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/mobile-preview/page.tsx src/__tests__/mobile-preview-page.test.tsx
git commit -m "Add mobile preview shell page"
```

### Task 3: Add shell-specific styling and interaction coverage

**Files:**
- Modify: `src/app/mobile-preview/page.tsx`
- Test: `src/__tests__/mobile-preview-page.test.tsx`

- [ ] **Step 1: Extend the test for shell structure**

```tsx
it("renders a large-phone shell and route controls", async () => {
  const ui = await MobilePreviewPage({ searchParams: Promise.resolve({ route: "/diagnose" }) });
  render(ui);

  expect(screen.getByText("Mobile Preview")).toBeInTheDocument();
  expect(screen.getByText("/diagnose")).toBeInTheDocument();
  expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute("src", "/diagnose");
});
```

- [ ] **Step 2: Run test to verify expected failure or missing assertion coverage**

Run:

```bash
npm test -- src/__tests__/mobile-preview-page.test.tsx
```

Expected: Either FAIL or pass without checking shell-specific structure; if it passes, keep the stronger assertions and continue.

- [ ] **Step 3: Refine the page markup minimally**

```tsx
<div className="pointer-events-none mx-auto mb-3 h-1.5 w-24 rounded-full bg-slate-300" />
<div className="rounded-[28px] border border-[var(--line)] bg-white p-3 shadow-inner">
  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Mobile Preview</p>
      <p className="mt-1 text-sm text-slate-600">{currentRoute}</p>
    </div>
    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">430px</span>
  </div>
  ...
</div>
```

- [ ] **Step 4: Run the focused tests**

Run:

```bash
npm test -- src/__tests__/mobile-preview-page.test.tsx src/__tests__/mobile-preview-routes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/mobile-preview/page.tsx src/__tests__/mobile-preview-page.test.tsx
git commit -m "Polish mobile preview shell structure"
```

### Task 4: Verify against the existing app surface

**Files:**
- No new code required unless verification reveals a narrow issue

- [ ] **Step 1: Run targeted tests first**

Run:

```bash
npm test -- src/__tests__/mobile-preview-routes.test.ts src/__tests__/mobile-preview-page.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run broader regression checks**

Run:

```bash
npm test
npm run validate:data
npm run build
```

Expected:

- all tests pass
- data validation passes
- production build passes

- [ ] **Step 3: Manual local smoke check**

Run:

```bash
npm run dev
```

Open:

- `http://localhost:3000/mobile-preview`
- `http://localhost:3000/mobile-preview?route=/library`
- `http://localhost:3000/mobile-preview?route=/diagnose`

Check:

- route tabs switch between the four entry pages
- iframe displays the real route
- mobile shell remains centered and usable on desktop

- [ ] **Step 4: Commit final verification state**

```bash
git add src/app/mobile-preview/page.tsx src/lib/mobilePreview/routes.ts src/__tests__/mobile-preview-routes.test.ts src/__tests__/mobile-preview-page.test.tsx
git commit -m "Add local mobile preview workspace"
```
