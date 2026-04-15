import { describe, expect, it } from "vitest";
import { buildAttachedRecommendationNarrative, recommendAttachedVideos } from "@/lib/recommendations/attached/recommend";
import type { ContentItem } from "@/types/content";
import type { GuidanceContext } from "@/lib/guidance-context/types";
import type { CatalogQualityReview } from "@/lib/content-catalog/schema";

const guidanceContext: GuidanceContext = {
  source: "diagnosis",
  primaryProblemTag: "second-serve-reliability",
  secondaryProblemTags: ["serve-basics", "serve-rhythm"],
  strokeFamily: "serve",
  mechanismFamily: "rhythm",
  skillBand: "3.5",
  languagePreference: "zh",
  planIntent: "rebuild_mechanics",
  trainingFocus: "先把二发节奏稳住"
};

const englishGuidanceContext: GuidanceContext = {
  ...guidanceContext,
  languagePreference: "en",
  trainingFocus: "stabilize the second-serve rhythm"
};

function createItem(overrides: Partial<ContentItem>): ContentItem {
  return {
    id: overrides.id ?? "content_test_01",
    title: overrides.title ?? "二发节奏讲解",
    creatorId: overrides.creatorId ?? "creator_a",
    platform: overrides.platform ?? "Bilibili",
    type: "video",
    levels: overrides.levels ?? ["3.0", "3.5"],
    skills: overrides.skills ?? ["serve"],
    problemTags: overrides.problemTags ?? ["second-serve-reliability"],
    language: overrides.language ?? "zh",
    contentLanguage: overrides.contentLanguage ?? "zh",
    subtitleAvailability: overrides.subtitleAvailability ?? "zh",
    summary: overrides.summary ?? "发球节奏稳定教学",
    reason: overrides.reason ?? "先稳住节奏",
    useCases: overrides.useCases ?? ["二发稳定性"],
    coachReason: overrides.coachReason ?? "适合先重建发球节奏",
    thumbnail: overrides.thumbnail ?? "/thumbnails/test.jpg",
    duration: overrides.duration ?? "03:20",
    url: overrides.url ?? "https://www.bilibili.com/video/BV1abc123456",
    environment: overrides.environment ?? "production"
  };
}

function createQualityReview(overrides: Partial<CatalogQualityReview>): CatalogQualityReview {
  return {
    contentId: overrides.contentId ?? "content_test_01",
    reviewStatus: overrides.reviewStatus ?? "verified",
    thumbnailStatus: overrides.thumbnailStatus ?? "ok",
    httpStatus: overrides.httpStatus ?? 200,
    verifiedBy: overrides.verifiedBy ?? "qa",
    lastVerifiedAt: overrides.lastVerifiedAt ?? "2026-04-14T00:00:00.000Z",
    ...overrides
  };
}

describe("attached recommendations", () => {
  it("requires trusted review metadata instead of treating curated items as eligible by default", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({ id: "verified_good" }),
        createItem({
          id: "curated_unreviewed",
          title: "二发节奏跟练",
          summary: "未审核内容不该进入 attached pool"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({
          contentId: "verified_good",
          reviewStatus: "manual_confirmed"
        })
      ],
      maxResults: 3
    });

    expect(recommendations.map((entry) => entry.item.id)).toEqual(["verified_good"]);
  });

  it("rejects unhealthy links and thumbnails before scoring", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({ id: "healthy_verified" }),
        createItem({
          id: "dead_link",
          title: "失效链接二发视频"
        }),
        createItem({
          id: "broken_thumbnail",
          title: "缩略图损坏视频"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({
          contentId: "healthy_verified",
          reviewStatus: "verified",
          httpStatus: 200,
          thumbnailStatus: "ok"
        }),
        createQualityReview({
          contentId: "dead_link",
          reviewStatus: "verified",
          httpStatus: 404,
          thumbnailStatus: "ok"
        }),
        createQualityReview({
          contentId: "broken_thumbnail",
          reviewStatus: "verified",
          httpStatus: 200,
          thumbnailStatus: "broken"
        })
      ],
      maxResults: 3
    });

    expect(recommendations.map((entry) => entry.item.id)).toEqual(["healthy_verified"]);
  });

  it("treats English usability as a hard gate instead of falling back to Chinese-only videos", () => {
    const mixedRecommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext: englishGuidanceContext,
      contentPool: [
        createItem({
          id: "english_subtitles",
          language: "zh",
          contentLanguage: "zh",
          subtitleAvailability: "english",
          title: "二发节奏讲解（英文字幕）"
        }),
        createItem({
          id: "chinese_only",
          language: "zh",
          contentLanguage: "zh",
          subtitleAvailability: "none",
          title: "二发节奏讲解（纯中文）"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({ contentId: "english_subtitles" }),
        createQualityReview({ contentId: "chinese_only" })
      ],
      maxResults: 3
    });

    expect(mixedRecommendations.map((entry) => entry.item.id)).toEqual(["english_subtitles"]);

    const emptyRecommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext: englishGuidanceContext,
      contentPool: [
        createItem({
          id: "chinese_only_again",
          language: "zh",
          contentLanguage: "zh",
          subtitleAvailability: "none",
          title: "二发节奏讲解（纯中文）"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [createQualityReview({ contentId: "chinese_only_again" })],
      maxResults: 3
    });

    expect(emptyRecommendations).toEqual([]);
  });

  it("returns one or zero results instead of padding a weak pool", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({ id: "only_verified" }),
        createItem({
          id: "unreviewed_extra",
          title: "未审核补充视频"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [createQualityReview({ contentId: "only_verified" })],
      maxResults: 3
    });

    expect(recommendations.map((entry) => entry.item.id)).toEqual(["only_verified"]);
  });

  it("filters out non-direct-source or unusable language/thumbnail candidates", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({ id: "good_explanation" }),
        createItem({
          id: "search_link",
          url: "https://search.bilibili.com/all?keyword=%E4%BA%8C%E5%8F%91"
        }),
        createItem({
          id: "missing_thumbnail",
          thumbnail: undefined
        }),
        createItem({
          id: "english_without_subtitles",
          language: "en",
          contentLanguage: "en",
          subtitleAvailability: "none"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({ contentId: "good_explanation" }),
        createQualityReview({ contentId: "missing_thumbnail" }),
        createQualityReview({ contentId: "english_without_subtitles" })
      ],
      maxResults: 3
    });

    expect(recommendations.map((entry) => entry.item.id)).toEqual(["good_explanation"]);
  });

  it("reranks into a small diverse set with explanation and drill coverage while suppressing duplicates", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({
          id: "explanation_a",
          creatorId: "creator_a",
          title: "二发节奏讲解",
          summary: "二发节奏教学，先理解动作串联"
        }),
        createItem({
          id: "drill_b",
          creatorId: "creator_b",
          platform: "Xiaohongshu",
          title: "二发跟练 20 次",
          summary: "跟练型二发训练",
          reason: "马上跟练二发节奏"
        }),
        createItem({
          id: "duplicate_drill_c",
          creatorId: "creator_c",
          platform: "Bilibili",
          title: "二发跟练 20 次",
          summary: "同标题重复内容",
          reason: "重复候选"
        }),
        createItem({
          id: "same_creator_extra",
          creatorId: "creator_a",
          title: "发球抛球补充",
          problemTags: ["serve-basics"],
          summary: "同博主补充项"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({ contentId: "explanation_a" }),
        createQualityReview({ contentId: "drill_b" }),
        createQualityReview({ contentId: "duplicate_drill_c" }),
        createQualityReview({ contentId: "same_creator_extra" })
      ],
      maxResults: 3
    });

    const ids = recommendations.map((entry) => entry.item.id);

    expect(ids[0]).toBe("explanation_a");
    expect(ids.some((id) => id === "drill_b" || id === "duplicate_drill_c")).toBe(true);
    expect(ids).not.toEqual(expect.arrayContaining(["drill_b", "duplicate_drill_c"]));
    expect(new Set(recommendations.map((entry) => entry.item.creatorId)).size).toBe(2);
    expect(recommendations.some((entry) => entry.role === "explanation")).toBe(true);
    expect(recommendations.some((entry) => entry.role === "drill")).toBe(true);
  });

  it("pins required seeds first while still reserving room for support candidates", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({
          id: "required_seed",
          title: "关键分二发先求进区",
          summary: "关键分先把球发进区",
          reason: "先给自己一个更简单的落点目标",
          coachReason: "比赛里先稳住执行",
          useCases: ["二发容易双误"]
        }),
        createItem({
          id: "explanation_a",
          creatorId: "creator_a",
          title: "二发节奏讲解",
          summary: "二发节奏教学，先理解动作串联"
        }),
        createItem({
          id: "support_c",
          creatorId: "creator_c",
          title: "关键分前的二发 routine",
          problemTags: ["pressure-tightness"],
          summary: "关键分前先做固定呼吸和节奏提示",
          reason: "帮助压力下先稳定执行"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({ contentId: "required_seed" }),
        createQualityReview({ contentId: "explanation_a" }),
        createQualityReview({ contentId: "support_c" })
      ],
      maxResults: 3,
      requiredIds: ["required_seed"],
      preferredIds: ["required_seed", "support_c"],
      supportIds: ["support_c"]
    });

    const ids = recommendations.map((entry) => entry.item.id);

    expect(ids[0]).toBe("required_seed");
    expect(ids).toContain("support_c");
  });

  it("builds rationale text from the same guidance context contract", () => {
    const narrative = buildAttachedRecommendationNarrative({
      item: createItem({
        id: "drill_b",
        creatorId: "creator_b",
        title: "二发跟练 20 次",
        summary: "跟练型二发训练"
      }),
      guidanceContext,
      locale: "zh"
    });

    expect(narrative.whySelected).toMatch(/主问题|主线|节奏/);
    expect(narrative.technicalPoint).toMatch(/二发节奏稳住/);
  });
});
