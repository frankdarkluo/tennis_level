# Quality Reports

Generated QA outputs live here.

- `recommendation-quality.latest.json`
- `recommendation-quality.latest.md`
- `problem-tag-coverage.latest.json`
- `problem-tag-coverage.latest.md`
- `content-remote-check.latest.json`
- `content-remote-check.latest.csv`

Interpretation rules:

- `recommendation-quality` is the output-layer metric and will usually read very high because current retrieval already defaults to `direct_source`.
- `problem-tag-coverage` is the companion inventory-layer metric and should be reviewed first when deciding where search-link debt or weak-tag backlog is still risky.
- `content-remote-check` is the QA-only remote verification artifact for direct-source links and thumbnails. Review it before importing anything into the overlay.
- Current reports are based on catalog/connector `direct_source` inference. Remote verification is intentionally a later slice.
