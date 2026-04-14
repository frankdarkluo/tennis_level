---
aliases:
  - RedNote Platform Spec
  - Xiaohongshu Engineering Spec
tags:
  - type/feature
  - type/reference
  - area/content
  - area/library
  - area/mobile
  - status/reference
---

# RedNote / Xiaohongshu Engineering Spec

## Related docs
- [[index]]
- [[product/definition-of-done]]
- [[roadmap/current]]
- [[progress/2026-04-13]]
- [[superpowers/specs/2026-04-13-pr6-connector-and-xiaohongshu-seed-design]]
- [[superpowers/specs/2026-04-13-xiaohongshu-seed-candidate-design]]
- [[superpowers/specs/2026-04-13-mobile-preview-shell-design]]

## Scope

This document explains how Xiaohongshu / RedNote is currently integrated into TennisLevel across:

- connector normalization
- QA candidate preparation
- manual review and promotion
- cover stabilization
- outbound mobile behavior
- `/library` mobile note-feed presentation

It is not a product brief. It is an engineering reference for the current repo state and the safest expansion path.

## Current repo shape

The current RedNote stack is split into five layers:

1. Connector and canonical URL layer
2. QA-only candidate and review layer
3. Runtime promoted content layer
4. Cover and outbound-link stability layer
5. `/library` mobile presentation layer

The important design rule is that these layers stay separate.

Do not use runtime seed content as a substitute for QA artifacts.
Do not use QA artifacts as direct retrieval input.

## 1. Connector and canonical URL model

### Current connector location

- `src/lib/platform-connectors/xiaohongshu.ts`

### Supported direct-note surfaces

The system currently treats only these note surfaces as canonicalizable direct-source URLs:

- `https://www.xiaohongshu.com/explore/<postId>`
- `https://www.xiaohongshu.com/discovery/item/<postId>`

Both normalize to:

- `https://www.xiaohongshu.com/explore/<postId>`

### Unsupported or conservative surfaces

These should not be silently promoted into `direct_source`:

- profile pages such as `user/profile/...`
- search pages such as `search_result/...`
- other share or browse surfaces that do not yield a stable note ID

Current behavior:

- direct note surfaces -> `direct_source`
- explicit search surfaces -> `search_link`
- everything else unsupported -> `unknown`

That conservatism is deliberate. The connector should only prove that a URL is a stable note URL, not that the content is already approved for the catalog.

## 2. Candidate preparation workflow

### Principle

Candidate prep starts from creator identity, not from random note links.

This matters because Xiaohongshu has a lot of reposts, stolen content, and ambiguous search results. If the workflow starts from search links alone, it becomes too easy to attach the wrong note to the right creator name.

### Current target creators

The initial seed workflow was limited to:

- `盖奥`
- `灵熙🎾`
- `冠军教练 - 莫拉托格鲁`

### Current QA artifact locations

- `ops/quality/xiaohongshu-seed-candidates.json`
- `ops/quality/xiaohongshu-seed-reviewed.json`

### Candidate methodology

The current candidate-prep slice uses:

- profile-confirmed creator identity
- search-result entry links as discovery inputs
- resolved canonical note URLs when extractable
- thumbnail evidence
- preliminary problem-tag hypotheses

The key rule is:

- a note candidate is not accepted just because its search result looked plausible
- the title used for the candidate must exactly match the title already confirmed on the creator’s own profile page

In code, this is enforced in:

- `scripts/lib/xiaohongshuSeedCandidates.ts`

The current methodology label is:

- `profile_title_confirmed_search_result_cards`

### Why preserve both raw and canonical URLs

Each candidate should preserve both:

- `rawUrl`
- `canonicalUrl`

Reason:

- `rawUrl` preserves the real human-review handoff entry point
- `canonicalUrl` preserves the normalized direct note surface the connector understands

The raw entry is often a `search_result/<id>?xsec_token=...` URL.
The canonical URL is the stable `explore/<postId>` note URL.

Keep both. They solve different problems.

## 3. Manual review and promotion

### QA-first rule

The current RedNote flow is:

1. prepare candidate evidence
2. record manual review
3. only then create or update runtime catalog records

Do not skip step 2.

### Current promoted runtime shape

The current repo state includes:

- `15` Xiaohongshu content items in `src/data/contents.ts`
- `3` hidden Xiaohongshu creators in `src/data/creators.ts`
- `15` verified overlay entries in `src/data/contentQualityReviews.ts`

This split is intentional:

- content records stay platform-specific
- creators stay platform-specific
- review status lives in the review overlay

### Cross-platform duplication rule

When a Xiaohongshu clip appears semantically equivalent to a Bilibili clip:

- keep them as separate content records
- align tags when justified
- keep URLs, metadata, thumbnails, and QA evidence platform-specific

Do not collapse them into one “unified” content item unless the repo later grows an explicit cross-platform grouping model.

## 4. Cover handling

### Why localize covers

Xiaohongshu hotlinked covers are not reliable as runtime thumbnails.

The main failure modes observed were:

- `xhscdn` or related cover URLs returning `403`
- referer-sensitive behavior
- expired or unstable search-result assets

Because of that, runtime covers were localized to:

- `public/thumbnails/xiaohongshu/`

Current localized cover count:

- `15`

### Runtime rule

For promoted RedNote content:

- do not depend on live Xiaohongshu cover hotlinks at runtime
- use localized cover assets whenever the content has already been manually reviewed and promoted

### Fastest practical workflow

For a small seed set, the fastest reliable path is:

1. identify reviewed note candidates
2. capture or download stable cover images once
3. store them under `public/thumbnails/xiaohongshu/`
4. reference the local asset from `contents.ts`

This is more operationally reliable than trying to preserve a “pure” external thumbnail URL.

## 5. Outbound note opening behavior

### Current implementation

- `src/lib/content/outbound.ts`

### Current rule

On mobile user agents, Xiaohongshu content prefers:

- `xhsdiscover://video_feed/<postId>`

with the canonical note URL kept as the web fallback.

That is more useful than opening the user into an intermediate browser-only page that then asks them to open the app again.

### Practical note

The canonical note URL may still be important for:

- QA
- manual review
- desktop verification
- fallback behavior

So do not replace the web canonical URL in the content record. The deep link is an outbound preference, not the content source of truth.

## 6. `/library` mobile presentation

### Current trigger rule

The Xiaohongshu-style mobile masonry layout is intentionally narrow.

It only activates when:

1. the page is `/library`
2. the effective viewport is mobile-sized or the route is loaded in `mobilePreview=1`
3. the selected platform is explicitly `Xiaohongshu`

In all other cases, `/library` stays on the normal layout.

### Current implementation pieces

- `src/app/library/page.tsx`
- `src/lib/library/layout.ts`
- `src/components/library/ContentCard.tsx`
- `src/lib/content/thumbnailFraming.ts`
- `src/app/mobile-preview/page.tsx`

### Why this is conditional

The current goal is not to turn the whole library into a generic two-column feed.

The goal is:

- when browsing RedNote-heavy content on mobile
- make the page feel closer to a note feed
- without disturbing Bilibili / YouTube browsing or desktop behavior

### Note-card specifics

The current RedNote note card differs from the default card in a few ways:

- `3:4` portrait media framing
- two-column masonry only in the mobile RedNote case
- compressed typography and metadata hierarchy
- bookmark action treated as a light note-level control

The important engineering choice is that the note-card state is still built on the same `ContentCard` component, not a separate duplicate card implementation.

## 7. Mobile preview workspace

### Current route

- `/mobile-preview`

### Purpose

This route exists so mobile layout changes can be inspected locally on `localhost` without waiting for a Vercel deploy.

It should be treated as:

- a local development workspace
- a mobile shell that embeds real routes
- not a second product UI

### Why it matters for RedNote work

Almost all RedNote mobile relayout tuning was done through this route:

- preview shell width
- forced mobile layout via `mobilePreview=1`
- Xiaohongshu masonry experiments
- note-card spacing and framing adjustments

Without this route, each iteration would have required a push + deploy cycle.

## 8. Scaling to dozens of creators and 1000+ videos

If the repo later expands to dozens of Xiaohongshu creators and 1000+ platform-specific items, do not scale by hand-editing the current seed workflow.

That would become brittle very quickly.

### Recommended scaling model

Split the system into five explicit datasets:

1. Creator registry
2. Candidate acquisition data
3. Reviewed QA data
4. Promotion-ready content specs
5. Runtime promoted content

### 8.1 Creator registry

Add a structured creator registry outside `contents.ts` that stores:

- canonical creator name
- profile URL
- short share URL if relevant
- platform
- trusted aliases
- whether Bilibili overlap is expected

This registry should become the single seed source for future candidate acquisition.

### 8.2 Candidate acquisition data

Keep raw discovered notes outside runtime data.

This layer should store:

- raw note entry URLs
- canonical note URLs
- profile evidence
- scraped visible metadata
- cover evidence
- preliminary tags

This is the right layer for high-volume collection.
It is not the right layer for runtime retrieval.

### 8.3 Reviewed QA data

Keep a separate reviewed artifact that records:

- accepted / rejected / skip
- manual reviewer
- confirmation date
- notes on cross-platform overlap
- whether the candidate is ready for promotion

This lets the project expand collection without polluting the runtime catalog.

### 8.4 Promotion-ready content specs

When scale increases, do not directly hand-edit `contents.ts` for every promotion.

Instead, generate or assemble a promotion-ready spec that includes:

- final content ID
- creator ID
- canonical note URL
- localized cover path
- stable tags
- language and subtitle metadata
- quality review seed

Then promote that spec into runtime data in controlled batches.

### 8.5 Runtime content split

If RedNote volume grows into the hundreds or thousands, it should probably stop living as ad-hoc inserts in the main curated file.

A cleaner future shape would be:

- `src/data/contents.rednote.ts`
- `src/data/creators.rednote.ts`

or an equivalent generated-data split that is merged at build time.

The goal is not “more files.”
The goal is to avoid turning `contents.ts` into an unreviewable dump.

## 9. What to keep manual, what to automate

### Keep manual

- creator identity confirmation
- ambiguous cross-platform equivalence
- final problem-tag approval for promoted items
- final decision to promote into runtime

### Automate

- URL normalization
- candidate schema validation
- batch cover localization
- batch artifact generation
- reviewed-to-promotion transforms
- coverage reporting and creator-diversity checks

If scale increases, the biggest time saver is not “scrape harder.”
It is “push more of the repetitive QA plumbing into deterministic scripts.”

## 10. Important cautions

### Do not treat profile URLs as content URLs

`user/profile/...` proves creator identity.
It does not prove a note record.

### Do not treat search-result links as stable runtime content

They are useful for discovery and review handoff, but should not become the runtime URL source of truth.

### Do not skip local cover stabilization

If a promoted Xiaohongshu item still depends on a fragile external cover URL, it is not operationally finished.

### Do not collapse platforms too early

Shared semantics does not mean shared records.

### Do not let high-volume candidate collection bypass review

As volume rises, the need for a clean QA boundary increases, not decreases.

## Recommended next expansion pattern

For the next Xiaohongshu growth phase, the safest order is:

1. add creators to a registry
2. collect candidate notes into QA-only artifacts
3. run manual review in batches
4. localize covers for the accepted set
5. promote a bounded batch into runtime content
6. re-run coverage and diversity reporting

That preserves catalog quality while still making RedNote expansion operationally scalable.
