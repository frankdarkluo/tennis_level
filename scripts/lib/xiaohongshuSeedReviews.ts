import type { XiaohongshuSeedCandidate, XiaohongshuSeedCandidateArtifact } from "./xiaohongshuSeedCandidates";

export type XiaohongshuSeedReviewDecision = "verified" | "needs_review" | "rejected" | "skip";
export type XiaohongshuSeedPromotionReadiness = "ready_for_runtime" | "qa_only";

export type XiaohongshuSeedReviewInput = {
  candidateId: string;
  reviewDecision: XiaohongshuSeedReviewDecision;
  reviewedBy: string;
  reviewedAt: string;
  notes: string;
  readyForRuntime: boolean;
  promotedContentId?: string | null;
  promotedCreatorId?: string | null;
};

export type XiaohongshuSeedReviewInputFile = {
  version: 1;
  decisions: XiaohongshuSeedReviewInput[];
};

export type XiaohongshuSeedReviewedCandidate = {
  candidateId: string;
  creatorProgramId: string;
  creatorName: string;
  canonicalUrl: string | null;
  rawUrl: string;
  teachingType: XiaohongshuSeedCandidate["teachingType"];
  reviewDecision: XiaohongshuSeedReviewDecision;
  reviewedBy: string;
  reviewedAt: string;
  notes: string;
  promotionReadiness: XiaohongshuSeedPromotionReadiness;
  promotedContentId: string | null;
  promotedCreatorId: string | null;
};

export type XiaohongshuSeedReviewedArtifact = {
  version: 1;
  generatedAt: string;
  summary: {
    reviewedCount: number;
    verifiedCount: number;
    readyForRuntimeCount: number;
    alreadyPromotedCount: number;
  };
  reviewedCandidates: XiaohongshuSeedReviewedCandidate[];
};

const REVIEW_DECISIONS: XiaohongshuSeedReviewDecision[] = ["verified", "needs_review", "rejected", "skip"];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseXiaohongshuSeedReviewInput(
  rawInput: string,
  options: { allowedCandidateIds: Set<string> }
): XiaohongshuSeedReviewInputFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawInput);
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_json";
    throw new Error(`Xiaohongshu seed review input is not valid JSON: ${message}`);
  }

  if (!isObject(parsed)) {
    throw new Error("Xiaohongshu seed review input must be a JSON object");
  }

  if (parsed.version !== 1) {
    throw new Error("Xiaohongshu seed review input version must be 1");
  }

  if (!Array.isArray(parsed.decisions)) {
    throw new Error("Xiaohongshu seed review input decisions must be an array");
  }

  const seenCandidateIds = new Set<string>();
  const decisions = parsed.decisions.map((rawDecision, index) => {
    const prefix = `decisions[${index}]`;
    if (!isObject(rawDecision)) {
      throw new Error(`${prefix} must be an object`);
    }

    const candidateId = normalizeString(rawDecision.candidateId);
    const reviewDecision = normalizeString(rawDecision.reviewDecision) as XiaohongshuSeedReviewDecision;
    const reviewedBy = normalizeString(rawDecision.reviewedBy);
    const reviewedAt = normalizeString(rawDecision.reviewedAt);
    const notes = normalizeString(rawDecision.notes);
    const readyForRuntime = Boolean(rawDecision.readyForRuntime);
    const promotedContentId = normalizeString(rawDecision.promotedContentId) || null;
    const promotedCreatorId = normalizeString(rawDecision.promotedCreatorId) || null;

    if (!candidateId) {
      throw new Error(`${prefix}.candidateId is required`);
    }
    if (!options.allowedCandidateIds.has(candidateId)) {
      throw new Error(`${prefix}.candidateId "${candidateId}" is not present in the seed candidate artifact`);
    }
    if (seenCandidateIds.has(candidateId)) {
      throw new Error(`${prefix}.candidateId "${candidateId}" is duplicated`);
    }
    seenCandidateIds.add(candidateId);

    if (!REVIEW_DECISIONS.includes(reviewDecision)) {
      throw new Error(`${prefix}.reviewDecision must be one of ${REVIEW_DECISIONS.join(", ")}`);
    }
    if (!reviewedBy) {
      throw new Error(`${prefix}.reviewedBy is required`);
    }
    if (!reviewedAt || Number.isNaN(Date.parse(reviewedAt))) {
      throw new Error(`${prefix}.reviewedAt must be a valid timestamp`);
    }
    if (!notes) {
      throw new Error(`${prefix}.notes is required`);
    }
    if (readyForRuntime && reviewDecision !== "verified") {
      throw new Error(`${prefix}.readyForRuntime requires reviewDecision=verified`);
    }

    return {
      candidateId,
      reviewDecision,
      reviewedBy,
      reviewedAt,
      notes,
      readyForRuntime,
      promotedContentId,
      promotedCreatorId
    } satisfies XiaohongshuSeedReviewInput;
  });

  return {
    version: 1,
    decisions
  };
}

function sortReviewedCandidates(items: XiaohongshuSeedReviewedCandidate[]): XiaohongshuSeedReviewedCandidate[] {
  return items.slice().sort((left, right) => {
    if (left.creatorProgramId !== right.creatorProgramId) {
      return left.creatorProgramId.localeCompare(right.creatorProgramId);
    }

    return left.candidateId.localeCompare(right.candidateId);
  });
}

export function buildXiaohongshuSeedReviewedArtifact(input: {
  generatedAt: string;
  candidateArtifact: XiaohongshuSeedCandidateArtifact;
  decisions: XiaohongshuSeedReviewInput[];
}): XiaohongshuSeedReviewedArtifact {
  const candidateById = new Map(
    input.candidateArtifact.candidates.map((candidate) => [candidate.candidateId, candidate])
  );

  const reviewedCandidates = input.decisions.map((decision) => {
    const candidate = candidateById.get(decision.candidateId);
    if (!candidate) {
      throw new Error(`review decision references unknown candidateId "${decision.candidateId}"`);
    }

    if (decision.readyForRuntime && decision.reviewDecision !== "verified") {
      throw new Error(`candidate "${decision.candidateId}" cannot be runtime-ready unless it is verified`);
    }

    return {
      candidateId: candidate.candidateId,
      creatorProgramId: candidate.creatorProgramId,
      creatorName: candidate.creatorName,
      canonicalUrl: candidate.canonicalUrl,
      rawUrl: candidate.rawUrl,
      teachingType: candidate.teachingType,
      reviewDecision: decision.reviewDecision,
      reviewedBy: decision.reviewedBy.trim(),
      reviewedAt: decision.reviewedAt,
      notes: decision.notes.trim(),
      promotionReadiness: decision.readyForRuntime ? "ready_for_runtime" : "qa_only",
      promotedContentId: decision.promotedContentId?.trim() || null,
      promotedCreatorId: decision.promotedCreatorId?.trim() || null
    } satisfies XiaohongshuSeedReviewedCandidate;
  });

  const sorted = sortReviewedCandidates(reviewedCandidates);

  return {
    version: 1,
    generatedAt: input.generatedAt,
    summary: {
      reviewedCount: sorted.length,
      verifiedCount: sorted.filter((candidate) => candidate.reviewDecision === "verified").length,
      readyForRuntimeCount: sorted.filter((candidate) => candidate.promotionReadiness === "ready_for_runtime").length,
      alreadyPromotedCount: sorted.filter((candidate) => candidate.promotedContentId).length
    },
    reviewedCandidates: sorted
  };
}
