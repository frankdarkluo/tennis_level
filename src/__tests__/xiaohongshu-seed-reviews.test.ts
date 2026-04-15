import { describe, expect, it } from "vitest";
import { buildXiaohongshuSeedCandidateArtifact } from "../../scripts/lib/xiaohongshuSeedCandidates";
import { buildXiaohongshuSeedPromotionPreview } from "../../scripts/lib/xiaohongshuSeedPromotion";
import { buildXiaohongshuSeedReviewedArtifact, parseXiaohongshuSeedReviewInput } from "../../scripts/lib/xiaohongshuSeedReviews";

const candidateArtifact = buildXiaohongshuSeedCandidateArtifact({
  generatedAt: "2026-04-14T00:00:00.000Z",
  inputs: [
    {
      creatorName: "盖奥",
      creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc",
      creatorShortProfileUrl: "https://xhslink.com/m/3nXlLxIQQcu",
      rawUrl: "https://www.xiaohongshu.com/search_result/69d3aa0b000000002102d993",
      resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69d3aa0b000000002102d993",
      title: "发球全要点（慢动作+细节节奏串联）",
      profileConfirmedTitle: "发球全要点（慢动作+细节节奏串联）",
      thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/example.jpg",
      preliminaryProblemTags: ["serve-basics", "serve-rhythm"],
      discoveryQuery: "发球全要点（慢动作+细节节奏串联） 盖奥",
      teachingType: "serve",
      languageHint: "zh",
      subtitleLanguageHint: "zh"
    }
  ]
});

describe("xiaohongshu seed reviews", () => {
  it("records reviewed candidates and promotion readiness in a separate QA artifact", () => {
    const reviewedArtifact = buildXiaohongshuSeedReviewedArtifact({
      generatedAt: "2026-04-14T00:00:00.000Z",
      candidateArtifact,
      decisions: [
        {
          candidateId: candidateArtifact.candidates[0].candidateId,
          reviewDecision: "verified",
          reviewedBy: "tester",
          reviewedAt: "2026-04-14T00:00:00.000Z",
          notes: "Verified and already promoted.",
          readyForRuntime: true,
          promotedContentId: "content_xhs_gaiao_03",
          promotedCreatorId: "creator_gaiao_xiaohongshu_hidden"
        }
      ]
    });

    expect(reviewedArtifact.summary).toEqual({
      reviewedCount: 1,
      verifiedCount: 1,
      readyForRuntimeCount: 1,
      alreadyPromotedCount: 1
    });
    expect(reviewedArtifact.reviewedCandidates[0]).toMatchObject({
      candidateId: candidateArtifact.candidates[0].candidateId,
      creatorProgramId: "gaiao",
      reviewDecision: "verified",
      promotionReadiness: "ready_for_runtime",
      promotedContentId: "content_xhs_gaiao_03"
    });
  });

  it("rejects runtime-ready rows that are not verified", () => {
    expect(() => buildXiaohongshuSeedReviewedArtifact({
      generatedAt: "2026-04-14T00:00:00.000Z",
      candidateArtifact,
      decisions: [
        {
          candidateId: candidateArtifact.candidates[0].candidateId,
          reviewDecision: "needs_review",
          reviewedBy: "tester",
          reviewedAt: "2026-04-14T00:00:00.000Z",
          notes: "Not ready.",
          readyForRuntime: true,
          promotedContentId: "content_xhs_gaiao_03"
        }
      ]
    })).toThrow(/cannot be runtime-ready unless it is verified/i);
  });

  it("builds a promotion preview without leaking QA-only rows into runtime", () => {
    const reviewedArtifact = buildXiaohongshuSeedReviewedArtifact({
      generatedAt: "2026-04-14T00:00:00.000Z",
      candidateArtifact,
      decisions: [
        {
          candidateId: candidateArtifact.candidates[0].candidateId,
          reviewDecision: "verified",
          reviewedBy: "tester",
          reviewedAt: "2026-04-14T00:00:00.000Z",
          notes: "Verified but still waiting for runtime promotion.",
          readyForRuntime: true
        }
      ]
    });
    const preview = buildXiaohongshuSeedPromotionPreview({
      generatedAt: "2026-04-14T00:00:00.000Z",
      reviewedArtifact
    });

    expect(preview.summary).toEqual({
      reviewedCount: 1,
      readyForRuntimeCount: 1,
      alreadyPromotedCount: 0,
      pendingPromotionCount: 1
    });
    expect(preview.pendingPromotionSpecs[0]).toMatchObject({
      creatorProgramId: "gaiao",
      teachingType: "serve",
      reviewDecision: "verified"
    });
  });

  it("rejects review-input rows whose candidateId is not in the current QA candidate pool", () => {
    expect(() => parseXiaohongshuSeedReviewInput(JSON.stringify({
      version: 1,
      decisions: [
        {
          candidateId: "xhs_unknown_candidate",
          reviewDecision: "verified",
          reviewedBy: "tester",
          reviewedAt: "2026-04-14T00:00:00.000Z",
          notes: "Unknown candidate.",
          readyForRuntime: false
        }
      ]
    }), {
      allowedCandidateIds: new Set(candidateArtifact.candidates.map((candidate) => candidate.candidateId))
    })).toThrow(/is not present in the seed candidate artifact/i);
  });
});
