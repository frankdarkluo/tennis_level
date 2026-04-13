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
- `xiaohongshu-seed-candidates.json`
- `xiaohongshu-seed-reviewed.json`

Interpretation rules:

- `recommendation-quality` is the output-layer metric and will usually read very high because current retrieval already defaults to `direct_source`.
- `problem-tag-coverage` is the companion inventory-layer metric and should be reviewed first when deciding where search-link debt or weak-tag backlog is still risky.
- `content-remote-check` is the QA-only remote verification artifact for direct-source links and thumbnails. Review it before importing anything into the overlay.
- Current reports are based on catalog/connector `direct_source` inference. Remote verification is intentionally a later slice.
- `xiaohongshu-seed-candidates` is a QA-only handoff file for small Xiaohongshu seed preparation. It is not part of retrieval and must not be promoted into `contents.ts` without a later reviewed slice.
- `xiaohongshu-seed-reviewed` records human-approved Xiaohongshu candidate decisions after manual review. It is still QA-only and does not bypass the later catalog-promotion step.

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

Xiaohongshu seed-candidate workflow:

1. Regenerate the QA-only Xiaohongshu candidate handoff.
   `npx ts-node --project tsconfig.scripts.json scripts/prepare-xiaohongshu-seed-candidates.ts`
2. Open the saved `rawUrl`, `canonicalUrl`, and `creatorProfileUrl` for the candidates you want to review manually.
3. Copy approved candidates into a local manual-review input file, keeping Xiaohongshu as a separate platform-specific record.
4. Only after manual confirmation should a later slice propose any `contents.ts` promotion.

Current Xiaohongshu review boundary:

- The current `contentQualityReviews` overlay only accepts existing catalog `contentId` values.
- Reviewed Xiaohongshu seed candidates do not have catalog `contentId` values yet, because this slice intentionally keeps them out of `contents.ts`.
- Because of that, reviewed Xiaohongshu seed decisions are currently recorded in `xiaohongshu-seed-reviewed.json` first.
- A later promotion slice can only import them into `contentQualityReviews` after creating platform-specific catalog records.

Xiaohongshu candidate rules:

- Candidate scope is capped at `5` high-confidence note candidates per approved creator; `5` is a ceiling, not a quota.
- Candidates are QA-only and must stay outside retrieval, ranking, and UI behavior.
- Saved candidates must keep:
  - `rawUrl`
  - `canonicalUrl` when obtainable
  - `creatorProfileUrl`
- The current candidate-prep slice is profile-title-driven:
  - the note title must exactly match a title already confirmed on the creator's Xiaohongshu profile page
  - this is especially important for `灵熙🎾`, where reposted or stolen clips are common

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
