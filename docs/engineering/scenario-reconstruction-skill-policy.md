---
aliases:
  - Scenario Reconstruction Skill Policy
tags:
  - type/reference
  - area/diagnose
  - area/scenario-reconstruction
  - area/engineering
  - status/reference
---

# Scenario Reconstruction Skill Policy

## Why the universal follow-up template was insufficient

The original deep-diagnosis follow-up flow treated question selection as a generic missing-slot problem. That meant a slot like `context.movement` could become the next question even when the current tennis complaint was about serve, where "set vs moving" is not a valid diagnostic dimension.

The failure was not one bad serve rule. The failure was that tennis-skill legality lived too low in the stack, after the system had already decided which generic questions were eligible.

## What the new skill-category layer does

The refactor keeps the existing scenario reconstruction pipeline and adds one policy layer before selection:

1. infer a conservative tennis `SkillCategory`
2. load the single policy for that category
3. filter the shared question bank by allowed `QuestionFamily`
4. only then apply missing-slot checks, priority, and optional LLM ranking

This makes legality category-first instead of slot-first.

## Why Deep Mode now optimizes for completeness

Deep Mode is not a lightweight "good enough" pass. Its job is to ground the scene more fully before downstream analysis.

That means Deep Mode now keeps asking category-valid follow-ups until one of these is true:

- category-required information has been answered
- the player explicitly skipped it
- the player explicitly cannot answer it
- a hard follow-up cap is reached

The hard cap is an honest stop, not fake completion. If the system stops because it hit the cap, it should preserve that unresolved state instead of claiming the scene is fully reconstructed.

## Required vs optional grounding

Each skill category now defines:

- allowed question families
- forbidden question families
- Deep Mode required slots
- Deep Mode optional slots
- forbidden slots
- mechanism-family labels for the category
- a hard follow-up cap

Required slots are what block Deep Mode handoff while they are still askable. Optional slots can still improve context, but they should not be treated as hidden blockers.

This keeps completeness category-specific. A serve complaint and a moving-groundstroke complaint should not require the same dimensions.

For serve in particular, Deep Mode should not stop at "serve + session + rough outcome + pressure." V1 now keeps serve open until it also resolves the serve-internal grounding that downstream diagnosis actually needs:

- serve variant
- serve control pattern when the miss is still broad (`no_control` / not yet pinned down)
- likely serve mechanism family such as toss, contact/timing, rhythm, or direction-control drift

That is the difference between "we know this is serve" and "we know enough about this serve problem to hand off."

PR2 extends the same rule to the other high-priority categories instead of leaving them on a generic non-serve fallback:

- return can ask about return positioning and first-ball goal, but cannot ask serve toss/rhythm or incoming-ball-depth questions
- volley can ask about volley contact height and racket-face control, but cannot ask serve or groundstroke-depth questions
- overhead can ask about overhead contact timing/position, but cannot ask serve or incoming-ball-depth questions
- slice can ask about slice response pattern, but cannot ask serve or incoming-ball-depth questions
- moving groundstroke cases keep movement and incoming-ball-depth legal because those dimensions are meaningful for that category

The non-serve detail slots stay bounded on purpose. They are category-specific enough to prevent obvious tennis-logic mismatches without turning scenario reconstruction into a full technique ontology.

## Skip and cannot-answer provenance

Deep Mode now distinguishes:

- `unasked`
- `answered`
- `skipped`
- `cannot_answer`

`skipped` and `cannot_answer` are not interchangeable:

- `skipped` means the player chose not to answer
- `cannot_answer` means the information is unavailable to the player

Downstream analysis should preserve that difference instead of flattening both into generic "unknown."

## Deep Mode handoff is now a downstream contract

Once Deep Mode has a reliable skill category, the handoff into diagnosis is no longer a soft hint.

The handoff now carries:

- `skillCategory`
- category confidence
- grounded scene summary
- unresolved required-slot provenance
- whether Deep Mode stopped because it was actually ready or because it hit the cap

Downstream diagnosis must gate candidates through that same category before ranking. If Deep Mode grounded the scene as `serve`, the diagnosis layer cannot silently jump to `forehand` just because a global lexical rule scored well.

If there is a real mismatch, the system should surface an honest category-conflict state instead of pretending the cross-category diagnosis is normal.

If downstream diagnosis still says the evidence is too thin, that should be treated as a loopback signal rather than a normal finish. The user should be routed back to Deep Mode to continue scene reconstruction instead of being stranded on a static "add one more clue" result.

## Safe fallback behavior

When technique inference is weak, the system does not guess. It switches to a deliberately small safe fallback policy and only allows broad context questions such as:

- practice vs match
- broad shot-family clarification
- broad outcome pattern
- pressure/rushed-vs-tight context

It does not reuse technique-specific generic questions like movement or incoming-ball depth in that fallback mode.

## How to extend it safely

When adding a new tennis technique or follow-up:

1. add or refine a `QuestionFamily`
2. add or refine a `SkillCategory`
3. update the single policy source of truth in `skillPolicy.ts`
4. add any new detail slot to the scenario type, initial state, answer application, and handoff copy
5. add regression tests showing invalid families can never surface for that category and the exact missing slot continues before generic fallback

Do not add one-off exclusions directly inside selector ranking logic. If a question is invalid for a category, the policy layer should make it ineligible before ranking starts.
