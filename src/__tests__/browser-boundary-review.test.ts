import { describe, expect, it } from "vitest";
import {
  buildBrowserBoundaryReviewQueue,
  renderBrowserBoundaryReviewMarkdown
} from "../../scripts/lib/browserReviewQueue";
import type { RemoteVerificationRecord } from "../../scripts/lib/remoteVerification";

function createRecord(overrides: Partial<RemoteVerificationRecord>): RemoteVerificationRecord {
  return {
    contentId: overrides.contentId ?? "content_1",
    platform: overrides.platform ?? "YouTube",
    canonicalUrl: overrides.canonicalUrl ?? "https://www.youtube.com/watch?v=content_1",
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    checkedAt: overrides.checkedAt ?? "2026-04-13T00:00:00.000Z",
    linkStatus: overrides.linkStatus ?? "network_error",
    httpStatus: overrides.httpStatus ?? null,
    finalUrl: overrides.finalUrl ?? null,
    verificationSurface: overrides.verificationSurface ?? "canonical_url",
    failureClass: overrides.failureClass ?? "network_runtime_failure",
    decisionReason: overrides.decisionReason ?? "network_runtime_error",
    retrySuggested: overrides.retrySuggested ?? true,
    thumbnailStatus: overrides.thumbnailStatus ?? "reachable",
    thumbnailDecisionReason: overrides.thumbnailDecisionReason ?? "local_asset_present",
    errorReason: overrides.errorReason ?? "fetch failed",
    needsManualReview: overrides.needsManualReview ?? true
  };
}

describe("browser boundary review queue", () => {
  it("keeps only blocked and network_error rows for browser boundary checks", () => {
    const queue = buildBrowserBoundaryReviewQueue([
      createRecord({ contentId: "blocked_1", linkStatus: "blocked", failureClass: "platform_blocking", decisionReason: "http_403", retrySuggested: false }),
      createRecord({ contentId: "network_1", linkStatus: "network_error", failureClass: "network_runtime_failure" }),
      createRecord({ contentId: "dead_1", linkStatus: "dead", failureClass: null, decisionReason: "http_404", retrySuggested: false })
    ]);

    expect(queue.map((item) => item.contentId)).toEqual(["blocked_1", "network_1"]);
    expect(queue[0]?.browserCheckPrompt).toContain("normal browser");
    expect(queue[1]?.suggestedManualReviewDraft.browserEvidence.browserStatus).toBe("unknown");
  });

  it("renders a compact markdown queue", () => {
    const markdown = renderBrowserBoundaryReviewMarkdown([
      createRecord({ contentId: "network_1", linkStatus: "network_error", failureClass: "network_runtime_failure" })
    ].map((record) => buildBrowserBoundaryReviewQueue([record])[0]!));

    expect(markdown).toContain("Browser Boundary Review Queue");
    expect(markdown).toContain("network_1");
    expect(markdown).toContain("network_error");
  });
});
