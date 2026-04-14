# Deep Mode Completeness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Deep Mode complete category-relevant scenario grounding before handoff, while preserving tennis-specific question legality and honest unresolved-state reporting.

**Architecture:** Extend the existing skill-policy-driven deep-diagnosis runtime with explicit Deep Mode progress, slot-resolution provenance, and category-specific deep completion rules. Keep question legality category-first, prioritize required Deep Mode slots ahead of optional ones, and make the UI expose honest completion and capped-stop states instead of a minimum-sufficiency proceed state.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library

---

### Task 1: Stabilize the worktree test baseline

**Files:**
- Modify: `vitest.setup.ts`
- Test: `src/__tests__/scenario-selector.test.ts`
- Test: `src/__tests__/scenario-routes.test.ts`

- [ ] **Step 1: Write the failing baseline check down**

Current failure in this worktree:

```text
Cannot find package '/.../node_modules/vitest/index.js' imported from @testing-library/jest-dom/dist/vitest.mjs
```

This is blocking execution because targeted tests cannot run reliably from the isolated worktree.

- [ ] **Step 2: Replace the fragile setup import with the direct matcher extension path**

Update `vitest.setup.ts` from:

```ts
import "@testing-library/jest-dom/vitest";
```

to:

```ts
import matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

expect.extend(matchers);
```

Keep the existing localStorage mock intact below that import block.

- [ ] **Step 3: Run the smallest baseline verification**

Run:

```bash
npm test -- src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts
```

Expected: both suites run instead of crashing during setup.

- [ ] **Step 4: Commit the isolated baseline fix**

```bash
git add vitest.setup.ts
git commit -m "test: stabilize vitest setup in worktree"
```

### Task 2: Add Deep Mode progress and slot-resolution provenance

**Files:**
- Modify: `src/types/scenario.ts`
- Modify: `src/lib/scenarioReconstruction/answer.ts`
- Modify: `src/lib/scenarioReconstruction/runtime.ts`
- Test: `src/__tests__/scenario-runtime.test.ts`

- [ ] **Step 1: Write failing runtime tests for explicit resolution state**

Add tests in `src/__tests__/scenario-runtime.test.ts` that assert:

```ts
expect(createEmptyScenario("一发总发不进").slot_resolution["context.session_type"]).toBe("unasked");
expect(applyScenarioAnswer(base, "q_match_or_practice", "match").slot_resolution["context.session_type"]).toBe("answered");
expect(applyScenarioAnswer(base, "q_match_or_practice", "skip").slot_resolution["context.session_type"]).toBe("skipped");
expect(applyScenarioAnswer(base, "q_match_or_practice", "cannot_answer").slot_resolution["context.session_type"]).toBe("cannot_answer");
```

Also add a progress test that proves capped handoff does **not** flip the scene to deep-ready:

```ts
expect(progress.stoppedByCap).toBe(true);
expect(progress.deepReady).toBe(false);
```

- [ ] **Step 2: Run the runtime test to verify failure**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts
```

Expected: FAIL because `slot_resolution` and `deepReady/stoppedByCap` do not exist yet.

- [ ] **Step 3: Extend scenario types with deep progress state**

Add to `src/types/scenario.ts`:

```ts
export type SlotResolutionState = "unasked" | "answered" | "skipped" | "cannot_answer";

export type SlotResolutionMap = Record<MissingSlotPath, SlotResolutionState>;

export type DeepModeProgress = {
  deepReady: boolean;
  stoppedByCap: boolean;
  requiredRemaining: MissingSlotPath[];
  optionalRemaining: MissingSlotPath[];
  unresolvedRequiredBecauseOfSkip: MissingSlotPath[];
  unresolvedRequiredBecauseUnavailable: MissingSlotPath[];
};
```

Extend `ScenarioState` with:

```ts
slot_resolution: SlotResolutionMap;
deep_progress: DeepModeProgress;
```

- [ ] **Step 4: Initialize and update slot resolution deterministically**

In `src/lib/scenarioReconstruction/runtime.ts`, add helpers like:

```ts
function createInitialSlotResolution(): SlotResolutionMap {
  return {
    stroke: "unasked",
    "context.session_type": "unasked",
    "context.serve_variant": "unasked",
    "context.movement": "unasked",
    "outcome.primary_error": "unasked",
    "incoming_ball.depth": "unasked",
    "subjective_feeling.rushed": "unasked"
  };
}
```

and:

```ts
function createInitialDeepProgress(): DeepModeProgress {
  return {
    deepReady: false,
    stoppedByCap: false,
    requiredRemaining: [],
    optionalRemaining: [],
    unresolvedRequiredBecauseOfSkip: [],
    unresolvedRequiredBecauseUnavailable: []
  };
}
```

Wire both into `createEmptyScenario()` and preserve them in `mergeScenarioState()`.

- [ ] **Step 5: Teach answer application to preserve answered / skipped / cannot-answer provenance**

In `src/lib/scenarioReconstruction/answer.ts`, update each question branch so:

```ts
if (answerKey === "skip") {
  nextScenario.slot_resolution["context.session_type"] = "skipped";
} else if (answerKey === "cannot_answer") {
  nextScenario.slot_resolution["context.session_type"] = "cannot_answer";
} else {
  nextScenario.context.session_type = answerKey;
  nextScenario.slot_resolution["context.session_type"] = "answered";
}
```

Do the equivalent mapping for every currently active slot family:
- `stroke`
- `context.session_type`
- `context.serve_variant`
- `context.movement`
- `outcome.primary_error`
- `incoming_ball.depth`
- `subjective_feeling.rushed`

- [ ] **Step 6: Add a deep-progress calculator to runtime**

In `src/lib/scenarioReconstruction/runtime.ts`, add a pure helper that computes:

```ts
export function getDeepModeProgress(scenario: ScenarioState): DeepModeProgress
```

using category policy, slot resolution provenance, and asked-followup count.

Rules to encode:
- required unresolved + askable => `deepReady = false`
- required unresolved but marked skipped / cannot_answer => no longer askable blockers
- hard cap => `stoppedByCap = true` and `deepReady = false`

- [ ] **Step 7: Re-run runtime tests**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit the deep-progress state layer**

```bash
git add src/types/scenario.ts src/lib/scenarioReconstruction/answer.ts src/lib/scenarioReconstruction/runtime.ts src/__tests__/scenario-runtime.test.ts
git commit -m "feat: add deep mode progress state"
```

### Task 3: Replace minimum-sufficiency policy with category-aware Deep Mode completion

**Files:**
- Modify: `src/lib/scenarioReconstruction/skillPolicy.ts`
- Modify: `src/lib/scenarioReconstruction/inferSkillCategory.ts`
- Modify: `src/lib/scenarioReconstruction/runtime.ts`
- Test: `src/__tests__/scenario-runtime.test.ts`
- Test: `src/__tests__/scenario-selector.test.ts`

- [ ] **Step 1: Write failing policy tests for Deep Mode completeness**

Add assertions such as:

```ts
expect(getDeepModeProgress(serveScenario).deepReady).toBe(false);
expect(getDeepModeProgress(serveScenario).requiredRemaining).toContain("context.serve_variant");
expect(getDeepModeProgress(groundstrokeScenario).requiredRemaining).toContain("context.movement");
expect(getDeepModeProgress(cappedScenario).stoppedByCap).toBe(true);
```

Also add a selector-facing expectation:

```ts
expect(getEligibleQuestions(serveScenario).map((q) => q.id)).toContain("q_serve_variant");
expect(getEligibleQuestions(serveScenario).map((q) => q.id)).not.toContain("q_incoming_ball_depth");
```

- [ ] **Step 2: Run the targeted tests to verify failure**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts
```

Expected: FAIL because policy still uses `isDone()` / `maxFollowups`.

- [ ] **Step 3: Refactor policy shape around Deep Mode**

In `src/lib/scenarioReconstruction/skillPolicy.ts`, replace the minimal policy shape with:

```ts
type SkillCategoryPolicy = {
  allowedQuestionFamilies: QuestionFamily[];
  deepRequiredSlots: MissingSlotPath[];
  deepOptionalSlots: MissingSlotPath[];
  maxDeepFollowups: number;
  includeSlotAsRequired?(input: { scenario: ScenarioState; slot: MissingSlotPath }): boolean;
};
```

Set conservative v1 policies:
- `serve`: require `context.session_type`, `outcome.primary_error`, `context.serve_variant`, `subjective_feeling.rushed`
- `groundstroke_*`: require `context.session_type`, `context.movement`, `outcome.primary_error`, `subjective_feeling.rushed`; conditionally require `incoming_ball.depth`
- `return`, `volley`, `overhead`, `slice`: require `context.session_type`, `outcome.primary_error`, `subjective_feeling.rushed`
- `contextual_match_situation`: require `context.session_type`, `stroke`, `subjective_feeling.rushed`
- `generic_safe_fallback`: keep only safe optional grounding, not fake completion

- [ ] **Step 4: Update runtime missing-slot helpers to separate required and optional**

In `src/lib/scenarioReconstruction/runtime.ts`, add:

```ts
export function getDeepRequiredSlots(scenario: ScenarioState): MissingSlotPath[]
export function getDeepOptionalSlots(scenario: ScenarioState): MissingSlotPath[]
```

Use the policy plus `slot_resolution` state to decide what remains unresolved.

Keep `getMissingSlots()` as the compatibility entry point, but make it return required-first unresolved slots for Deep Mode selection rather than the old minimal rule.

- [ ] **Step 5: Replace `isScenarioMinimallyAnalyzable()` with Deep Mode semantics**

Update:

```ts
export function isScenarioMinimallyAnalyzable(scenario: ScenarioState)
```

so it delegates to `getDeepModeProgress(scenario).deepReady` instead of the old policy `isDone()`.

Keep the function name temporarily if needed for compatibility, but its behavior in Deep Mode must now reflect honest deep completion.

- [ ] **Step 6: Re-run the policy and selector tests**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the Deep Mode policy refactor**

```bash
git add src/lib/scenarioReconstruction/skillPolicy.ts src/lib/scenarioReconstruction/inferSkillCategory.ts src/lib/scenarioReconstruction/runtime.ts src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts
git commit -m "feat: enforce deep mode completeness rules"
```

### Task 4: Update selector and question bank for required-first, skip-aware questioning

**Files:**
- Modify: `src/data/scenarioReconstruction/questionBank.ts`
- Modify: `src/lib/scenarioReconstruction/selector.ts`
- Modify: `src/lib/scenarioReconstruction/answer.ts`
- Test: `src/__tests__/scenario-selector.test.ts`
- Test: `src/__tests__/scenario-routes.test.ts`

- [ ] **Step 1: Write failing selector tests for skip/cannot-answer flow**

Add tests that prove:

```ts
expect(selected.options.map((o) => o.key)).toContain("skip");
expect(selected.options.map((o) => o.key)).toContain("cannot_answer");
expect(progress.requiredRemaining.length).toBeGreaterThan(0);
expect(progress.deepReady).toBe(false);
```

And route-level tests that prove required Deep Mode follow-ups continue until resolved, skipped, unavailable, or capped.

- [ ] **Step 2: Run the selector and route tests to verify failure**

Run:

```bash
npm test -- src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts
```

Expected: FAIL because question options do not yet support `skip` / `cannot_answer` and selection still stops too early.

- [ ] **Step 3: Add skip/cannot-answer options to active question families**

In `src/data/scenarioReconstruction/questionBank.ts`, append to each currently active question:

```ts
{ key: "skip", zh: "先跳过", en: "Skip for now" },
{ key: "cannot_answer", zh: "说不清/不知道", en: "Can't answer" }
```

Keep wording concise and natural in both languages.

- [ ] **Step 4: Make selector prioritize unresolved Deep Mode required slots**

Update `src/lib/scenarioReconstruction/selector.ts` so question eligibility and sort order use:

```ts
const requiredRemaining = getDeepRequiredSlots(scenario);
const optionalRemaining = getDeepOptionalSlots(scenario);
```

Eligibility rules:
- legal family first
- not blocked by cap unless the route has already reached a terminal honest stop
- required slot questions outrank optional slot questions
- optional questions only appear after required ones are resolved or marked unavailable/skipped

- [ ] **Step 5: Keep capped stops honest**

When `maxDeepFollowups` is reached:
- stop surfacing new questions
- keep `deepReady = false`
- let downstream/UI represent "stopped with unresolved required fields"

- [ ] **Step 6: Re-run selector and route tests**

Run:

```bash
npm test -- src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the selector/question-bank changes**

```bash
git add src/data/scenarioReconstruction/questionBank.ts src/lib/scenarioReconstruction/selector.ts src/lib/scenarioReconstruction/answer.ts src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts
git commit -m "feat: prioritize required deep mode follow-ups"
```

### Task 5: Make the Deep Mode UI honest about progress and handoff

**Files:**
- Modify: `src/components/diagnose/scenario/ScenarioQuestionCard.tsx`
- Modify: `src/components/diagnose/scenario/ScenarioSummaryCard.tsx`
- Modify: `src/components/diagnose/DeepScenarioModule.tsx`
- Modify: `src/lib/scenarioReconstruction/bilingual.ts`
- Test: `src/__tests__/deep-scenario-module.test.tsx`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Add tests asserting:

```ts
expect(screen.queryByRole("button", { name: "进入后续分析" })).not.toBeInTheDocument();
expect(screen.getByText("仍在补全关键场景信息")).toBeInTheDocument();
expect(screen.getByText("已达到提问上限，仍有关键场景信息未补全")).toBeInTheDocument();
```

And English equivalents where existing bilingual tests make that practical.

- [ ] **Step 2: Run the UI tests to verify failure**

Run:

```bash
npm test -- src/__tests__/deep-scenario-module.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx
```

Expected: FAIL because the current UI still shows the old proceed-ready copy too early.

- [ ] **Step 3: Update completion copy and summary labels**

In `src/lib/scenarioReconstruction/bilingual.ts`, replace the old completion strings with a richer set such as:

```ts
questionGathering: "仍在补全关键场景信息"
questionCapped: "已达到提问上限，仍有关键场景信息未补全"
questionDeepReady: "当前场景已经补全到可进入深入分析"
summaryRequiredMissing: "还缺这些关键项"
summaryOptionalMissing: "还可补这些补充项"
```

Add aligned English copy.

- [ ] **Step 4: Make the question card render honest terminal states**

Update `ScenarioQuestionCard.tsx` to accept deep progress state instead of a single `done` boolean, and render:
- gathering state with no proceed CTA
- deep-ready state with proceed CTA
- capped/unresolved stop state with no "fully ready" wording

- [ ] **Step 5: Make the summary card show required vs optional unresolved items**

Update `ScenarioSummaryCard.tsx` to render separate chip groups for:
- required remaining
- optional remaining
- unresolved required because skipped/unavailable when present

- [ ] **Step 6: Wire the richer progress state through DeepScenarioModule**

Update `src/components/diagnose/DeepScenarioModule.tsx` so it consumes `scenario.deep_progress` and only exposes `onApplyScenario` when `deepReady` is true.

- [ ] **Step 7: Re-run UI tests**

Run:

```bash
npm test -- src/__tests__/deep-scenario-module.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit the UI honesty changes**

```bash
git add src/components/diagnose/scenario/ScenarioQuestionCard.tsx src/components/diagnose/scenario/ScenarioSummaryCard.tsx src/components/diagnose/DeepScenarioModule.tsx src/lib/scenarioReconstruction/bilingual.ts src/__tests__/deep-scenario-module.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx
git commit -m "feat: make deep mode handoff state honest"
```

### Task 6: Update docs and run final verification

**Files:**
- Modify: `docs/engineering/scenario-reconstruction-skill-policy.md`
- Modify: `docs/superpowers/specs/2026-04-08-deep-mode-completeness-design.md` (only if implementation clarifies wording)
- Test: `src/__tests__/scenario-runtime.test.ts`
- Test: `src/__tests__/scenario-selector.test.ts`
- Test: `src/__tests__/scenario-routes.test.ts`
- Test: `src/__tests__/deep-scenario-module.test.tsx`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`

- [ ] **Step 1: Update the short design note**

Revise `docs/engineering/scenario-reconstruction-skill-policy.md` so it now explains:
- Deep Mode optimizes for completeness rather than early handoff
- required vs optional category-specific grounding
- skipped vs cannot-answer provenance
- honest capped stops

- [ ] **Step 2: Run the targeted regression suite**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts src/__tests__/deep-scenario-module.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Review git diff for scope control**

Run:

```bash
git status --short
git diff --stat
```

Expected: only Deep Mode completeness, tests, and docs changes.

- [ ] **Step 5: Create the final implementation commit**

```bash
git add docs/engineering/scenario-reconstruction-skill-policy.md docs/superpowers/plans/2026-04-08-deep-mode-completeness.md docs/superpowers/specs/2026-04-08-deep-mode-completeness-design.md src/types/scenario.ts src/lib/scenarioReconstruction/answer.ts src/lib/scenarioReconstruction/runtime.ts src/lib/scenarioReconstruction/skillPolicy.ts src/lib/scenarioReconstruction/selector.ts src/lib/scenarioReconstruction/inferSkillCategory.ts src/data/scenarioReconstruction/questionBank.ts src/lib/scenarioReconstruction/bilingual.ts src/components/diagnose/DeepScenarioModule.tsx src/components/diagnose/scenario/ScenarioQuestionCard.tsx src/components/diagnose/scenario/ScenarioSummaryCard.tsx src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts src/__tests__/deep-scenario-module.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx vitest.setup.ts
git commit -m "feat: deepen scenario reconstruction completeness"
```

- [ ] **Step 6: Merge branch into main locally**

From the repo root:

```bash
git checkout main
git merge deep-mode-completeness
```

Expected: local main includes the completed Deep Mode refactor.
