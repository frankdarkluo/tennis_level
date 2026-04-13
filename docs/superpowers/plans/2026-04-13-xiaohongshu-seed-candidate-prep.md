# Xiaohongshu Seed Candidate Preparation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prepare a small QA-only Xiaohongshu seed-candidate set for the three approved creators, with human-review handoff data and no promotion into `contents.ts`.

**Architecture:** Add one focused candidate-prep helper and one script that converts curated creator/note evidence into a validated QA JSON artifact. Keep candidate records outside retrieval, preserve raw entry URLs plus creator-profile evidence, and reuse the existing PR3 review/import path rather than inventing a second review system.

**Tech Stack:** TypeScript scripts via `ts-node`, existing `@/` alias registration, Vitest, JSON QA artifacts under `ops/quality/`

---

### Task 1: Add failing tests for candidate validation and handoff rendering

**Files:**
- Create: `src/__tests__/xiaohongshu-seed-candidates.test.ts`
- Reference: `scripts/lib/manualReviewImport.ts`
- Reference: `src/lib/platform-connectors/xiaohongshu.ts`

- [ ] **Step 1: Write the failing test**

Add tests that expect a helper to:
- reject candidates whose creator profile URL is not a Xiaohongshu `user/profile/...` URL
- normalize note URLs through the PR6 Xiaohongshu connector when possible
- preserve `rawUrl`, `canonicalUrl`, `creatorProfileUrl`, `title`, `thumbnailUrl`, and `crossPlatformNotes`
- sort and cap output per creator without forcing weak filler rows

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/xiaohongshu-seed-candidates.test.ts`
Expected: FAIL because the helper module does not exist yet.

- [ ] **Step 3: Write minimal implementation**

Create a helper module that:
- defines the candidate input/output shape
- validates creator-profile and note URL surfaces conservatively
- canonicalizes supported note URLs with the existing Xiaohongshu connector
- keeps unsupported note URLs as `canonicalUrl: null`
- groups by creator and keeps up to five strongest rows per creator

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/xiaohongshu-seed-candidates.test.ts`
Expected: PASS.

### Task 2: Add the candidate-prep script and QA artifact format

**Files:**
- Create: `scripts/lib/xiaohongshuSeedCandidates.ts`
- Create: `scripts/prepare-xiaohongshu-seed-candidates.ts`
- Create: `ops/quality/xiaohongshu-seed-candidates.json`
- Modify: `ops/quality/README.md`

- [ ] **Step 1: Write the failing integration test**

Extend the test file to expect a script-facing builder to emit:
- `generatedAt`
- `summary` with per-creator counts
- `candidates` grouped or filterable by creator
- handoff fields for each saved candidate:
  - `rawUrl`
  - `canonicalUrl`
  - `creatorProfileUrl`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/xiaohongshu-seed-candidates.test.ts`
Expected: FAIL because the builder/script artifact shape is incomplete.

- [ ] **Step 3: Write minimal implementation**

Implement:
- a builder that accepts curated candidate evidence rows
- a script that writes `ops/quality/xiaohongshu-seed-candidates.json`
- README updates documenting how to inspect the candidate file and hand it to manual review

Seed the JSON artifact with only high-confidence rows discovered for:
- `盖奥`
- `灵熙🎾`
- `冠军教练 - 莫拉托格鲁`

Use up to five per creator, but allow fewer when the environment only yields fewer strong rows.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/__tests__/xiaohongshu-seed-candidates.test.ts`
Expected: PASS.

### Task 3: Verify candidate prep end-to-end without touching catalog promotion

**Files:**
- Verify: `ops/quality/xiaohongshu-seed-candidates.json`
- Verify: `scripts/prepare-xiaohongshu-seed-candidates.ts`
- Verify: `ops/quality/README.md`

- [ ] **Step 1: Generate the QA artifact**

Run: `npx ts-node --project tsconfig.scripts.json scripts/prepare-xiaohongshu-seed-candidates.ts`
Expected: writes `ops/quality/xiaohongshu-seed-candidates.json` and prints per-creator saved counts.

- [ ] **Step 2: Run targeted checks**

Run: `npm test -- src/__tests__/xiaohongshu-seed-candidates.test.ts src/__tests__/platform-connectors.test.ts`
Expected: PASS.

- [ ] **Step 3: Run broader verification**

Run:
- `npm test`
- `npm run validate:data`
- `npm run build`

Expected: PASS, with no retrieval/ranking/UI changes and no `contents.ts` promotion.
