# Deep Diagnosis Skill-Policy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make deep-diagnosis follow-up question selection obey tennis-specific skill-category policy so invalid question families can never surface for the current technique.

**Architecture:** Keep the existing scenario reconstruction pipeline and `ScenarioState`, but insert a new tennis skill-policy layer before selection. The selector will infer a conservative `SkillCategory`, load a single policy source of truth, filter the shared question bank by allowed `QuestionFamily`, and only then apply missing-slot logic and optional LLM ranking. Completion logic becomes policy-aware and conservative, with a tiny safe fallback mode instead of generic question reuse.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Testing Library, existing scenario reconstruction runtime/API modules

---

## File Structure

### Existing files to modify

- `src/types/scenario.ts`
  Add `SkillCategory`, `QuestionFamily`, `ScenarioQuestion.fillsSlots`, `ScenarioQuestion.family`, and a typed inference result.
- `src/data/scenarioReconstruction/questionBank.ts`
  Annotate the existing question bank with stable family ids and deterministic `fillsSlots`; add the broad shot-family clarification question for fallback.
- `src/lib/scenarioReconstruction/schema.ts`
  Reduce the universal critical-slot assumption and expose only shared compatibility helpers that remain useful after policy introduction.
- `src/lib/scenarioReconstruction/runtime.ts`
  Replace global missing-slot/completion assumptions with policy-aware helpers while preserving parse/answer/finalize flow.
- `src/lib/scenarioReconstruction/selector.ts`
  Add category inference + policy filtering before slot-based eligibility and LLM ranking.
- `src/lib/scenarioReconstruction/answer.ts`
  Handle any new v1 fallback clarification question answer deterministically.
- `src/app/api/scenario-reconstruction/parse/route.ts`
  Keep route shape stable, but ensure selected/eligible questions reflect policy-filtered legality.
- `src/app/api/scenario-reconstruction/answer-followup/route.ts`
  Keep route shape stable, but ensure the next question is selected under the new policy.

### New files to create

- `src/lib/scenarioReconstruction/skillPolicy.ts`
  Single source of truth for allowed families, required slots, stop rules, and safe fallback rules by category.
- `src/lib/scenarioReconstruction/inferSkillCategory.ts`
  Conservative category inference with confidence + reasons, including conflict resolution.
- `docs/engineering/scenario-reconstruction-skill-policy.md`
  Short repo-facing design note explaining why universal follow-up templates fail, what the new policy layer is, and how to extend it safely.

### Tests to modify

- `src/__tests__/scenario-selector.test.ts`
  Update selector expectations to the new legality-first behavior.
- `src/__tests__/scenario-runtime.test.ts`
  Add inference/stop-rule/fallback coverage.
- `src/__tests__/scenario-routes.test.ts`
  Add route-level protection that invalid families never surface.
- `src/__tests__/deep-diagnose-orchestrator.test.tsx`
  Only if needed to preserve deep-mode integration behavior after selector/runtime changes.
- `src/__tests__/bilingual-rendering.test.tsx`
  Only if needed for new fallback clarification copy visibility or bilingual integrity.

---

### Task 1: Add typed skill-category and question-family primitives

**Files:**
- Create: `src/lib/scenarioReconstruction/skillPolicy.ts`
- Create: `src/lib/scenarioReconstruction/inferSkillCategory.ts`
- Modify: `src/types/scenario.ts`
- Test: `src/__tests__/scenario-runtime.test.ts`

- [ ] **Step 1: Write the failing type-and-policy test**

Add these tests near the top of `src/__tests__/scenario-runtime.test.ts`:

```ts
import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";

it("infers serve with high confidence for explicit serve-family phrasing", () => {
  const scenario = parseScenarioTextDeterministically("关键分时我的二发容易下网");
  const inferred = inferSkillCategory(scenario);

  expect(inferred.category).toBe("serve");
  expect(inferred.confidence).toBe("high");
});

it("falls back conservatively when the complaint is too vague for a technique-specific category", () => {
  const scenario = parseScenarioTextDeterministically("就是打着不对劲");
  const inferred = inferSkillCategory(scenario);

  expect(inferred.category).toBe("generic_safe_fallback");
  expect(inferred.confidence).toBe("low");
});

it("keeps the safe fallback policy intentionally tiny", () => {
  const policy = getSkillCategoryPolicy("generic_safe_fallback");

  expect(policy.allowedQuestionFamilies).toEqual([
    "session_context",
    "pressure_context",
    "outcome_pattern",
    "broad_shot_family_clarification"
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts -t "infers serve with high confidence|falls back conservatively|keeps the safe fallback policy intentionally tiny"
```

Expected: FAIL with missing imports or missing `inferSkillCategory` / `getSkillCategoryPolicy`.

- [ ] **Step 3: Extend scenario types with category/family metadata**

Update `src/types/scenario.ts` with the new types:

```ts
export type SkillCategory =
  | "serve"
  | "return"
  | "groundstroke_set"
  | "groundstroke_on_move"
  | "volley"
  | "overhead"
  | "slice"
  | "contextual_match_situation"
  | "generic_safe_fallback";

export type QuestionFamily =
  | "session_context"
  | "pressure_context"
  | "broad_shot_family_clarification"
  | "movement_context"
  | "outcome_pattern"
  | "incoming_ball_depth"
  | "serve_variant"
  | "serve_toss"
  | "serve_contact"
  | "serve_side"
  | "serve_spin_control"
  | "return_positioning"
  | "return_first_ball_goal"
  | "groundstroke_side"
  | "groundstroke_contact_height"
  | "volley_side"
  | "volley_height"
  | "volley_racket_face"
  | "overhead_contact"
  | "slice_response_pattern";

export type SkillCategoryInference = {
  category: SkillCategory;
  confidence: "high" | "medium" | "low";
  reasons: string[];
};
```

Update `ScenarioQuestion`:

```ts
export type ScenarioQuestion = {
  id: string;
  family: QuestionFamily;
  category: ScenarioQuestionCategory;
  target_slots: MissingSlotPath[];
  fillsSlots: MissingSlotPath[];
  priority: number;
  zh: string;
  en: string;
  ask_when: string[];
  do_not_ask_when: string[];
  information_gain_weight: number;
  presupposition_risk: number;
  easy_to_answer_score: number;
  options: ScenarioQuestionOption[];
};
```

- [ ] **Step 4: Add the policy module**

Create `src/lib/scenarioReconstruction/skillPolicy.ts`:

```ts
import type { MissingSlotPath, QuestionFamily, SkillCategory } from "@/types/scenario";

type SkillCategoryPolicy = {
  allowedQuestionFamilies: QuestionFamily[];
  requiredSlots: MissingSlotPath[];
  optionalSlots: MissingSlotPath[];
  fallbackPriority: number;
  maxFollowups: number;
  isDone(input: {
    askedQuestionCount: number;
    hasRequiredSlots: boolean;
    hasAnyOptionalSignal: boolean;
  }): boolean;
};

const policies: Record<SkillCategory, SkillCategoryPolicy> = {
  serve: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "serve_variant"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: ["subjective_feeling.rushed"],
    fallbackPriority: 100,
    maxFollowups: 2,
    isDone: ({ askedQuestionCount, hasRequiredSlots, hasAnyOptionalSignal }) =>
      hasRequiredSlots && (hasAnyOptionalSignal || askedQuestionCount >= 1)
  },
  groundstroke_set: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "movement_context", "outcome_pattern", "incoming_ball_depth"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: ["incoming_ball.depth"],
    fallbackPriority: 90,
    maxFollowups: 2,
    isDone: ({ hasRequiredSlots }) => hasRequiredSlots
  },
  groundstroke_on_move: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "movement_context", "outcome_pattern", "incoming_ball_depth"],
    requiredSlots: ["context.session_type", "context.movement", "outcome.primary_error"],
    optionalSlots: ["incoming_ball.depth"],
    fallbackPriority: 90,
    maxFollowups: 2,
    isDone: ({ hasRequiredSlots }) => hasRequiredSlots
  },
  contextual_match_situation: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"],
    requiredSlots: ["context.session_type"],
    optionalSlots: ["outcome.primary_error"],
    fallbackPriority: 80,
    maxFollowups: 2,
    isDone: ({ hasRequiredSlots, askedQuestionCount }) => hasRequiredSlots && askedQuestionCount >= 1
  },
  generic_safe_fallback: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"],
    requiredSlots: [],
    optionalSlots: ["context.session_type", "outcome.primary_error"],
    fallbackPriority: 10,
    maxFollowups: 1,
    isDone: ({ askedQuestionCount, hasAnyOptionalSignal }) => askedQuestionCount >= 1 || hasAnyOptionalSignal
  },
  return: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: [],
    fallbackPriority: 70,
    maxFollowups: 2,
    isDone: ({ hasRequiredSlots }) => hasRequiredSlots
  },
  volley: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: [],
    fallbackPriority: 70,
    maxFollowups: 2,
    isDone: ({ hasRequiredSlots }) => hasRequiredSlots
  },
  overhead: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: [],
    fallbackPriority: 60,
    maxFollowups: 2,
    isDone: ({ hasRequiredSlots }) => hasRequiredSlots
  },
  slice: {
    allowedQuestionFamilies: ["session_context", "pressure_context", "outcome_pattern"],
    requiredSlots: ["context.session_type", "outcome.primary_error"],
    optionalSlots: [],
    fallbackPriority: 60,
    maxFollowups: 2,
    isDone: ({ hasRequiredSlots }) => hasRequiredSlots
  }
};

export function getSkillCategoryPolicy(category: SkillCategory) {
  return policies[category];
}
```

- [ ] **Step 5: Add conservative category inference**

Create `src/lib/scenarioReconstruction/inferSkillCategory.ts`:

```ts
import type { ScenarioState, SkillCategoryInference } from "@/types/scenario";

function mentionsAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function inferSkillCategory(scenario: ScenarioState): SkillCategoryInference {
  const raw = scenario.raw_user_input.trim();

  if (scenario.stroke === "serve") {
    return { category: "serve", confidence: "high", reasons: ["scenario.stroke=serve"] };
  }

  if (scenario.stroke === "return") {
    return { category: "return", confidence: "high", reasons: ["scenario.stroke=return"] };
  }

  if (scenario.stroke === "volley") {
    return { category: "volley", confidence: "high", reasons: ["scenario.stroke=volley"] };
  }

  if (mentionsAny(raw, [/(关键分|盘点|break point|key point|under pressure)/i]) && scenario.stroke === "unknown") {
    return { category: "contextual_match_situation", confidence: "medium", reasons: ["pressure context without grounded stroke"] };
  }

  if (scenario.stroke === "forehand" || scenario.stroke === "backhand") {
    if (scenario.context.movement === "moving") {
      return { category: "groundstroke_on_move", confidence: "high", reasons: ["groundstroke with movement"] };
    }

    if (scenario.context.movement === "stationary") {
      return { category: "groundstroke_set", confidence: "high", reasons: ["groundstroke when set"] };
    }

    return { category: "generic_safe_fallback", confidence: "low", reasons: ["groundstroke family present but movement unresolved"] };
  }

  return { category: "generic_safe_fallback", confidence: "low", reasons: ["no reliable technique family"] };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts -t "infers serve with high confidence|falls back conservatively|keeps the safe fallback policy intentionally tiny"
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/types/scenario.ts src/lib/scenarioReconstruction/skillPolicy.ts src/lib/scenarioReconstruction/inferSkillCategory.ts src/__tests__/scenario-runtime.test.ts
git commit -m "feat: add deep diagnosis skill-policy primitives"
```

---

### Task 2: Annotate the question bank and answer handling with family-aware v1 metadata

**Files:**
- Modify: `src/data/scenarioReconstruction/questionBank.ts`
- Modify: `src/lib/scenarioReconstruction/answer.ts`
- Test: `src/__tests__/scenario-runtime.test.ts`

- [ ] **Step 1: Write the failing question-bank test**

Add these tests to `src/__tests__/scenario-runtime.test.ts`:

```ts
it("keeps every active scenario question tagged with a stable family and deterministic fillsSlots", () => {
  const bank = getQuestionBank();

  expect(bank.every((question) => question.family.length > 0)).toBe(true);
  expect(bank.every((question) => question.fillsSlots.length > 0)).toBe(true);
});

it("supports broad shot-family clarification as a safe fallback question", () => {
  const question = getQuestionBank().find((item) => item.id === "q_broad_shot_family");

  expect(question?.family).toBe("broad_shot_family_clarification");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts -t "stable family and deterministic fillsSlots|safe fallback question"
```

Expected: FAIL because existing questions do not have `family` / `fillsSlots` and the fallback clarification question does not exist yet.

- [ ] **Step 3: Annotate existing questions and add the safe clarification question**

Update `src/data/scenarioReconstruction/questionBank.ts` like this:

```ts
{
  id: "q_match_or_practice",
  family: "session_context",
  category: "scenario_localization",
  target_slots: ["context.session_type"],
  fillsSlots: ["context.session_type"],
  // ...existing fields...
}
```

```ts
{
  id: "q_movement_state",
  family: "movement_context",
  category: "scenario_localization",
  target_slots: ["context.movement"],
  fillsSlots: ["context.movement"],
  // ...existing fields...
}
```

```ts
{
  id: "q_outcome_pattern",
  family: "outcome_pattern",
  category: "outcome_clarification",
  target_slots: ["outcome.primary_error"],
  fillsSlots: ["outcome.primary_error"],
  // ...existing fields...
}
```

```ts
{
  id: "q_incoming_ball_depth",
  family: "incoming_ball_depth",
  category: "scenario_localization",
  target_slots: ["incoming_ball.depth"],
  fillsSlots: ["incoming_ball.depth"],
  // ...existing fields...
}
```

```ts
{
  id: "q_feeling_rushed_or_tight",
  family: "pressure_context",
  category: "subjective_experience",
  target_slots: ["subjective_feeling.rushed"],
  fillsSlots: ["subjective_feeling.rushed"],
  // ...existing fields...
}
```

Add the new v1 fallback clarification question:

```ts
{
  id: "q_broad_shot_family",
  family: "broad_shot_family_clarification",
  category: "scenario_localization",
  target_slots: ["outcome.primary_error"],
  fillsSlots: [],
  priority: 85,
  zh: "这个问题更像是哪一类：发球、底线击球、接发，还是网前球？",
  en: "Which broad shot family is this closer to: serve, baseline stroke, return, or net play?",
  ask_when: ["technique family is still unclear"],
  do_not_ask_when: ["stroke family is already reliable"],
  information_gain_weight: 0.9,
  presupposition_risk: 0.08,
  easy_to_answer_score: 0.92,
  options: [
    { key: "serve", zh: "发球", en: "Serve" },
    { key: "groundstroke", zh: "底线击球", en: "Baseline stroke" },
    { key: "return", zh: "接发", en: "Return" },
    { key: "net_play", zh: "网前球", en: "Net play" }
  ]
}
```

Then set `fillsSlots` for this question to an empty array only if you also update selector logic in Task 3 to treat family-clarification questions via a dedicated fallback hook. If you want the bank to stay uniform, use:

```ts
fillsSlots: ["outcome.primary_error"]
```

and document in code that the slot is only a routing anchor, not the true semantic payload.

- [ ] **Step 4: Wire answer handling for the new broad clarification question**

Update `src/lib/scenarioReconstruction/answer.ts`:

```ts
  if (questionId === "q_broad_shot_family") {
    if (answerKey === "serve") {
      nextScenario.stroke = "serve";
    } else if (answerKey === "return") {
      nextScenario.stroke = "return";
    } else if (answerKey === "net_play") {
      nextScenario.stroke = "volley";
    } else if (answerKey === "groundstroke" && nextScenario.stroke === "unknown") {
      nextScenario.stroke = "forehand";
    }
  }
```

Keep this mapping intentionally coarse in v1. The goal is safer category grounding, not perfect shot resolution from one answer.

- [ ] **Step 5: Run test to verify it passes**

Run:

```bash
npm test -- src/__tests__/scenario-runtime.test.ts -t "stable family and deterministic fillsSlots|safe fallback question"
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/data/scenarioReconstruction/questionBank.ts src/lib/scenarioReconstruction/answer.ts src/__tests__/scenario-runtime.test.ts
git commit -m "feat: tag scenario questions with tennis families"
```

---

### Task 3: Refactor selector legality so policy filtering happens before ranking

**Files:**
- Modify: `src/lib/scenarioReconstruction/selector.ts`
- Modify: `src/lib/scenarioReconstruction/runtime.ts`
- Modify: `src/lib/scenarioReconstruction/schema.ts`
- Test: `src/__tests__/scenario-selector.test.ts`
- Test: `src/__tests__/scenario-runtime.test.ts`

- [ ] **Step 1: Write the failing selector tests**

Update `src/__tests__/scenario-selector.test.ts` with the new v1 expectations:

```ts
it("never offers movement follow-ups for serve-family complaints", () => {
  const scenario = parseScenarioTextDeterministically("关键分时我的二发容易下网");
  const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

  expect(eligibleIds).not.toContain("q_movement_state");
});

it("never offers incoming-ball follow-ups for serve-family complaints", () => {
  const scenario = parseScenarioTextDeterministically("My serve has no power in matches");
  const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

  expect(eligibleIds).not.toContain("q_incoming_ball_depth");
});

it("still allows movement follow-ups for groundstroke complaints when the category supports them", () => {
  const scenario = parseScenarioTextDeterministically("比赛里我反手老下网");
  const eligibleIds = getEligibleQuestions(scenario).map((question) => question.id);

  expect(eligibleIds).toContain("q_movement_state");
});

it("uses only the safe fallback subset when technique inference is weak", () => {
  const scenario = parseScenarioTextDeterministically("就是打着不对劲");
  const eligibleFamilies = getEligibleQuestions(scenario).map((question) => question.family);

  expect(new Set(eligibleFamilies)).toEqual(
    new Set(["session_context", "pressure_context", "outcome_pattern", "broad_shot_family_clarification"])
  );
});
```

Replace the current serve-determinism expectation that hardcodes `q_movement_state`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/__tests__/scenario-selector.test.ts
```

Expected: FAIL because selector still filters only by missing slots.

- [ ] **Step 3: Add legality-first filtering to the selector**

Update `src/lib/scenarioReconstruction/selector.ts`:

```ts
import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";
```

Add family legality helpers:

```ts
function isQuestionFamilyAllowed(question: ScenarioQuestion, scenario: ScenarioState) {
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);
  return policy.allowedQuestionFamilies.includes(question.family);
}
```

Refactor eligibility:

```ts
function isQuestionEligible(scenario: ScenarioState, question: ScenarioQuestion) {
  if (!isQuestionFamilyAllowed(question, scenario)) {
    return false;
  }

  if (question.family === "broad_shot_family_clarification") {
    return inferSkillCategory(scenario).category === "generic_safe_fallback";
  }

  return question.fillsSlots.some((slot) => isSlotMissing(scenario, slot));
}
```

Keep LLM ranking restricted to the already-filtered `eligibleQuestions`. Do not change the route contract.

- [ ] **Step 4: Make runtime missing-slot and done logic policy-aware**

Refactor `src/lib/scenarioReconstruction/runtime.ts`:

```ts
import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";
```

Replace universal missing-slot logic:

```ts
export function getMissingSlots(scenario: ScenarioState): MissingSlotPath[] {
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);
  const ordered = [...policy.requiredSlots, ...policy.optionalSlots];

  return ordered.filter((slot) => {
    if (slot === "context.session_type") return scenario.context.session_type === "unknown";
    if (slot === "context.movement") return scenario.context.movement === "unknown";
    if (slot === "outcome.primary_error") return scenario.outcome.primary_error === "unknown";
    if (slot === "incoming_ball.depth") return scenario.incoming_ball.depth === "unknown";
    if (slot === "subjective_feeling.rushed") {
      return !scenario.subjective_feeling.rushed && !scenario.subjective_feeling.tight;
    }
    return false;
  });
}
```

Replace done logic:

```ts
export function isScenarioMinimallyAnalyzable(scenario: ScenarioState) {
  const inferred = inferSkillCategory(scenario);
  const policy = getSkillCategoryPolicy(inferred.category);
  const missing = getMissingSlots(scenario);
  const hasRequiredSlots = policy.requiredSlots.every((slot) => !missing.includes(slot));
  const hasAnyOptionalSignal = policy.optionalSlots.some((slot) => !missing.includes(slot));
  const askedQuestionCount = scenario.selected_next_question_id ? 1 : 0;

  return policy.isDone({ askedQuestionCount, hasRequiredSlots, hasAnyOptionalSignal });
}
```

If one answered-question counter is not enough for the follow-up cap, add a small `asked_followup_ids: string[]` field to `ScenarioState` and update `answer.ts`/runtime accordingly in this task.

- [ ] **Step 5: Run tests to verify legality-first behavior**

Run:

```bash
npm test -- src/__tests__/scenario-selector.test.ts src/__tests__/scenario-runtime.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/scenarioReconstruction/selector.ts src/lib/scenarioReconstruction/runtime.ts src/lib/scenarioReconstruction/schema.ts src/__tests__/scenario-selector.test.ts src/__tests__/scenario-runtime.test.ts
git commit -m "feat: enforce skill-policy before scenario question ranking"
```

---

### Task 4: Protect API and route-level regressions

**Files:**
- Modify: `src/app/api/scenario-reconstruction/parse/route.ts`
- Modify: `src/app/api/scenario-reconstruction/answer-followup/route.ts`
- Test: `src/__tests__/scenario-routes.test.ts`

- [ ] **Step 1: Write the failing route regressions**

Add these tests to `src/__tests__/scenario-routes.test.ts`:

```ts
it("POST /api/scenario-reconstruction/parse never returns movement follow-ups for serve complaints", async () => {
  mockParseScenario.mockRejectedValueOnce(new Error("offline"));
  mockRankQuestions.mockResolvedValueOnce(["q_movement_state"]);

  const { POST } = await import("../app/api/scenario-reconstruction/parse/route");
  const response = await POST(
    new Request("http://localhost/api/scenario-reconstruction/parse", {
      method: "POST",
      body: JSON.stringify({
        text: "关键分时我的二发容易下网",
        ui_language: "zh"
      })
    })
  );
  const body = await response.json();

  expect(body.eligible_questions.map((question: { id: string }) => question.id)).not.toContain("q_movement_state");
  expect(body.selected_question?.id).not.toBe("q_movement_state");
});

it("POST /api/scenario-reconstruction/parse keeps movement follow-ups available for groundstroke complaints", async () => {
  mockParseScenario.mockRejectedValueOnce(new Error("offline"));
  mockRankQuestions.mockResolvedValueOnce(["q_movement_state"]);

  const { POST } = await import("../app/api/scenario-reconstruction/parse/route");
  const response = await POST(
    new Request("http://localhost/api/scenario-reconstruction/parse", {
      method: "POST",
      body: JSON.stringify({
        text: "比赛里我反手老下网",
        ui_language: "zh"
      })
    })
  );
  const body = await response.json();

  expect(body.eligible_questions.map((question: { id: string }) => question.id)).toContain("q_movement_state");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/__tests__/scenario-routes.test.ts -t "never returns movement follow-ups for serve complaints|keeps movement follow-ups available for groundstroke complaints"
```

Expected: FAIL until the routes expose only policy-filtered selector output.

- [ ] **Step 3: Keep route responses stable but policy-driven**

Touch the route files only if needed to preserve response stability after runtime/selector changes. The intended code stays minimal:

```ts
const eligibleQuestions = getEligibleQuestions(scenario);
const selectedQuestion = isScenarioMinimallyAnalyzable(scenario)
  ? null
  : await selectNextQuestionWithLlm(scenario, client);
```

Do not widen the API surface. The fix belongs in the selector/runtime layer, not in route-specific filters.

- [ ] **Step 4: Run route tests**

Run:

```bash
npm test -- src/__tests__/scenario-routes.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/api/scenario-reconstruction/parse/route.ts src/app/api/scenario-reconstruction/answer-followup/route.ts src/__tests__/scenario-routes.test.ts
git commit -m "test: protect deep diagnosis route policy constraints"
```

---

### Task 5: Add the repo-facing design note and final focused verification

**Files:**
- Create: `docs/engineering/scenario-reconstruction-skill-policy.md`
- Test: `src/__tests__/deep-diagnose-orchestrator.test.tsx`
- Test: `src/__tests__/bilingual-rendering.test.tsx`

- [ ] **Step 1: Write the doc and any final narrow tests**

Create `docs/engineering/scenario-reconstruction-skill-policy.md`:

```md
# Scenario Reconstruction Skill Policy

## Why the old model was insufficient

The original deep-diagnosis follow-up flow treated follow-up selection as a generic missing-slot problem. That let technically invalid questions surface for the current tennis complaint.

## What the new layer does

The system now infers a conservative tennis skill category, loads one policy for that category, and filters the shared question bank by allowed question families before ranking.

## How to extend it safely

1. Add or refine a `QuestionFamily`
2. Add or refine a `SkillCategory`
3. Update the single policy source of truth
4. Add regression tests proving invalid families cannot surface for that category

Do not add technique-specific exclusions directly inside selector ranking rules.
```

If needed, add one narrow orchestrator or bilingual test such as:

```ts
it("keeps deep-mode scenario reconstruction visible while policy-filtered follow-ups stay legal", async () => {
  expect(screen.getByText("场景还原")).toBeInTheDocument();
});
```

Only add UI tests if selector/runtime changes affect existing deep-mode integration assumptions.

- [ ] **Step 2: Run focused verification**

Run:

```bash
npm test -- src/__tests__/scenario-selector.test.ts src/__tests__/scenario-runtime.test.ts src/__tests__/scenario-routes.test.ts
npm test -- src/__tests__/deep-diagnose-orchestrator.test.tsx
npm run build
```

Expected:

- scenario selector/runtime/route suites PASS
- orchestrator suite PASS or unchanged targeted expectations PASS
- build PASS

- [ ] **Step 3: Commit**

```bash
git add docs/engineering/scenario-reconstruction-skill-policy.md src/__tests__/deep-diagnose-orchestrator.test.tsx src/__tests__/bilingual-rendering.test.tsx
git commit -m "docs: record deep diagnosis skill-policy constraints"
```

---

## Self-Review Checklist

- Spec coverage:
  - explicit v1 family/category scope covered by Tasks 1-3
  - conservative conflict handling covered by Task 1 inference module
  - safe fallback subset covered by Tasks 1-3
  - selector filtering before ranking covered by Task 3
  - route-level regression protection covered by Task 4
  - doc note covered by Task 5
- Placeholder scan:
  - no TBD/TODO placeholders left in task steps
- Type consistency:
  - `SkillCategory`, `QuestionFamily`, `SkillCategoryInference`, `fillsSlots`, and `getSkillCategoryPolicy` stay consistent across tasks

## Execution Notes

- Do not preserve the existing `scenario-selector` serve expectation that prefers `q_movement_state`; that expectation is part of the broken abstraction and should be replaced.
- Keep the change within the approved v1 slice. Do not implement toss/contact/volley/overhead family-specific questions unless current parsing/tests require them for correctness.
- If `ScenarioState` needs a tiny `asked_followup_ids` field to support max-follow-up caps cleanly, add it. Do not introduce a larger session-history subsystem.
