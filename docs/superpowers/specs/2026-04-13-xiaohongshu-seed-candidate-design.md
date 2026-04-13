# Xiaohongshu Seed Candidate Preparation Design

## Summary

This follow-up is a narrow Phase 2 continuation after the PR6 connector scaffold.

The goal is to prepare a small, reviewable Xiaohongshu seed-candidate set for three approved creators:

- `盖奥`
- `灵熙🎾`
- `冠军教练 - 莫拉托格鲁`

This phase does not promote anything into `contents.ts`.
It only prepares note-level candidate evidence so the existing PR3 QA workflow can verify or reject entries before any future catalog promotion.

## Product Goal

Make Xiaohongshu seed preparation operational without lowering catalog quality.

The intended outcome is:

- the repo can hold a small audited candidate set for the three target creators
- each candidate preserves enough evidence for later QA review
- weakly verified Xiaohongshu content stays outside retrieval and outside `contents.ts`

## In Scope

- resolve and preserve creator-profile evidence for the three approved Xiaohongshu creators
- prepare a small note-level candidate set from publicly reachable Xiaohongshu note links
- store those candidates in the predefined QA-only layer
- include preliminary tag hypotheses and cross-platform notes where justified
- keep the output compatible with the existing PR3 review and import workflow

## Out Of Scope

- promotion into `contents.ts`
- retrieval or ranking changes
- UI changes
- connector expansion beyond the PR6 scaffold
- broad scraping or large-scale ingestion
- automatic writeback from remote verification to production data

## Approved Creator Evidence

These creator profile links are now treated as strong identity evidence:

- `盖奥`
  - `https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc`
- `灵熙🎾`
  - `https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346`
- `冠军教练 - 莫拉托格鲁`
  - `https://www.xiaohongshu.com/user/profile/6050684100000000010047d5`

The corresponding short links may be preserved in evidence notes, but the canonical creator evidence should use the resolved `user/profile/...` URLs.

## Approach

This phase uses a small note-level candidate preparation workflow.

For each creator:

1. identify a small number of publicly reachable Xiaohongshu note URLs
2. preserve profile evidence, note URL, post ID, visible metadata, and any thumbnail evidence
3. assign preliminary problem tags conservatively
4. note likely cross-platform equivalence when the overlap is strong enough
5. keep every candidate in `needs_review`

The default target should stay small:

- approximately `5` high-confidence note candidates per creator
- prefer fewer high-confidence candidates over more weak ones

## Candidate Layer

The candidate layer remains:

- `ops/quality/xiaohongshu-seed-candidates.json`

This file is QA-only and must not be used by retrieval or ranking code.

The minimal record shape is:

```ts
type XiaohongshuSeedCandidate = {
  candidateId: string;
  creatorName: string;
  platform: "xiaohongshu";
  creatorProfileUrl: string;
  canonicalUrl: string | null;
  rawUrl: string;
  postId: string | null;
  title: string | null;
  thumbnailUrl: string | null;
  evidence: {
    creatorEvidence: string[];
    contentEvidence: string[];
    thumbnailEvidence: string[];
  };
  preliminaryProblemTags: string[];
  crossPlatformNotes?: string | null;
  reviewStatus: "needs_review";
};
```

## Evidence Standard

Each prepared candidate should preserve enough evidence to answer:

- is this clearly from the intended creator
- is this clearly tennis teaching or drill content
- is the note URL a plausible direct post surface
- are the preliminary problem tags defensible

Preferred evidence:

- resolved creator profile URL
- resolved or directly copied note URL
- visible note title
- visible thumbnail or cover URL
- post ID if extractable
- short plain-language justification for tag assignment

If a note only has weak evidence, keep it out of the candidate file.

## Manual Review Handoff

This follow-up should produce a human-reviewable handoff for each creator:

- up to `5` high-confidence Xiaohongshu note candidates
- the direct note entry URL used for candidate preparation
- any resolved canonical note URL when obtainable
- the creator profile URL used as identity evidence

The intent is that a human can manually open and verify these note entry links before any later promotion step.

## Cross-Platform Handling

If a Xiaohongshu note appears to match an existing Bilibili item:

- keep the Xiaohongshu candidate as a separate platform-specific candidate
- align semantic tags only when the overlap is strong
- record the likely equivalence in `crossPlatformNotes`
- do not merge records
- do not assume cross-platform sameness from creator name alone

## QA Workflow

This follow-up must reuse the existing PR3 path:

1. prepare `xiaohongshu-seed-candidates.json`
2. run or inspect remote verification where a canonical note URL exists
3. copy selected candidates into the manual review format
4. record manual review decisions
5. only after strong remote evidence or explicit manual confirmation may a future slice propose catalog promotion

This design intentionally stops before step 5.

## Smallest Clean Implementation

The implementation should stay small and infrastructural:

- one script to prepare Xiaohongshu candidates from curated input evidence
- optional helper code for parsing and validating candidate records
- one QA JSON artifact format
- targeted tests for:
  - candidate record validation
  - creator-profile evidence preservation
  - note URL canonicalization compatibility with PR6 scaffold
  - cross-platform note preservation

No retrieval code should be touched.

## Acceptance Criteria

- a QA-only Xiaohongshu seed-candidate file exists for the three approved creators
- every saved candidate has strong enough creator and note evidence to justify manual review
- candidates stay outside `contents.ts`
- candidates stay outside retrieval behavior
- cross-platform overlap is recorded conservatively, not collapsed
- targeted tests cover validation and evidence preservation

## Risks

- Xiaohongshu note surfaces may be inconsistent across share modes, so canonical note URLs may still need manual confirmation
- some creators may yield fewer than three strong candidates in the current environment
- “small and clean” is more important than balancing creator counts exactly

## Recommendation

Implement this as a single narrow follow-up:

- prepare a tiny, defensible candidate set
- keep everything in QA-only storage
- stop before any catalog promotion
