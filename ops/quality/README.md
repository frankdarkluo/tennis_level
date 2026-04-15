# Quality Reports

Generated QA outputs live here.

- `content-manual-review.template.json`
- `content-browser-boundary-review.latest.json`
- `content-browser-boundary-review.latest.md`
- `problem-tag-remediation.latest.json`
- `problem-tag-remediation.latest.md`
- `content-manual-review-candidates.latest.json`
- `recommendation-quality.latest.json`
- `recommendation-quality.latest.md`
- `problem-tag-coverage.latest.json`
- `problem-tag-coverage.latest.md`
- `content-remote-check.latest.json`
- `content-remote-check.latest.csv`
- `content-quality-review-import.latest.json`
- `xiaohongshu-creator-program.json`
- `xiaohongshu-seed-review-input.json`
- `xiaohongshu-seed-candidates.json`
- `xiaohongshu-seed-reviewed.json`
- `xiaohongshu-seed-promotion.latest.json`

Interpretation rules:

- `recommendation-quality` is the output-layer metric and will usually read very high because current retrieval already defaults to `direct_source`.
- `problem-tag-coverage` is the companion inventory-layer metric and should be reviewed first when deciding where search-link debt or weak-tag backlog is still risky.
- `content-remote-check` is the QA-only remote verification artifact for direct-source links and thumbnails. Review it before importing anything into the overlay.
- Current reports are based on catalog/connector `direct_source` inference. Remote verification is intentionally a later slice.
- `xiaohongshu-creator-program` is the approved creator scope and target registry. It can include pending creators that are not collectible yet.
- `xiaohongshu-seed-review-input` is the QA-only manual-review input file for the reviewed subset.
- `xiaohongshu-seed-candidates` is a QA-only handoff file for Xiaohongshu candidate preparation. It is not part of retrieval and must not be promoted into `contents.ts` without a later reviewed slice.
- `xiaohongshu-seed-reviewed` records human-approved Xiaohongshu candidate decisions after manual review. It is still QA-only and does not bypass the later catalog-promotion step.
- `xiaohongshu-seed-promotion.latest` is the promotion-preview artifact generated from reviewed seeds. It is the batch handoff for any future runtime promotion work.

Manual review workflow:

1. Generate a fresh remote verification artifact.
   `npx ts-node --project tsconfig.scripts.json scripts/verify-content-remote.ts`
2. Generate a ranked remediation queue over all active diagnostic tags.
   `npx ts-node --project tsconfig.scripts.json scripts/report-problem-tag-remediation.ts`
3. If you need review-ready candidates for weak tags, export them from existing catalog direct-source items.
   `npx ts-node --project tsconfig.scripts.json scripts/export-problem-tag-review-candidates.ts`
4. If you need to distinguish `blocked` vs `network_error`, generate a browser review queue.
   `npx ts-node --project tsconfig.scripts.json scripts/prepare-browser-boundary-review.ts`
5. Open the queued canonical URLs in a normal browser and record the result into a local review file such as `ops/quality/content-manual-review.input.json`, using `content-manual-review.template.json` as the schema reference or the exported candidate file as a starting point.
6. Validate and preview the import.
   `npx ts-node --project tsconfig.scripts.json scripts/import-content-quality-reviews.ts --input ops/quality/content-manual-review.input.json`
7. Apply approved overlay entries only when ready.
   `npx ts-node --project tsconfig.scripts.json scripts/import-content-quality-reviews.ts --input ops/quality/content-manual-review.input.json --apply`
8. Re-run `npm run validate:data` after updating `src/data/contentQualityReviews.ts`.
9. Re-run remediation reporting to measure whether weak-tag coverage improved.
   `npx ts-node --project tsconfig.scripts.json scripts/report-problem-tag-remediation.ts`

Xiaohongshu creator-program / seed workflow:

1. Review or update the creator-program registry.
   `ops/quality/xiaohongshu-creator-program.json`
2. Regenerate the QA-only Xiaohongshu candidate handoff.
   `npm run prepare:xiaohongshu-seed-candidates`
3. Open the saved `rawUrl`, `canonicalUrl`, and `creatorProfileUrl` for the candidates you want to review manually.
4. Record the reviewed subset in:
   `ops/quality/xiaohongshu-seed-review-input.json`
5. Generate the reviewed artifact from that review input.
   `npm run prepare:xiaohongshu-seed-reviewed`
6. Generate the promotion preview for the reviewed subset.
   `npm run prepare:xiaohongshu-seed-promotion`
7. Only after manual confirmation should a later slice propose any `contents.ts` promotion.

Stable validation command:

- `npm run validate:xiaohongshu-qa`

Current Xiaohongshu review boundary:

- The current `contentQualityReviews` overlay only accepts existing catalog `contentId` values.
- Reviewed Xiaohongshu seed candidates do not have catalog `contentId` values yet, because this slice intentionally keeps them out of `contents.ts`.
- Because of that, reviewed Xiaohongshu seed decisions are currently recorded in `xiaohongshu-seed-reviewed.json` first.
- A later promotion slice can only import them into `contentQualityReviews` after creating platform-specific catalog records.
- The current bootstrap reviewed subset references existing promoted Xiaohongshu runtime items only to preserve review history; it does not create any new runtime rows in this slice.

Xiaohongshu candidate rules:

- Creator-program target scope is `350` teaching-only candidates total:
  - `盖奥网球`: `100`
  - `灵熙`: `100`
  - `冠军教练-莫拉特格鲁`: `100`
  - `奔跑的大白羊`: `50`
- Candidate artifact save scope is still capped at `5` high-confidence note candidates per creator for the current curated QA handoff; `5` is a save ceiling, not a program quota.
- Candidates are QA-only and must stay outside retrieval, ranking, and UI behavior.
- Saved candidates must keep:
  - `rawUrl`
  - `canonicalUrl` when obtainable
  - `creatorProfileUrl`
- Each saved candidate must also keep:
  - `creatorProgramId`
  - `teachingType`
  - language / subtitle hints
  - optional duplicate-cluster hints
- Only these teaching-only Xiaohongshu candidate types are allowed:
  - `technique_explanation`
  - `drill`
  - `footwork`
  - `tactic`
  - `serve`
  - `return`
  - `doubles`
  - `warmup`
  - `mental_execution`
- Excluded surfaces remain:
  - lifestyle content
  - match clips without teaching value
  - pure inspiration content
  - unclear creator ownership
  - ambiguous note sources
- The current candidate-prep slice is profile-title-driven:
  - the note title must exactly match a title already confirmed on the creator's Xiaohongshu profile page
  - this is especially important for `灵熙🎾`, where reposted or stolen clips are common
- Program entries with `pending_profile_verification` are valid scope entries but cannot accept candidate rows until a profile URL is verified.

Coverage-remediation rules:

- Base scope is all active diagnostic tags.
- Healthy coverage requires:
  - at least `3` verified direct-source items
  - and at least `2` distinct verified creators
- `--top-n` and `--tags=...` only filter the reporting/export view; they do not redefine the underlying analysis scope.
- Candidate export only uses existing catalog items that are already classified as `direct_source`.

Manual review input rules:

- `reviewDecision` must be one of `verified`, `needs_review`, `suspect`, `rejected`, `skip`.
- `verifiedBy` and `lastVerifiedAt` are required for every row.
- `notes` are required for `needs_review`, `suspect`, and `rejected`.
- `contentId` must already exist in the catalog.
- `manualQcScore` must stay between `-2` and `2`.
- `metadataSimilarityScore` must stay between `0` and `1`.
- Optional `browserEvidence` can capture the human browser check with `browserStatus`, `checkedBy`, `checkedAt`, and `notes`.
