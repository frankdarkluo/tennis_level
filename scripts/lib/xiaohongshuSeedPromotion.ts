import type { XiaohongshuSeedReviewedArtifact } from "./xiaohongshuSeedReviews";

export type XiaohongshuSeedPromotionPreview = {
  generatedAt: string;
  summary: {
    reviewedCount: number;
    readyForRuntimeCount: number;
    alreadyPromotedCount: number;
    pendingPromotionCount: number;
  };
  alreadyPromoted: Array<{
    candidateId: string;
    contentId: string;
    creatorId: string | null;
  }>;
  pendingPromotionSpecs: Array<{
    candidateId: string;
    canonicalUrl: string | null;
    creatorProgramId: string;
    creatorName: string;
    teachingType: string;
    reviewDecision: string;
  }>;
};

export function buildXiaohongshuSeedPromotionPreview(input: {
  generatedAt: string;
  reviewedArtifact: XiaohongshuSeedReviewedArtifact;
}): XiaohongshuSeedPromotionPreview {
  const readyCandidates = input.reviewedArtifact.reviewedCandidates.filter(
    (candidate) => candidate.promotionReadiness === "ready_for_runtime"
  );
  const alreadyPromoted = readyCandidates
    .filter((candidate) => candidate.promotedContentId)
    .map((candidate) => ({
      candidateId: candidate.candidateId,
      contentId: candidate.promotedContentId as string,
      creatorId: candidate.promotedCreatorId
    }));
  const pendingPromotionSpecs = readyCandidates
    .filter((candidate) => !candidate.promotedContentId)
    .map((candidate) => ({
      candidateId: candidate.candidateId,
      canonicalUrl: candidate.canonicalUrl,
      creatorProgramId: candidate.creatorProgramId,
      creatorName: candidate.creatorName,
      teachingType: candidate.teachingType,
      reviewDecision: candidate.reviewDecision
    }));

  return {
    generatedAt: input.generatedAt,
    summary: {
      reviewedCount: input.reviewedArtifact.summary.reviewedCount,
      readyForRuntimeCount: readyCandidates.length,
      alreadyPromotedCount: alreadyPromoted.length,
      pendingPromotionCount: pendingPromotionSpecs.length
    },
    alreadyPromoted,
    pendingPromotionSpecs
  };
}
