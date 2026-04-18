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
    expect(recommendations.map((entry) => entry.slot)).toEqual(["primary"]);
  });

  it("rejects needs_review items from attached recommendations", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({ id: "verified_good" }),
        createItem({ id: "needs_review_candidate", title: "未完成审核的内容" })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({ contentId: "verified_good", reviewStatus: "verified" }),
        createQualityReview({ contentId: "needs_review_candidate", reviewStatus: "needs_review" })
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

  it("uses teaching metadata to override heuristic role inference", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({
          id: "content_xhs_lingxi_05",
          title: "发球带点beats",
          summary: "模糊标题也要走 metadata role",
          reason: "元数据应把它视为主修正内容"
        }),
        createItem({
          id: "content_xhs_gaiao_03",
          title: "发球全要点",
          summary: "作为说明型内容"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({ contentId: "content_xhs_lingxi_05" }),
        createQualityReview({ contentId: "content_xhs_gaiao_03" })
      ],
      maxResults: 3
    });

    expect(recommendations[0]?.item.id).toBe("content_xhs_lingxi_05");
    expect(recommendations[0]?.role).toBe("primary_fix");
    expect(recommendations[0]?.slot).toBe("primary");
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
    const slots = recommendations.map((entry) => entry.slot);

    expect(ids[0]).toBe("explanation_a");
    expect(ids.some((id) => id === "drill_b" || id === "duplicate_drill_c")).toBe(true);
    expect(ids).not.toEqual(expect.arrayContaining(["drill_b", "duplicate_drill_c"]));
    expect(new Set(recommendations.map((entry) => entry.item.creatorId)).size).toBe(2);
    expect(slots).toEqual(["primary", "drill"]);
  });

  it("packages candidates into fixed primary -> explanation -> drill slots", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({
          id: "content_xhs_lingxi_05",
          title: "发球带点beats",
          summary: "发球节奏主修正"
        }),
        createItem({
          id: "content_xhs_gaiao_03",
          title: "发球全要点（慢动作+细节节奏串联）",
          summary: "发球解释型内容"
        }),
        createItem({
          id: "serve_drill",
          creatorId: "creator_c",
          title: "二发跟练 20 次",
          summary: "跟练型二发训练",
          reason: "马上跟练二发节奏"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({ contentId: "content_xhs_lingxi_05" }),
        createQualityReview({ contentId: "content_xhs_gaiao_03" }),
        createQualityReview({ contentId: "serve_drill" })
      ],
      maxResults: 3
    });

    expect(recommendations.map((entry) => entry.slot)).toEqual(["primary", "explanation", "drill"]);
    expect(recommendations.map((entry) => entry.item.id)).toEqual([
      "content_xhs_lingxi_05",
      "content_xhs_gaiao_03",
      "serve_drill"
    ]);
  });

  it("pins required seeds first while still reserving room for support candidates", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({
          id: "content_xhs_lingxi_05",
          title: "发球带点beats",
          summary: "关键分先修正二发目标区和出手节奏",
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
        createQualityReview({ contentId: "content_xhs_lingxi_05" }),
        createQualityReview({ contentId: "explanation_a" }),
        createQualityReview({ contentId: "support_c" })
      ],
      maxResults: 3,
      requiredIds: ["content_xhs_lingxi_05"],
      preferredIds: ["content_xhs_lingxi_05", "support_c"],
      supportIds: ["support_c"]
    });

    const ids = recommendations.map((entry) => entry.item.id);

    expect(ids[0]).toBe("content_xhs_lingxi_05");
    expect(ids).toContain("support_c");
  });

  it("does not let trusted seed lists bypass eligibility", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({
          id: "required_unreviewed",
          title: "二发节奏讲解",
          summary: "未审核内容不该被 required 放进 attached pool"
        }),
        createItem({
          id: "verified_primary",
          title: "二发节奏主修正",
          summary: "已审核可信内容"
        })
      ],
      expandedContentPool: [],
      qualityReviews: [createQualityReview({ contentId: "verified_primary", reviewStatus: "verified" })],
      requiredIds: ["required_unreviewed"],
      preferredIds: ["required_unreviewed"],
      supportIds: ["required_unreviewed"],
      maxResults: 3
    });

    expect(recommendations.map((entry) => entry.item.id)).toEqual(["verified_primary"]);
  });

  it("leaves weak explanation and warmup fallback slots empty instead of padding to three items", () => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext,
      contentPool: [
        createItem({
          id: "content_xhs_lingxi_05",
          title: "发球带点beats",
          summary: "发球节奏主修正",
          reason: "先稳住二发节奏"
        }),
        createItem({
          id: "weak_explanation",
          creatorId: "creator_weak_explanation",
          title: "节奏基础概念",
          summary: "很泛的节奏说明，不够贴问题。",
          reason: "只是泛解释，不够聚焦。",
          problemTags: ["general-improvement"],
          skills: ["basics"]
        }),
        createItem({
          id: "warmup_mismatch",
          creatorId: "creator_warmup",
          title: "发球前热身摆臂",
          summary: "偏热身准备，不是针对二发节奏主修正。",
          reason: "热身活动。",
          problemTags: ["serve-basics"],
          skills: ["serve", "training"]
        })
      ],
      expandedContentPool: [],
      qualityReviews: [
        createQualityReview({ contentId: "content_xhs_lingxi_05", reviewStatus: "verified" }),
        createQualityReview({ contentId: "weak_explanation", reviewStatus: "verified" }),
        createQualityReview({ contentId: "warmup_mismatch", reviewStatus: "verified" })
      ],
      supportIds: ["warmup_mismatch"],
      maxResults: 3
    });

    expect(recommendations.map((entry) => entry.item.id)).toEqual(["content_xhs_lingxi_05"]);
    expect(recommendations.map((entry) => entry.slot)).toEqual(["primary"]);
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
