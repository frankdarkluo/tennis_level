import type {
  RemoteFailureClass,
  RemoteLinkStatus,
  RemoteVerificationRecord
} from "./remoteVerification";

export type BrowserBoundaryReviewCandidate = {
  contentId: string;
  platform: string;
  canonicalUrl: string;
  linkStatus: RemoteLinkStatus;
  failureClass: RemoteFailureClass | null;
  decisionReason: string;
  retrySuggested: boolean;
  reviewReason: string;
  browserCheckPrompt: string;
  suggestedManualReviewDraft: {
    contentId: string;
    reviewDecision: "skip";
    verifiedBy: string;
    lastVerifiedAt: string;
    notes: string;
    evidence: {
      linkStatus: RemoteLinkStatus;
      failureClass: RemoteFailureClass | null;
      decisionReason: string;
      finalUrl: string | null;
    };
    browserEvidence: {
      browserStatus: "unknown";
      checkedBy: string;
      checkedAt: string;
      finalUrl: string;
      notes: string;
    };
  };
};

function sortByPriority(left: BrowserBoundaryReviewCandidate, right: BrowserBoundaryReviewCandidate) {
  if (left.linkStatus !== right.linkStatus) {
    return left.linkStatus === "blocked" ? -1 : 1;
  }

  return left.contentId.localeCompare(right.contentId);
}

export function buildBrowserBoundaryReviewQueue(records: RemoteVerificationRecord[]): BrowserBoundaryReviewCandidate[] {
  return records
    .filter((record) => record.linkStatus === "network_error" || record.linkStatus === "blocked")
    .map((record): BrowserBoundaryReviewCandidate => ({
      contentId: record.contentId,
      platform: record.platform,
      canonicalUrl: record.canonicalUrl,
      linkStatus: record.linkStatus,
      failureClass: record.failureClass,
      decisionReason: record.decisionReason,
      retrySuggested: record.retrySuggested,
      reviewReason: record.linkStatus === "network_error"
        ? "Determine whether the URL opens in a normal browser despite runtime fetch failure."
        : "Determine whether the URL is truly blocked in a normal browser or only blocked to script fetches.",
      browserCheckPrompt: "Open the canonical URL in a normal browser and record whether it loads, redirects to a login wall, or shows a block/challenge surface.",
      suggestedManualReviewDraft: {
        contentId: record.contentId,
        reviewDecision: "skip",
        verifiedBy: "",
        lastVerifiedAt: "",
        notes: "Fill after browser check.",
        evidence: {
          linkStatus: record.linkStatus,
          failureClass: record.failureClass,
          decisionReason: record.decisionReason,
          finalUrl: record.finalUrl
        },
        browserEvidence: {
          browserStatus: "unknown",
          checkedBy: "",
          checkedAt: "",
          finalUrl: record.finalUrl ?? record.canonicalUrl,
          notes: ""
        }
      }
    }))
    .sort(sortByPriority);
}

export function renderBrowserBoundaryReviewMarkdown(candidates: BrowserBoundaryReviewCandidate[]): string {
  const lines = [
    "# Browser Boundary Review Queue",
    "",
    "Use this queue to manually verify whether `blocked` and `network_error` results reflect true browser behavior or only script/runtime limitations.",
    "",
    "| contentId | platform | linkStatus | failureClass | decisionReason | retrySuggested | canonicalUrl |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    ...candidates.map((candidate) =>
      `| ${candidate.contentId} | ${candidate.platform} | ${candidate.linkStatus} | ${candidate.failureClass ?? "-"} | ${candidate.decisionReason} | ${candidate.retrySuggested} | ${candidate.canonicalUrl} |`
    )
  ];

  return `${lines.join("\n")}\n`;
}
