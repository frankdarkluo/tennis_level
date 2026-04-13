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

  it("preserves raw handoff URLs while normalizing canonical note URLs", () => {
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
      creatorCount: 1
    });
    expect(artifact.candidates[0]).toMatchObject({
      creatorName: "灵熙🎾",
      creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346",
      rawUrl: "https://www.xiaohongshu.com/search_result/69c68c91000000001a0367fd?xsec_token=abc",
      canonicalUrl: "https://www.xiaohongshu.com/explore/69c68c91000000001a0367fd",
      postId: "69c68c91000000001a0367fd",
      title: "发球带点beats",
      reviewStatus: "needs_review"
    });
    expect(artifact.candidates[0].evidence.creatorEvidence).toContain(
      "canonical creator profile: https://www.xiaohongshu.com/user/profile/63aef7df000000002702a346"
    );
    expect(artifact.candidates[0].evidence.contentEvidence).toContain(
      "profile title confirmed on creator page: 发球带点beats"
    );
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

  it("sorts by priority and caps saved candidates at five per creator without filler rows", () => {
    const inputs = [
      createInput({ creatorName: "A", creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/a1", priority: 6, title: "A6", profileConfirmedTitle: "A6", rawUrl: "https://www.xiaohongshu.com/search_result/a6", resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/a6", preliminaryProblemTags: ["serve-rhythm"] }),
      createInput({ creatorName: "A", creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/a1", priority: 2, title: "A2", profileConfirmedTitle: "A2", rawUrl: "https://www.xiaohongshu.com/search_result/a2", resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/a2", preliminaryProblemTags: ["serve-rhythm"] }),
      createInput({ creatorName: "A", creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/a1", priority: 4, title: "A4", profileConfirmedTitle: "A4", rawUrl: "https://www.xiaohongshu.com/search_result/a4", resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/a4", preliminaryProblemTags: ["serve-rhythm"] }),
      createInput({ creatorName: "A", creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/a1", priority: 1, title: "A1", profileConfirmedTitle: "A1", rawUrl: "https://www.xiaohongshu.com/search_result/a1", resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/a1", preliminaryProblemTags: ["serve-rhythm"] }),
      createInput({ creatorName: "A", creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/a1", priority: 5, title: "A5", profileConfirmedTitle: "A5", rawUrl: "https://www.xiaohongshu.com/search_result/a5", resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/a5", preliminaryProblemTags: ["serve-rhythm"] }),
      createInput({ creatorName: "A", creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/a1", priority: 3, title: "A3", profileConfirmedTitle: "A3", rawUrl: "https://www.xiaohongshu.com/search_result/a3", resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/a3", preliminaryProblemTags: ["serve-rhythm"] }),
      createInput({ creatorName: "B", creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/b1", priority: 1, title: "B1", profileConfirmedTitle: "B1", rawUrl: "https://www.xiaohongshu.com/search_result/b1", resolvedCanonicalUrl: "https://www.xiaohongshu.com/explore/b1", preliminaryProblemTags: ["serve-rhythm"] })
    ];

    const artifact = buildXiaohongshuSeedCandidateArtifact({
      generatedAt: "2026-04-13T00:00:00.000Z",
      inputs
    });

    expect(artifact.summary.byCreator).toEqual([
      {
        creatorName: "A",
        creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/a1",
        savedCount: 5
      },
      {
        creatorName: "B",
        creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/b1",
        savedCount: 1
      }
    ]);
    expect(artifact.candidates.filter((candidate) => candidate.creatorName === "A").map((candidate) => candidate.title)).toEqual([
      "A1",
      "A2",
      "A3",
      "A4",
      "A5"
    ]);
  });
});
