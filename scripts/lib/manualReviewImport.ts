import type {
  CatalogQualityReview,
  CatalogReviewStatus,
  CatalogThumbnailStatus
} from "../../src/lib/content-catalog/schema";

export type ManualReviewDecision = CatalogReviewStatus | "skip";

export type ManualReviewInputRecord = {
  contentId: string;
  reviewDecision: ManualReviewDecision;
  verifiedBy: string;
  lastVerifiedAt: string;
  notes?: string;
  thumbnailStatus?: CatalogThumbnailStatus;
  httpStatus?: number;
  remoteTitle?: string;
  remoteDescriptionExcerpt?: string;
  metadataSimilarityScore?: number;
  manualQcScore?: number;
  duplicateClusterId?: string;
  evidence?: {
    linkStatus?: string;
    failureClass?: string;
    decisionReason?: string;
    finalUrl?: string;
  };
  browserEvidence?: {
    browserStatus: "reachable" | "blocked" | "login_wall" | "unknown";
    checkedBy: string;
    checkedAt: string;
    finalUrl?: string;
    notes: string;
  };
};

export type ManualReviewInputFile = {
  version: 1;
  generatedFromReport?: string;
  records: ManualReviewInputRecord[];
};

export type ManualReviewImportArtifacts = {
  parsedInput: ManualReviewInputFile;
  overlayEntries: CatalogQualityReview[];
  moduleSource: string;
  summary: {
    totalRecords: number;
    importedCount: number;
    skippedCount: number;
    invalidCount: number;
  };
};

type ImportableManualReviewRecord = ManualReviewInputRecord & {
  reviewDecision: CatalogReviewStatus;
};

const REVIEW_DECISIONS: ManualReviewDecision[] = [
  "verified",
  "needs_review",
  "suspect",
  "rejected",
  "skip"
];
const THUMBNAIL_STATUSES: CatalogThumbnailStatus[] = [
  "ok",
  "fallback",
  "missing",
  "broken",
  "unknown"
];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function renderValue(value: string | number): string {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}

export function parseManualReviewInput(
  rawInput: string,
  options: { allowedContentIds: Set<string> }
): ManualReviewInputFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_json";
    throw new Error(`Manual review input is not valid JSON: ${message}`);
  }

  const issues: string[] = [];
  if (!isObject(parsed)) {
    throw new Error("Manual review input must be a JSON object.");
  }

  if (parsed.version !== 1) {
    issues.push("version must be 1");
  }

  const generatedFromReport = normalizeString(parsed.generatedFromReport);
  const rawRecords = parsed.records;
  if (!Array.isArray(rawRecords)) {
    issues.push("records must be an array");
  }

  const seenContentIds = new Set<string>();
  const normalizedRecords: ManualReviewInputRecord[] = [];

  if (Array.isArray(rawRecords)) {
    rawRecords.forEach((rawRecord, index) => {
      const prefix = `records[${index}]`;
      if (!isObject(rawRecord)) {
        issues.push(`${prefix} must be an object`);
        return;
      }

      const contentId = normalizeString(rawRecord.contentId);
      const reviewDecision = normalizeString(rawRecord.reviewDecision) as ManualReviewDecision;
      const verifiedBy = normalizeString(rawRecord.verifiedBy);
      const lastVerifiedAt = normalizeString(rawRecord.lastVerifiedAt);
      const notes = normalizeString(rawRecord.notes);
      const thumbnailStatus = normalizeString(rawRecord.thumbnailStatus) as CatalogThumbnailStatus;
      const duplicateClusterId = normalizeString(rawRecord.duplicateClusterId);
      const remoteTitle = normalizeString(rawRecord.remoteTitle);
      const remoteDescriptionExcerpt = normalizeString(rawRecord.remoteDescriptionExcerpt);

      if (!contentId) {
        issues.push(`${prefix}.contentId is required`);
      } else {
        if (!options.allowedContentIds.has(contentId)) {
          issues.push(`${prefix}.contentId "${contentId}" does not exist in the content catalog`);
        }
        if (seenContentIds.has(contentId)) {
          issues.push(`${prefix}.contentId "${contentId}" is duplicated`);
        }
        seenContentIds.add(contentId);
      }

      if (!REVIEW_DECISIONS.includes(reviewDecision)) {
        issues.push(`${prefix}.reviewDecision must be one of ${REVIEW_DECISIONS.join(", ")}`);
      }

      if (!verifiedBy) {
        issues.push(`${prefix}.verifiedBy is required`);
      }

      if (!lastVerifiedAt || Number.isNaN(Date.parse(lastVerifiedAt))) {
        issues.push(`${prefix}.lastVerifiedAt must be a valid timestamp`);
      }

      if (
        (reviewDecision === "needs_review" || reviewDecision === "suspect" || reviewDecision === "rejected")
        && !notes
      ) {
        issues.push(`${prefix}.notes is required when reviewDecision is ${reviewDecision}`);
      }

      if (thumbnailStatus && !THUMBNAIL_STATUSES.includes(thumbnailStatus)) {
        issues.push(`${prefix}.thumbnailStatus must be one of ${THUMBNAIL_STATUSES.join(", ")}`);
      }

      if (rawRecord.httpStatus !== undefined) {
        const httpStatus = Number(rawRecord.httpStatus);
        if (!Number.isInteger(httpStatus) || httpStatus < 100 || httpStatus > 599) {
          issues.push(`${prefix}.httpStatus must be an integer between 100 and 599`);
        }
      }

      if (rawRecord.metadataSimilarityScore !== undefined) {
        const similarity = Number(rawRecord.metadataSimilarityScore);
        if (!Number.isFinite(similarity) || similarity < 0 || similarity > 1) {
          issues.push(`${prefix}.metadataSimilarityScore must be between 0 and 1`);
        }
      }

      if (rawRecord.manualQcScore !== undefined) {
        const manualQcScore = Number(rawRecord.manualQcScore);
        if (!Number.isFinite(manualQcScore) || manualQcScore < -2 || manualQcScore > 2) {
          issues.push(`${prefix}.manualQcScore must be between -2 and 2`);
        }
      }

      normalizedRecords.push({
        contentId,
        reviewDecision,
        verifiedBy,
        lastVerifiedAt,
        notes: notes || undefined,
        thumbnailStatus: thumbnailStatus || undefined,
        httpStatus: rawRecord.httpStatus === undefined ? undefined : Number(rawRecord.httpStatus),
        remoteTitle: remoteTitle || undefined,
        remoteDescriptionExcerpt: remoteDescriptionExcerpt || undefined,
        metadataSimilarityScore: rawRecord.metadataSimilarityScore === undefined ? undefined : Number(rawRecord.metadataSimilarityScore),
        manualQcScore: rawRecord.manualQcScore === undefined ? undefined : Number(rawRecord.manualQcScore),
        duplicateClusterId: duplicateClusterId || undefined,
        evidence: isObject(rawRecord.evidence)
          ? {
              linkStatus: normalizeString(rawRecord.evidence.linkStatus) || undefined,
              failureClass: normalizeString(rawRecord.evidence.failureClass) || undefined,
              decisionReason: normalizeString(rawRecord.evidence.decisionReason) || undefined,
              finalUrl: normalizeString(rawRecord.evidence.finalUrl) || undefined
            }
          : undefined,
        browserEvidence: isObject(rawRecord.browserEvidence)
          ? {
              browserStatus: normalizeString(rawRecord.browserEvidence.browserStatus) as "reachable" | "blocked" | "login_wall" | "unknown",
              checkedBy: normalizeString(rawRecord.browserEvidence.checkedBy),
              checkedAt: normalizeString(rawRecord.browserEvidence.checkedAt),
              finalUrl: normalizeString(rawRecord.browserEvidence.finalUrl) || undefined,
              notes: normalizeString(rawRecord.browserEvidence.notes)
            }
          : undefined
      });

      if (isObject(rawRecord.browserEvidence)) {
        const browserStatus = normalizeString(rawRecord.browserEvidence.browserStatus);
        const checkedBy = normalizeString(rawRecord.browserEvidence.checkedBy);
        const checkedAt = normalizeString(rawRecord.browserEvidence.checkedAt);
        const browserNotes = normalizeString(rawRecord.browserEvidence.notes);

        if (!["reachable", "blocked", "login_wall", "unknown"].includes(browserStatus)) {
          issues.push(`${prefix}.browserEvidence.browserStatus must be one of reachable, blocked, login_wall, unknown`);
        }

        if (!checkedBy) {
          issues.push(`${prefix}.browserEvidence.checkedBy is required`);
        }

        if (!checkedAt || Number.isNaN(Date.parse(checkedAt))) {
          issues.push(`${prefix}.browserEvidence.checkedAt must be a valid timestamp`);
        }

        if (!browserNotes) {
          issues.push(`${prefix}.browserEvidence.notes is required`);
        }
      }
    });
  }

  if (issues.length > 0) {
    throw new Error(`Manual review input validation failed:\n- ${issues.join("\n- ")}`);
  }

  return {
    version: 1,
    generatedFromReport: generatedFromReport || undefined,
    records: normalizedRecords
  };
}

export function renderContentQualityReviewsModule(reviews: CatalogQualityReview[]): string {
  const sortedReviews = [...reviews].sort((left, right) => left.contentId.localeCompare(right.contentId));
  const lines = [
    'import type { CatalogQualityReview } from "@/lib/content-catalog/schema";',
    "",
    "export const contentQualityReviews: CatalogQualityReview[] = ["
  ];

  for (const review of sortedReviews) {
    lines.push("  {");
    lines.push(`    contentId: ${renderValue(review.contentId)},`);
    lines.push(`    reviewStatus: ${renderValue(review.reviewStatus)},`);
    if (review.thumbnailStatus) {
      lines.push(`    thumbnailStatus: ${renderValue(review.thumbnailStatus)},`);
    }
    if (review.lastVerifiedAt) {
      lines.push(`    lastVerifiedAt: ${renderValue(review.lastVerifiedAt)},`);
    }
    if (typeof review.httpStatus === "number") {
      lines.push(`    httpStatus: ${renderValue(review.httpStatus)},`);
    }
    if (review.remoteTitle) {
      lines.push(`    remoteTitle: ${renderValue(review.remoteTitle)},`);
    }
    if (review.remoteDescriptionExcerpt) {
      lines.push(`    remoteDescriptionExcerpt: ${renderValue(review.remoteDescriptionExcerpt)},`);
    }
    if (typeof review.metadataSimilarityScore === "number") {
      lines.push(`    metadataSimilarityScore: ${renderValue(review.metadataSimilarityScore)},`);
    }
    if (typeof review.manualQcScore === "number") {
      lines.push(`    manualQcScore: ${renderValue(review.manualQcScore)},`);
    }
    if (review.duplicateClusterId) {
      lines.push(`    duplicateClusterId: ${renderValue(review.duplicateClusterId)},`);
    }
    if (review.verifiedBy) {
      lines.push(`    verifiedBy: ${renderValue(review.verifiedBy)},`);
    }
    lines.push("  },");
  }

  lines.push("];", "");
  return `${lines.join("\n")}\n`;
}

export function buildManualReviewImportArtifacts(input: {
  rawInput: string;
  allowedContentIds: Set<string>;
}): ManualReviewImportArtifacts {
  const parsedInput = parseManualReviewInput(input.rawInput, {
    allowedContentIds: input.allowedContentIds
  });
  const overlayEntries = parsedInput.records
    .filter((record): record is ImportableManualReviewRecord => record.reviewDecision !== "skip")
    .map((record): CatalogQualityReview => ({
      contentId: record.contentId,
      reviewStatus: record.reviewDecision,
      thumbnailStatus: record.thumbnailStatus,
      lastVerifiedAt: record.lastVerifiedAt,
      httpStatus: record.httpStatus,
      remoteTitle: record.remoteTitle,
      remoteDescriptionExcerpt: record.remoteDescriptionExcerpt,
      metadataSimilarityScore: record.metadataSimilarityScore,
      manualQcScore: record.manualQcScore,
      duplicateClusterId: record.duplicateClusterId,
      verifiedBy: record.verifiedBy
    }));

  return {
    parsedInput,
    overlayEntries,
    moduleSource: renderContentQualityReviewsModule(overlayEntries),
    summary: {
      totalRecords: parsedInput.records.length,
      importedCount: overlayEntries.length,
      skippedCount: parsedInput.records.length - overlayEntries.length,
      invalidCount: 0
    }
  };
}
