# Deep Mode Category Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep Deep Mode category-aware grounding intact through handoff so downstream diagnosis, rationale, recommendations, and plan context stay in the same tennis skill lane.

**Architecture:** Extend the completed Deep Mode scenario framework with a pre-diagnosis handoff contract and category-gated diagnosis selection. The diagnosis engine must filter candidates before ranking, preserve conflict metadata, and prevent silent cross-category outputs from reaching the UI.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Testing Library

---

## Problem diagnosis

- Deep Mode completion is now richer, but the diagnosis page still treats the structured scene as a post-hoc annotation.
- `diagnoseProblem()` still ranks across the whole `diagnosisRules` table without a Deep Mode category gate.
- `buildEnrichedDiagnosisContext()` is called after a rule is already selected, so it cannot constrain the decision that produced that rule.
- Because recommendations, fixes, drills, and plan context derive from the chosen rule, one category mismatch contaminates the full downstream chain.

## Files/modules likely to change

- `src/app/diagnose/page.tsx`
- `src/lib/diagnosis.ts`
- `src/lib/diagnose/enrichedContext.ts`
- `src/types/enrichedDiagnosis.ts`
- `src/types/diagnosis.ts`
- `src/components/diagnose/DiagnoseResult.tsx`
- `src/__tests__/scenario-handoff.test.ts`
- `src/__tests__/enriched-diagnosis-context.test.ts`
- `src/__tests__/deep-diagnose-orchestrator.test.tsx`
- `src/__tests__/diagnosis-regression-realphrases.test.ts`
- `src/__tests__/deep-scenario-module.test.tsx`
- `docs/engineering/scenario-reconstruction-skill-policy.md`

## Dependency order

1. Define the handoff contract type and normalize category/confidence metadata.
2. Build the handoff contract before diagnosis selection.
3. Teach diagnosis to gate rules by the handoff contract.
4. Add a final consistency guard and UI surfacing for conflict states.
5. Update tests and docs.

## Test strategy

- unit tests for handoff normalization and category extraction
- diagnosis-engine tests for category-gated selection
- regression tests proving a serve scene cannot silently become a forehand diagnosis
- UI/orchestrator tests verifying Deep Mode pass-through still works end-to-end
- targeted build verification

## Acceptance criteria

- Deep Mode still does not hand off early while required fields remain unresolved and askable.
- Invalid cross-technique follow-ups still never appear.
- A reliable serve Deep Mode scene cannot silently produce a forehand diagnosis.
- Downstream diagnosis candidates are category-gated when Deep Mode category confidence is sufficient.
- Recommendations, rationale, and plan context remain consistent with the same category lane.
- If a real ambiguity/conflict remains, the UI surfaces it honestly instead of silently jumping categories.

## Risks / rollback notes

- The highest risk is over-gating diagnosis and starving legitimate matches. Keep gating conservative and confidence-based.
- Preserve standard/lightweight diagnosis behavior when no reliable Deep Mode handoff contract is present.
- If gating proves too aggressive, rollback should disable only the pre-ranking rule filter while keeping the consistency guard and conflict surfacing.

### Task 1: Define the Deep Mode handoff contract

**Files:**
- Modify: `src/types/enrichedDiagnosis.ts`
- Modify: `src/lib/diagnose/enrichedContext.ts`
- Test: `src/__tests__/enriched-diagnosis-context.test.ts`
- Test: `src/__tests__/scenario-handoff.test.ts`

- [ ] Add a handoff contract type that exists before `problemTag` selection.
- [ ] Include `skillCategory`, category confidence, stroke family, deep readiness, capped-stop state, and scene summary fields.
- [ ] Decouple handoff normalization from the already-diagnosed `problemTag`.
- [ ] Add tests proving a serve scenario produces a serve-family handoff contract before diagnosis is run.

### Task 2: Build the handoff before diagnosis selection

**Files:**
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/lib/diagnose/enrichedContext.ts`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`

- [ ] Move Deep Mode handoff construction ahead of `diagnoseProblem()`.
- [ ] Pass the handoff contract into diagnosis options only for deep-mode flows.
- [ ] Keep standard/lightweight diagnosis behavior unchanged when no reliable deep handoff exists.
- [ ] Update orchestrator tests so Deep Mode hands a structured category contract into diagnosis.

### Task 3: Gate downstream diagnosis by handoff category

**Files:**
- Modify: `src/lib/diagnosis.ts`
- Modify: `src/types/diagnosis.ts`
- Test: `src/__tests__/scenario-handoff.test.ts`
- Test: `src/__tests__/diagnosis-regression-realphrases.test.ts`

- [ ] Add diagnosis options/support types for a Deep Mode handoff constraint.
- [ ] Filter diagnosis rule candidates by the handoff category before `findBestDiagnosisRule()` ranking.
- [ ] Keep the gate confidence-based: only hard-gate when Deep Mode category confidence is sufficient.
- [ ] Ensure recommendation seeds, rationale, and returned category come from the gated rule set.
- [ ] Add regression tests proving a serve handoff cannot resolve to `forehand-out`.

### Task 4: Add a consistency guard and honest conflict surfacing

**Files:**
- Modify: `src/lib/diagnosis.ts`
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/types/diagnosis.ts`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`

- [ ] Add consistency metadata to `DiagnosisResult`, such as `categoryConsistency` or `categoryConflict`.
- [ ] Validate the chosen diagnosis against the Deep Mode handoff before returning the final result.
- [ ] If a mismatch somehow survives gating, return an honest conflict state instead of a normal diagnosis card.
- [ ] Update the result UI so conflict is surfaced as a constrained fallback, not a silent cross-category diagnosis.

### Task 5: Verify downstream plan/rationale consistency

**Files:**
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/lib/diagnose/enrichedContext.ts`
- Test: `src/__tests__/scenario-handoff.test.ts`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`

- [ ] Ensure plan candidate IDs and plan context are derived from the same category-consistent diagnosis result.
- [ ] Keep deep evidence summary / scene recap aligned with the gated category.
- [ ] Add a test proving serve deep handoff yields serve-aligned downstream output and recommended content.

### Task 6: Final verification and integration

**Files:**
- Modify: `docs/engineering/scenario-reconstruction-skill-policy.md`
- Modify: `docs/superpowers/specs/2026-04-08-deep-mode-category-consistency-design.md` if wording needs implementation clarification

- [ ] Update docs to describe the new handoff contract and downstream category gating.
- [ ] Run targeted tests:
  - `src/__tests__/scenario-runtime.test.ts`
  - `src/__tests__/scenario-selector.test.ts`
  - `src/__tests__/scenario-routes.test.ts`
  - `src/__tests__/scenario-handoff.test.ts`
  - `src/__tests__/enriched-diagnosis-context.test.ts`
  - `src/__tests__/deep-scenario-module.test.tsx`
  - `src/__tests__/deep-diagnose-orchestrator.test.tsx`
  - `src/__tests__/diagnosis-regression-realphrases.test.ts`
- [ ] Run `npm run build`.
- [ ] Create the final commit.
- [ ] Merge `deep-mode-completeness` into local `main`.
