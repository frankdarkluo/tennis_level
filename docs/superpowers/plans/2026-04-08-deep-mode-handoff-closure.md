# Deep Mode Handoff Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the Deep Mode loop so serve-family scenes do not hand off early, Deep Mode keeps asking category-valid serve questions until the scene is actually grounded, and any post-handoff evidence gap routes the user back to the next Deep Mode question instead of stopping on a static result card.

**Architecture:** Extend the existing category-policy flow rather than replacing it. Add serve-specific Deep Mode slots and questions, make serve completion depend on those slots, carry the extra serve grounding into the diagnosis handoff, and let the diagnose page preserve and resume the live scenario state when post-handoff narrowing still points back to Deep Mode. Keep downstream category gating from the previous slice intact.

**Tech Stack:** Next.js App Router, React client components, TypeScript, Vitest, Testing Library.

---

## Problem Diagnosis

- Deep Mode completion is still driven by a shallow serve policy in `src/lib/scenarioReconstruction/skillPolicy.ts`.
- Serve currently has only one truly serve-specific Deep Mode question: `q_serve_variant`.
- `src/lib/scenarioReconstruction/runtime.ts` marks `deepReady` once the small serve required set is cleared, even if the scene still lacks serve-internal grounding.
- `src/lib/scenarioReconstruction/toDiagnosisInput.ts` cannot inject any serve-mechanism clue because the scenario model does not store one.
- `src/app/diagnose/page.tsx` and `src/components/diagnose/DeepScenarioModule.tsx` do not preserve enough state to route the user back to the next Deep Mode question when post-handoff diagnosis still needs narrowing.

## File Map

**Core scenario model**
- Modify: `src/types/scenario.ts`
- Modify: `src/lib/scenarioReconstruction/runtime.ts`
- Modify: `src/lib/scenarioReconstruction/skillPolicy.ts`
- Modify: `src/lib/scenarioReconstruction/answer.ts`
- Modify: `src/lib/scenarioReconstruction/toDiagnosisInput.ts`

**Question selection / copy**
- Modify: `src/data/scenarioReconstruction/questionBank.ts`
- Modify: `src/lib/scenarioReconstruction/selector.ts`
- Modify: `src/lib/scenarioReconstruction/bilingual.ts`

**Deep handoff / diagnosis orchestration**
- Modify: `src/types/enrichedDiagnosis.ts`
- Modify: `src/lib/diagnose/enrichedContext.ts`
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/components/diagnose/DeepScenarioModule.tsx`
- Modify: `src/components/diagnose/scenario/ScenarioQuestionCard.tsx`
- Modify: `src/components/diagnose/scenario/ScenarioSummaryCard.tsx`
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify if needed: `src/lib/diagnosis.ts`

**Docs**
- Modify: `docs/engineering/scenario-reconstruction-skill-policy.md`
- Create: `docs/superpowers/specs/2026-04-08-deep-mode-handoff-closure-design.md` only if the implementation reveals a material design delta from the approved specs

**Tests**
- Modify: `src/__tests__/scenario-runtime.test.ts`
- Modify: `src/__tests__/scenario-selector.test.ts`
- Modify: `src/__tests__/scenario-routes.test.ts`
- Modify: `src/__tests__/deep-scenario-module.test.tsx`
- Modify: `src/__tests__/deep-diagnose-orchestrator.test.tsx`
- Modify: `src/__tests__/scenario-handoff.test.ts`
- Modify if needed: `src/__tests__/deep-diagnose-result.test.tsx`

## Dependency Order

1. Add the serve-specific scenario slots and question families first.
2. Tighten serve Deep Mode completion against those slots.
3. Carry those slots into handoff text/context.
4. Add UI/state flow for resume/loopback.
5. Verify route, component, and diagnose-page integration together.

## Task 1: Add Serve-Specific Grounding Slots

**Files:**
- Modify: `src/types/scenario.ts`
- Test: `src/__tests__/scenario-runtime.test.ts`

- [ ] **Step 1: Write failing runtime assertions for serve-specific slots**

Add tests that express the new serve completeness boundary:
- a serve complaint with only `stroke + movement + no_control + tight` is **not** deep-ready
- serve required slots include:
  - a serve-specific control detail slot when the outcome is still broad / `no_control`
  - a serve-specific mechanism slot

Run:
```bash
npm test -- src/__tests__/scenario-runtime.test.ts -t "serve Deep Mode"
```
Expected: FAIL because the new slots do not exist yet.

- [ ] **Step 2: Extend the scenario type with serve-only Deep Mode slots**

Add a focused nested serve object under `ScenarioState`, plus new missing-slot paths and question families. Keep it schema-driven and narrow:
- `serve.control_pattern`
  - `net`
  - `long`
  - `wide`
  - `no_rhythm`
  - `unknown`
- `serve.mechanism_family`
  - `toss`
  - `contact`
  - `rhythm`
  - `direction_control`
  - `unknown`

Also add `MissingSlotPath` entries for:
- `serve.control_pattern`
- `serve.mechanism_family`

And add `QuestionFamily` entries for:
- `serve_control_pattern`
- `serve_mechanism_family`

- [ ] **Step 3: Create initial empty-state defaults for the new serve slots**

Update runtime initialization so every fresh scenario starts with:
- `serve.control_pattern = "unknown"`
- `serve.mechanism_family = "unknown"`
- `slot_resolution` entries for both slots set to `unasked`

- [ ] **Step 4: Run the runtime test again**

Run:
```bash
npm test -- src/__tests__/scenario-runtime.test.ts -t "serve Deep Mode"
```
Expected: still FAIL, but now on policy/runtime logic rather than missing types.

## Task 2: Tighten Serve Deep Mode Completion

**Files:**
- Modify: `src/lib/scenarioReconstruction/skillPolicy.ts`
- Modify: `src/lib/scenarioReconstruction/runtime.ts`
- Test: `src/__tests__/scenario-runtime.test.ts`
- Test: `src/__tests__/scenario-selector.test.ts`

- [ ] **Step 1: Write failing selector/runtime tests for serve completeness**

Add tests for:
- serve does not become `deepReady` until `serve.mechanism_family` is resolved
- `serve.control_pattern` is required when outcome is `no_control`
- `q_serve_variant` and the new serve questions are prioritized before Deep Mode can proceed

Run:
```bash
npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts -t "serve"
```
Expected: FAIL because serve policy is still too loose.

- [ ] **Step 2: Tighten the serve policy**

Update `serve` in `skillPolicy.ts`:
- keep `allowedQuestionFamilies` tennis-valid
- include:
  - `session_context`
  - `pressure_context`
  - `outcome_pattern`
  - `serve_variant`
  - `serve_control_pattern`
  - `serve_mechanism_family`
- make `deepRequiredSlots` include:
  - `context.session_type`
  - `context.serve_variant`
  - `outcome.primary_error`
  - `serve.mechanism_family`
  - conditional `serve.control_pattern`
  - `subjective_feeling.rushed`
- increase `maxDeepFollowups` conservatively so serve has room for one more real grounding question

Use `includeSlotAsRequired` so `serve.control_pattern` is required only when outcome is still broad enough to need it, especially `no_control`.

- [ ] **Step 3: Update Deep Mode progress calculation**

Make sure `runtime.ts`:
- treats the new serve slots as known only when not `unknown`
- includes them in `requiredRemaining`
- does not mark `deepReady` until those serve-required fields are answered / skipped / cannot-answer

- [ ] **Step 4: Re-run the focused serve tests**

Run:
```bash
npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts -t "serve"
```
Expected: PASS.

## Task 3: Add Serve-Specific Questions and Answers

**Files:**
- Modify: `src/data/scenarioReconstruction/questionBank.ts`
- Modify: `src/lib/scenarioReconstruction/answer.ts`
- Modify: `src/lib/scenarioReconstruction/bilingual.ts`
- Test: `src/__tests__/scenario-selector.test.ts`
- Test: `src/__tests__/scenario-routes.test.ts`

- [ ] **Step 1: Write failing route/selector tests for the new serve follow-ups**

Add tests for this exact class of input:
- `"我的原地的发球发坏不太受控，而且会发紧"` should not be ready
- it should offer a serve-specific next question, not proceed
- candidate questions must stay inside serve-valid families

Run:
```bash
npm test -- src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts -t "不太受控|serve follow-up|deepReady"
```
Expected: FAIL.

- [ ] **Step 2: Add `q_serve_control_pattern`**

Create a question with options like:
- `net`
- `long`
- `wide`
- `no_rhythm`
- `skip`
- `cannot_answer`

Keep the copy natural in both languages.

- [ ] **Step 3: Add `q_serve_mechanism_family`**

Create a question with options like:
- `toss`
- `contact`
- `rhythm`
- `direction_control`
- `skip`
- `cannot_answer`

Chinese should sound like a player describing the feel, not coaching jargon overload.

- [ ] **Step 4: Teach `answer.ts` to fill the new slots**

Handle both questions with full support for:
- answered
- skipped
- cannot_answer

- [ ] **Step 5: Update Deep Mode copy only where the new serve follow-ups need labels**

No broad UI redesign. Only align the new question wording and any summary labels needed to display the new slots honestly.

- [ ] **Step 6: Re-run the selector/route tests**

Run:
```bash
npm test -- src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts -t "serve"
```
Expected: PASS.

## Task 4: Carry the New Serve Grounding into Handoff

**Files:**
- Modify: `src/lib/scenarioReconstruction/toDiagnosisInput.ts`
- Modify: `src/types/enrichedDiagnosis.ts`
- Modify: `src/lib/diagnose/enrichedContext.ts`
- Test: `src/__tests__/scenario-handoff.test.ts`
- Test: `src/__tests__/enriched-diagnosis-context.test.ts`

- [ ] **Step 1: Write failing handoff tests for serve grounding**

Add tests that require:
- the handoff context preserves `serve.control_pattern`
- the handoff context preserves `serve.mechanism_family`
- the diagnosis input summary includes the newly grounded serve clue when available

Run:
```bash
npm test -- src/__tests__/scenario-handoff.test.ts src/__tests__/enriched-diagnosis-context.test.ts
```
Expected: FAIL.

- [ ] **Step 2: Extend enriched Deep handoff types**

Add typed handoff fields for the new serve grounding so downstream diagnosis and plan context can reuse them.

- [ ] **Step 3: Inject the serve detail into handoff summaries**

Update `toDiagnosisInput.ts` so a serve scene can produce summaries like:
- `"更像抛球不稳"`
- `"更像触球点乱"`
- `"更像发力节奏乱"`

Only add detail when the field is actually resolved.

- [ ] **Step 4: Re-run the handoff tests**

Run:
```bash
npm test -- src/__tests__/scenario-handoff.test.ts src/__tests__/enriched-diagnosis-context.test.ts
```
Expected: PASS.

## Task 5: Add Deep Mode Resume / Loopback

**Files:**
- Modify: `src/components/diagnose/DeepScenarioModule.tsx`
- Modify: `src/app/diagnose/page.tsx`
- Modify: `src/components/diagnose/DiagnoseResult.tsx`
- Modify: `src/components/diagnose/scenario/ScenarioQuestionCard.tsx`
- Modify: `src/components/diagnose/scenario/ScenarioSummaryCard.tsx`
- Test: `src/__tests__/deep-scenario-module.test.tsx`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`
- Test if needed: `src/__tests__/deep-diagnose-result.test.tsx`

- [ ] **Step 1: Write failing UI tests for loopback**

Add tests that prove:
- if Deep Mode is still gathering serve-required info, proceed CTA stays hidden
- if a deep handoff still yields `needsNarrowing`, the UI offers a return-to-next-question action instead of leaving the user on a dead-end static hint
- the Deep Mode module can resume from preserved scenario state

Run:
```bash
npm test -- src/__tests__/deep-scenario-module.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx src/__tests__/deep-diagnose-result.test.tsx
```
Expected: FAIL.

- [ ] **Step 2: Preserve the live Deep Mode scenario in the diagnose page**

Store the last active Deep Mode scenario in `src/app/diagnose/page.tsx` so the page can:
- resume the same scene state
- re-open Deep Mode at the next unresolved question

- [ ] **Step 3: Let `DeepScenarioModule` hydrate from an existing scenario**

Add a prop for an initial/resumed scenario snapshot and use it to:
- show the current selected question again
- keep summary/progress intact
- avoid forcing the user to restart from scratch

- [ ] **Step 4: Convert post-handoff narrowing into a return path**

When:
- effort mode is `deep`
- diagnosis result is still `needsNarrowing`
- and a live/resumable scenario exists

then the result surface should provide a primary path back to the next Deep Mode question instead of pretending the result is final.

Do not broaden this into a full new page. Keep it inside the current `/diagnose` flow.

- [ ] **Step 5: Keep copy honest**

If Deep Mode is not fully ready, do not say:
- `"当前场景已经补全到可进入深入分析"`

If diagnosis still needs one more clue after a deep handoff, the wording should clearly say:
- go back and continue reconstruction

- [ ] **Step 6: Re-run the UI tests**

Run:
```bash
npm test -- src/__tests__/deep-scenario-module.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx src/__tests__/deep-diagnose-result.test.tsx
```
Expected: PASS.

## Task 6: Full Focused Verification

**Files:**
- Modify if needed: `docs/engineering/scenario-reconstruction-skill-policy.md`

- [ ] **Step 1: Update the design note**

Document:
- serve-specific Deep required slots
- why handoff should not happen before those slots resolve
- how result-page loopback works when a deep handoff still needs more serve grounding

- [ ] **Step 2: Run the focused regression bundle**

Run:
```bash
npm test -- src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-selector.test.ts src/__tests__/scenario-routes.test.ts src/__tests__/scenario-handoff.test.ts src/__tests__/enriched-diagnosis-context.test.ts src/__tests__/deep-scenario-module.test.tsx src/__tests__/deep-diagnose-orchestrator.test.tsx src/__tests__/deep-diagnose-result.test.tsx
```
Expected: PASS.

- [ ] **Step 3: Run plan-side compatibility checks**

Run:
```bash
npm test -- src/__tests__/plan-context.test.ts src/__tests__/study-plan-draft.test.ts src/__tests__/deep-plan-overlay.test.ts
```
Expected: PASS.

- [ ] **Step 4: Run production build**

Run:
```bash
npm run build
```
Expected: PASS.

## Acceptance Criteria

- A serve complaint like `"我的原地的发球发坏不太受控，而且会发紧"` does not become deep-ready after only generic serve scaffolding.
- Serve Deep Mode continues asking serve-valid questions until serve-required grounding is resolved, skipped, cannot-answer, or capped.
- Serve scenes remain category-consistent through handoff and diagnosis.
- If post-handoff diagnosis still needs more scene grounding, the user gets a direct return path to the next Deep Mode question.
- Invalid cross-technique questions still never appear.

## Risks / Rollback Notes

- The main risk is over-tightening serve and making Deep Mode feel too long. Keep the new required serve slots minimal and diagnostic, not encyclopedic.
- Do not add general-purpose slots that later leak into other categories.
- If the loopback UX becomes noisy, keep the preserved-scenario plumbing and downgrade the result-surface CTA wording, but do not remove the deeper serve grounding model.
