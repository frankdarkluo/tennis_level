import { describe, expect, it } from "vitest";
import {
  buildXiaohongshuSeedCandidateArtifact,
  canonicalizeXiaohongshuCreatorProfileUrl,
  type XiaohongshuSeedCandidateInput
} from "../../scripts/lib/xiaohongshuSeedCandidates";

function createInput(overrides: Partial<XiaohongshuSeedCandidateInput> = {}): XiaohongshuSeedCandidateInput {
  return {
    creatorName: overrides.creatorName ?? "盖奥",
    creatorProfileUrl: overrides.creatorProfileUrl ?? "https://www.xiaohongshu.com/user/profile/5c3b619e000000000703fccc",
    creatorShortProfileUrl: overrides.creatorShortProfileUrl ?? "https://xhslink.com/m/3nXlLxIQQcu",
    rawUrl: overrides.rawUrl
      ?? "https://www.xiaohongshu.com/search_result/69d3aa0b000000002102d993?xsec_token=abc&xsec_source=",
    resolvedCanonicalUrl: overrides.resolvedCanonicalUrl
      ?? "https://www.xiaohongshu.com/explore/69d3aa0b000000002102d993?xsec_token=abc&xsec_source=pc_search",
    title: overrides.title ?? "发球全要点（慢动作+细节节奏串联）",
    profileConfirmedTitle: overrides.profileConfirmedTitle ?? "发球全要点（慢动作+细节节奏串联）",
    thumbnailUrl: overrides.thumbnailUrl ?? "https://sns-webpic-qc.xhscdn.com/example.jpg",
    preliminaryProblemTags: overrides.preliminaryProblemTags ?? ["serve-basics", "serve-rhythm"],
    discoveryQuery: overrides.discoveryQuery ?? "发球全要点（慢动作+细节节奏串联） 盖奥",
    surfaceDateText: overrides.surfaceDateText ?? "04-06",
    surfaceLikeText: overrides.surfaceLikeText ?? "1973",
    teachingType: overrides.teachingType ?? "serve",
    languageHint: overrides.languageHint ?? "zh",
    subtitleLanguageHint: overrides.subtitleLanguageHint ?? "zh",
    duplicateClusterHint: overrides.duplicateClusterHint ?? null,
    crossPlatformNotes: overrides.crossPlatformNotes ?? null,
    priority: overrides.priority ?? 1
  };
}

describe("xiaohongshu seed candidates", () => {
  it("canonicalizes creator profile URLs", () => {
    expect(
      canonicalizeXiaohongshuCreatorProfileUrl(
        "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346?xsec_source=pc_search"
      )
    ).toBe("https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346");
    expect(
      canonicalizeXiaohongshuCreatorProfileUrl("https://www.xiaohongshu.com/search_result?keyword=%E7%81%B5%E7%86%99")
    ).toBeNull();
  });

  it("preserves raw handoff URLs while normalizing canonical note URLs and creator aliases", () => {
    const artifact = buildXiaohongshuSeedCandidateArtifact({
      generatedAt: "2026-04-13T00:00:00.000Z",
      inputs: [
        createInput({
          creatorName: "灵熙🎾",
          creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346?channel_type=web_search_result_notes",
          creatorShortProfileUrl: "https://xhslink.com/m/2pkWMTS4aVj",
          rawUrl: "https://www.xiaohongshu.com/search_result/69c68c91000000001a0367fd?xsec_token=abc",
          resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/69c68c91000000001a0367fd?xsec_token=abc",
          title: "发球带点beats",
          profileConfirmedTitle: "发球带点beats",
          preliminaryProblemTags: ["serve-rhythm"],
          discoveryQuery: "发球带点beats 灵熙"
        })
      ]
    });

    expect(artifact.summary).toMatchObject({
      candidateCount: 1,
      creatorCount: 4,
      creatorTargetCount: 4
    });
    expect(artifact.candidates[0]).toMatchObject({
      creatorProgramId: "lingxi",
      creatorName: "灵熙",
      creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346",
      rawUrl: "https://www.xiaohongshu.com/search_result/69c68c91000000001a0367fd?xsec_token=abc",
      canonicalUrl: "https://www.xiaohongshu.com/explore/69c68c91000000001a0367fd",
      postId: "69c68c91000000001a0367fd",
      title: "发球带点beats",
      teachingType: "serve",
      reviewStatus: "needs_review"
    });
    expect(artifact.summary.byCreator).toContainEqual({
      creatorProgramId: "dabaiyang",
      creatorName: "奔跑的大白羊",
      creatorProfileUrl: null,
      creatorProfileStatus: "pending_profile_verification",
      candidateTarget: 50,
      savedCount: 0,
      collectible: false
    });
  });

  it("requires the saved note title to match the confirmed creator-profile title snapshot", () => {
    expect(() => buildXiaohongshuSeedCandidateArtifact({
      generatedAt: "2026-04-13T00:00:00.000Z",
      inputs: [
        createInput({
          title: "网球正手零基础教学（新手入门）",
          profileConfirmedTitle: "网球正手零基础教学（详细版）"
        })
      ]
    })).toThrow(/profileConfirmedTitle/i);
  });

  it("rejects creators outside the active program", () => {
    expect(() => buildXiaohongshuSeedCandidateArtifact({
      generatedAt: "2026-04-13T00:00:00.000Z",
      inputs: [
        createInput({
          creatorName: "未知博主",
          creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/unknown01"
        })
      ]
    })).toThrow(/not part of the active Xiaohongshu creator program/i);
  });

  it("rejects creators that are still pending profile verification", () => {
    expect(() => buildXiaohongshuSeedCandidateArtifact({
      generatedAt: "2026-04-13T00:00:00.000Z",
      inputs: [
        createInput({
          creatorName: "奔跑的大白羊",
          creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/pending01"
        })
      ]
    })).toThrow(/pending profile verification/i);
  });

  it("rejects unsupported teaching types", () => {
    expect(() => buildXiaohongshuSeedCandidateArtifact({
      generatedAt: "2026-04-13T00:00:00.000Z",
      inputs: [
        createInput({
          teachingType: "lifestyle" as unknown as XiaohongshuSeedCandidateInput["teachingType"]
        })
      ]
    })).toThrow(/not allowed/i);
  });
});
