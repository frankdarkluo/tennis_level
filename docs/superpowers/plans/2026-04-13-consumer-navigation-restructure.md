# Consumer Navigation Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the consumer shell so primary navigation becomes `首页 / 水平评估 / 内容库 / 我的记录` and secondary navigation becomes `问题诊断 / 训练计划`, while preserving all current route chains.

**Architecture:** Split navigation into two explicit tiers in the existing route config, then refactor the existing `Header` and `BottomNav` components to consume those tiers instead of sharing a single mixed-purpose nav array. Keep route paths, page-local CTAs, and homepage body structure intact so the change stays architectural rather than sprawling.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Vitest, Testing Library

---

### Task 1: Split Consumer Navigation Source of Truth

**Files:**
- Modify: `src/lib/appMode.ts`
- Test: `src/__tests__/consumer-shell-pr1.test.tsx`

- [ ] **Step 1: Write the failing navigation expectations**

Add these assertions to `src/__tests__/consumer-shell-pr1.test.tsx`:

```tsx
it("renders the new primary destinations in the mobile bottom navigation", async () => {
  const { BottomNav } = await import("@/components/layout/BottomNav");

  render(React.createElement(BottomNav));

  expect(screen.getByRole("link", { name: "首页" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "水平评估" })).toHaveAttribute("href", "/assessment");
  expect(screen.getByRole("link", { name: "内容库" })).toHaveAttribute("href", "/library");
  expect(screen.getByRole("link", { name: "我的记录" })).toHaveAttribute("href", "/profile");
  expect(screen.queryByRole("link", { name: "问题诊断" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "训练计划" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the targeted test to verify it fails**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: FAIL because the current bottom nav still exposes `问题诊断 / 训练计划`.

- [ ] **Step 3: Refactor the shared navigation config**

Replace the single consumer nav array in `src/lib/appMode.ts` with explicit primary and secondary groups:

```ts
export type ConsumerPrimaryNavLabelKey =
  | "nav.home"
  | "nav.assessment"
  | "nav.library"
  | "nav.profile";

export type ConsumerSecondaryNavLabelKey =
  | "nav.diagnose"
  | "nav.plan";

export const consumerPrimaryNavItems: ReadonlyArray<{ href: string; labelKey: ConsumerPrimaryNavLabelKey }> = [
  { href: "/", labelKey: "nav.home" },
  { href: "/assessment", labelKey: "nav.assessment" },
  { href: "/library", labelKey: "nav.library" },
  { href: "/profile", labelKey: "nav.profile" }
];

export const consumerSecondaryNavItems: ReadonlyArray<{ href: string; labelKey: ConsumerSecondaryNavLabelKey }> = [
  { href: "/diagnose", labelKey: "nav.diagnose" },
  { href: "/plan", labelKey: "nav.plan" }
];
```

- [ ] **Step 4: Re-run the targeted test to confirm the config change is ready for consumers**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: still FAIL, but now only because `BottomNav` and `Header` still consume the old shape.

- [ ] **Step 5: Commit the source-of-truth split**

```bash
git add src/lib/appMode.ts src/__tests__/consumer-shell-pr1.test.tsx
git commit -m "refactor: split consumer navigation tiers"
```

### Task 2: Refactor Mobile Bottom Navigation To Primary Destinations

**Files:**
- Modify: `src/components/layout/BottomNav.tsx`
- Test: `src/__tests__/consumer-shell-pr1.test.tsx`

- [ ] **Step 1: Extend the failing test for active primary destinations**

Add this test in `src/__tests__/consumer-shell-pr1.test.tsx`:

```tsx
it("keeps only primary destinations in the mobile shell", async () => {
  const { BottomNav } = await import("@/components/layout/BottomNav");

  render(React.createElement(BottomNav));

  expect(screen.getByRole("link", { name: "首页" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "水平评估" })).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "问题诊断" })).not.toBeInTheDocument();
  expect(screen.queryByRole("link", { name: "训练计划" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the targeted test to verify it fails on `BottomNav`**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: FAIL because `BottomNav` still maps over the old mixed nav items.

- [ ] **Step 3: Rewire `BottomNav` to the new primary array**

Update `src/components/layout/BottomNav.tsx` to import and render `consumerPrimaryNavItems`:

```tsx
import { consumerPrimaryNavItems, shouldShowConsumerShell } from "@/lib/appMode";

// ...

{consumerPrimaryNavItems.map((item) => {
  const active = isActivePath(pathname, item.href);

  return (
    <Link
      key={item.href}
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-12 items-center justify-center rounded-2xl px-2 text-center text-[15px] font-semibold transition",
        active ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      )}
    >
      {t(item.labelKey)}
    </Link>
  );
})}
```

- [ ] **Step 4: Re-run the bottom-nav test**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: the bottom-nav assertions pass, while header assertions still fail until the next task.

- [ ] **Step 5: Commit the bottom-nav rewrite**

```bash
git add src/components/layout/BottomNav.tsx src/__tests__/consumer-shell-pr1.test.tsx
git commit -m "refactor: move bottom nav to primary destinations"
```

### Task 3: Refactor Header To Global Secondary Navigation

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Test: `src/__tests__/consumer-shell-pr1.test.tsx`

- [ ] **Step 1: Add failing header expectations for the new secondary tier**

Add this test in `src/__tests__/consumer-shell-pr1.test.tsx`:

```tsx
it("renders diagnose and plan as global secondary actions in the header", async () => {
  const { Header } = await import("@/components/layout/Header");

  render(React.createElement(Header));

  expect(screen.getByRole("link", { name: "问题诊断" })).toHaveAttribute("href", "/diagnose");
  expect(screen.getByRole("link", { name: "训练计划" })).toHaveAttribute("href", "/plan");
});
```

- [ ] **Step 2: Run the targeted test to verify it fails on header shape**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: FAIL because the header still treats the full mixed consumer nav as its main desktop navigation.

- [ ] **Step 3: Rewire the desktop header to the new secondary array**

Update `src/components/layout/Header.tsx` so the central nav consumes `consumerSecondaryNavItems`:

```tsx
import { consumerSecondaryNavItems, shouldShowConsumerShell } from "@/lib/appMode";

const showConsumerNav = shouldShowConsumerShell(pathname);
const visibleSecondaryNavItems = showConsumerNav ? consumerSecondaryNavItems : [];

// ...

<nav className="hidden min-w-0 items-center gap-0.5 md:flex md:ml-4 lg:ml-6 lg:gap-1">
  {visibleSecondaryNavItems.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[15px] font-semibold transition",
        pathname === item.href
          ? "text-brand-700 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-3/5 after:-translate-x-1/2 after:rounded-full after:bg-brand-400 after:content-['']"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
      )}
    >
      {t(item.labelKey)}
    </Link>
  ))}
</nav>
```

- [ ] **Step 4: Add the mobile secondary row under the top bar**

Still in `src/components/layout/Header.tsx`, add a mobile-only secondary row that reuses the same secondary array and typography:

```tsx
{showConsumerNav ? (
  <div className="border-t border-[var(--line)] px-4 py-2 md:hidden">
    <div className="flex items-center gap-2 overflow-x-auto">
      {visibleSecondaryNavItems.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-[15px] font-semibold transition",
              active ? "bg-brand-50 text-brand-700" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            {t(item.labelKey)}
          </Link>
        );
      })}
    </div>
  </div>
) : null}
```

- [ ] **Step 5: Re-run the consumer shell test**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: PASS for the new header and bottom-nav navigation assertions.

- [ ] **Step 6: Commit the header refactor**

```bash
git add src/components/layout/Header.tsx src/__tests__/consumer-shell-pr1.test.tsx
git commit -m "refactor: move diagnose and plan into header secondary nav"
```

### Task 4: Preserve Home-As-Hub Behavior Without Body Rewrite

**Files:**
- Modify: `src/__tests__/consumer-shell-pr1.test.tsx`
- Verify: `src/app/page.tsx`
- Verify: `src/components/home/HeroSection.tsx`

- [ ] **Step 1: Add a regression test that home still acts as a valid consumer entry**

Append this test to `src/__tests__/consumer-shell-pr1.test.tsx`:

```tsx
it("keeps the homepage diagnose and assessment entry chain intact", async () => {
  const { default: HomePage } = await import("@/app/page");

  render(React.createElement(HomePage));

  expect(await screen.findByRole("link", { name: "立即诊断" })).toHaveAttribute("href", "/diagnose?q=");
  expect(screen.getByRole("link", { name: "想更准？先做 1 分钟评估" })).toHaveAttribute("href", "/assessment");
});
```

- [ ] **Step 2: Run the targeted test**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: PASS if the nav refactor did not disturb the existing homepage routing chain.

- [ ] **Step 3: Confirm no home-body rewrite is needed**

Review these files without editing unless the preceding test exposed an actual break:

```tsx
// src/app/page.tsx
<div className="space-y-8">
  <HeroSection />
  <HotContentSection />
</div>

// src/components/home/HeroSection.tsx
<Link href={diagnoseHref}>
  <Button className="h-11 px-6">{t("home.hero.diagnose")}</Button>
</Link>
<Link href="/assessment" className="text-sm font-medium text-slate-500 transition hover:text-brand-700">
  {t("home.hero.assessment")}
</Link>
```

The intended outcome is to keep these home entry points untouched in this slice.

- [ ] **Step 4: Run the focused shell regression one more time**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: PASS for the full consumer navigation contract.

- [ ] **Step 5: Commit the navigation IA slice**

```bash
git add src/__tests__/consumer-shell-pr1.test.tsx
git commit -m "test: lock consumer navigation IA"
```

### Task 5: Final Verification

**Files:**
- Verify: `src/lib/appMode.ts`
- Verify: `src/components/layout/Header.tsx`
- Verify: `src/components/layout/BottomNav.tsx`
- Verify: `src/__tests__/consumer-shell-pr1.test.tsx`

- [ ] **Step 1: Run the targeted consumer-shell test**

Run:

```bash
npm test -- src/__tests__/consumer-shell-pr1.test.tsx
```

Expected: PASS

- [ ] **Step 2: Run the app build**

Run:

```bash
npm run build
```

Expected: build succeeds without navigation-related type or route errors

- [ ] **Step 3: Check the final change set**

Confirm the implementation stayed inside the intended slice:

```bash
git diff --stat HEAD~4 HEAD
```

Expected: navigation config, header, bottom nav, and consumer shell tests only; no auth, data, or route rewrites

- [ ] **Step 4: Commit the final verification note if needed**

```bash
git status
```

Expected: clean working tree
