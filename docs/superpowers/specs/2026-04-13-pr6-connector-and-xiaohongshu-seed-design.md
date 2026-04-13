# PR6 Connector Scaffold And Xiaohongshu Seed Design

## Summary

This design splits the next platform-expansion work into two explicitly separate phases:

1. `PR6` is a strict connector scaffold PR only.
2. A small follow-up seed pass prepares and reviews Xiaohongshu candidates for three named creators before any promotion into `contents.ts`.

The core rule is that connector readiness and content promotion are different jobs. `PR6` should make Xiaohongshu and Instagram legible to the catalog and QA pipeline, but it should not become a disguised ingestion PR.

## Product Goal

Improve platform readiness without polluting the catalog.

The intended operational outcome is:

- platform URLs can be normalized and QA-checked
- Xiaohongshu seed candidates can be prepared with evidence
- only strongly supported items are promoted into the main curated content set

## In Scope

### Phase 1: PR6 strict scaffold

- extend the connector interface in `src/lib/platform-connectors/types.ts`
- add `src/lib/platform-connectors/xiaohongshu.ts`
- add `src/lib/platform-connectors/instagram.ts`
- wire those connectors into catalog normalization
- make `verify-content-remote.ts` recognize their canonical direct-source surfaces
- add or update minimal scaffold tests

### Phase 2: Xiaohongshu seed follow-up

- prepare a small seed-candidate layer for three named Xiaohongshu creators:
  - `盖奥网球`
  - `灵熙`
  - `冠军教练-莫拉特格鲁`
- preserve candidate evidence and route candidates through the existing QA/review workflow
- promote only sufficiently supported items into `contents.ts`

## Out Of Scope

- broad platform ingestion
- large creator expansion
- connector-driven scraping expansion
- retrieval or ranking changes
- UI changes
- `/video-diagnose` changes
- auto-promoting weakly verified Xiaohongshu items into `contents.ts`

## Design Principles

### 1. Scaffold First, Catalog Second

`PR6` exists to make new platforms understandable to the system, not to prove growth by stuffing new content into the library.

The system should become capable of:

- canonicalizing Xiaohongshu and Instagram URLs
- distinguishing direct-source versus search-like or unsupported surfaces
- extracting a stable post identifier where possible
- preserving creator-handle normalization when the handle is obvious enough

It should not use scaffold work as justification for a large ingestion pass.

### 2. Strong Evidence Before Promotion

For Xiaohongshu seed work, probable correctness is not enough.

If a candidate only looks plausible but the direct link or key metadata cannot be verified strongly enough in the current environment, that candidate must stay in the seed-candidate or QA-preparation layer. It should not enter `contents.ts`.

### 3. Cross-Platform Links Stay Separate

If the same underlying teaching clip appears on both Xiaohongshu and Bilibili, the semantic tags may align, but the content records should remain platform-specific unless the repo later gains a clean cross-platform grouping model.

That means:

- separate content items
- separate URLs
- separate platform metadata
- aligned tags only when justified
- conservative duplication handling

### 4. Quality Over Volume

The first Xiaohongshu seed should be small, explicit, and easy to audit.

For this phase, the repo should prefer:

- clear creator identity
- clear tennis-teaching relevance
- justifiable problem tags
- stable enough direct link and metadata

over:

- creator count
- item count
- platform breadth

## Architecture

### Phase 1: PR6 strict scaffold

### Connector Contract

The connector interface should stay small and operational:

```ts
type PlatformConnector = {
  platform: ContentPlatform;
  canonicalizeUrl(url: string): string | null;
  extractPostId(url: string): string | null;
  inferRightsStatus(url: string): CatalogRightsStatus;
  normalizeCreatorHandle?(handle: string): string | null;
};
```

The intended behavior:

- `canonicalizeUrl`
  - remove irrelevant query params
  - normalize to the most stable direct post form the connector can support
  - return `null` when the URL cannot be canonicalized into a supported direct-post surface
- `extractPostId`
  - return a stable platform post identifier when the URL surface supports it
- `inferRightsStatus`
  - classify obvious direct-source versus search-like surfaces conservatively
  - never upgrade an unsupported or non-canonicalizable surface into `direct_source`
- `normalizeCreatorHandle`
  - optional cleanup only, not identity invention

This contract is intentionally narrow:

- unsupported profile, search, collection, or otherwise non-post surfaces may receive best-effort parsing
- but if `canonicalizeUrl` returns `null`, downstream normalization and verification must treat that surface as unsupported for direct-link purposes
- connector-specific convenience normalization must never be used as evidence that a URL is a valid `direct_source`

### Integration Points

`PR6` should touch the smallest clean integration points:

- `src/lib/platform-connectors/types.ts`
- `src/lib/platform-connectors/xiaohongshu.ts`
- `src/lib/platform-connectors/instagram.ts`
- `src/lib/content-catalog/normalize.ts`
- `scripts/lib/remoteVerification.ts`
- scaffold tests

No retrieval logic should be widened. No ranking hooks should be added.

### Verification Behavior

Remote verification should be able to:

- recognize canonical Xiaohongshu direct post surfaces
- recognize canonical Instagram direct post surfaces
- keep unsupported, blocked, and ambiguous outcomes conservative

The verification layer is for QA evidence, not for public product behavior.

## Phase 2: Xiaohongshu seed follow-up

### Target Creators

The first Xiaohongshu seed pass should only focus on:

- `盖奥网球`
- `灵熙`
- `冠军教练-莫拉特格鲁`

Why these three:

- `灵熙` is especially important because there is no Bilibili fallback
- `盖奥网球` and `冠军教练-莫拉特格鲁` are useful overlap cases where the semantic tags may already be grounded by Bilibili equivalents

### Seed Workflow

The seed follow-up should use this workflow:

1. collect or prepare Xiaohongshu direct-link candidates for the three creators
2. preserve evidence in a candidate or QA-preparation layer
3. run the existing PR3 review, verification, and overlay-import workflow
4. only after minimum evidence is met, promote selected items into `contents.ts`

This workflow must remain separate from retrieval logic.

### Candidate Layer Requirements

A seed candidate should preserve, when available:

- creator identity evidence
- platform URL
- post ID
- title or visible label
- thumbnail or cover evidence
- cross-platform equivalence notes when relevant
- preliminary tag hypothesis

This layer may contain candidates that are not yet strong enough for `contents.ts`.

### Candidate Layer Location And Minimal Schema

The Xiaohongshu seed-candidate layer should live outside `contents.ts` and outside retrieval inputs.

The planned landing point is:

- `ops/quality/xiaohongshu-seed-candidates.json`

The minimal record shape should be:

```ts
type XiaohongshuSeedCandidate = {
  candidateId: string;
  creatorName: string;
  platform: "xiaohongshu";
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

Constraints:

- this file is QA-preparation data only
- it must not be consumed by retrieval
- it may hold partially verified candidates
- every candidate should preserve enough evidence to justify later review or rejection

### Promotion Bar For `contents.ts`

An item is eligible for promotion into `contents.ts` only if all of the following are true:

- creator identity is clear
- tennis-teaching relevance is clear
- the problem-tag assignment is justifiable
- and either:
  - remote verification evidence is strong enough for the direct link and key metadata
  - or manual confirmation is recorded through the existing PR3 review/import path

Operationally, this means:

- “probably correct” is not enough
- a candidate that lacks strong remote evidence may still be promoted, but only when the missing confidence is replaced by explicit manual confirmation in the QA workflow
- if neither strong remote evidence nor recorded manual confirmation exists, the item must remain outside `contents.ts`

## Cross-Platform Overlap Policy

When a Xiaohongshu item appears to match an existing Bilibili item:

- keep separate content records
- align semantic tags when the match is strong enough
- keep platform URLs distinct
- keep thumbnails and QA evidence platform-specific
- note likely equivalence conservatively if a candidate layer needs it

The system should not collapse the two into one canonical content item in this phase.

## Error Handling And Conservatism

### Scaffold Phase

If a platform URL does not match a supported direct post surface:

- do not force it into `direct_source`
- keep the classification conservative
- let QA output explain why it was unsupported or unverified

### Seed Phase

If a candidate cannot be strongly verified in the current environment:

- do not write it into `contents.ts`
- preserve the evidence that does exist
- keep it in the seed-candidate or review-preparation layer
- route it through review before promotion

## Testing Strategy

### PR6 scaffold tests

Minimum scaffold tests should cover:

- Xiaohongshu URL canonicalization
- Instagram URL canonicalization
- post ID extraction for both platforms
- search-like versus direct-source rights inference
- remote verification recognition of supported canonical surfaces
- no regression to Bilibili and YouTube normalization behavior

### Seed follow-up tests

The follow-up seed pass should prefer targeted data-quality tests over broad ingestion tests. At minimum:

- candidate preparation keeps platform-specific URLs
- cross-platform overlap does not collapse records
- promotion rules reject insufficiently supported candidates
- promoted items satisfy existing catalog and validation rules

## Acceptance Criteria

### PR6 scaffold

- does not affect current Bilibili or YouTube behavior
- Xiaohongshu and Instagram URLs can be canonicalized
- supported direct post surfaces can be recognized by remote verification
- connector behavior is covered by minimal scaffold tests
- no retrieval, ranking, UI, or `/video-diagnose` changes

### Xiaohongshu seed follow-up

- seed work is started separately after scaffold stability
- the three named creators are the only initial priority scope
- weakly verified candidates stay out of `contents.ts`
- promoted items, if any, satisfy the evidence bar
- cross-platform overlap is handled conservatively with separate platform records

## Risks

- platform surfaces may change and break canonicalization assumptions
- current environment may not always support strong enough direct verification for Xiaohongshu candidates
- overlapping Bilibili and Xiaohongshu clips may be similar enough to tempt over-merging

This design accepts those risks by biasing toward smaller scope and slower promotion.

## Recommendation

Implement `PR6` as a narrow scaffold PR first. Only after that is stable should the repo begin the small Xiaohongshu creator seed pass, with the candidate layer and evidence bar enforced before any `contents.ts` promotion.
