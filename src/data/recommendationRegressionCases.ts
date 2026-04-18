import { contentQualityReviews } from "@/data/contentQualityReviews";
import { contents } from "@/data/contents";
import type { GuidanceContext } from "@/lib/guidance-context/types";
import type { CatalogQualityReview } from "@/lib/content-catalog/schema";
import type { ContentItem } from "@/types/content";
import type { TeachingRecommendationSlot } from "@/types/teachingRecommendation";

type RecommendationRegressionCase = {
  id: string;
  guidanceContext: GuidanceContext;
  lexicalTerms: string[];
  contentPool: ContentItem[];
  qualityReviews: CatalogQualityReview[];
  requiredIds?: string[];
  preferredIds?: string[];
  supportIds?: string[];
  maxResults?: number;
  expectedSlots: Array<{
    slot: TeachingRecommendationSlot;
    contentId: string;
  }>;
};

function pickContents(ids: string[]) {
  const byId = new Map(contents.map((item) => [item.id, item] as const));
  return ids.map((id) => {
    const item = byId.get(id);
    if (!item) {
      throw new Error(`Missing regression content: ${id}`);
    }
    return item;
  });
}

function pickReviews(ids: string[]) {
  const byId = new Map(contentQualityReviews.map((item) => [item.contentId, item] as const));

  return ids.map((id) => {
    const existing = byId.get(id);
    if (existing) {
      return existing;
    }

    const fallback: CatalogQualityReview = {
      contentId: id,
      reviewStatus: "verified",
      thumbnailStatus: "ok",
      verifiedBy: "regression-fixture"
    };

    return fallback;
  });
}

function createItem(overrides: Partial<ContentItem>): ContentItem {
  return {
    id: overrides.id ?? "regression_content",
    title: overrides.title ?? "前四拍组织顺序",
    creatorId: overrides.creatorId ?? "creator_regression",
    platform: overrides.platform ?? "Bilibili",
    type: "video",
    levels: overrides.levels ?? ["3.5", "4.0"],
    skills: overrides.skills ?? ["matchplay"],
    problemTags: overrides.problemTags ?? ["passive-point-construction"],
    language: overrides.language ?? "zh",
    contentLanguage: overrides.contentLanguage ?? "zh",
    subtitleAvailability: overrides.subtitleAvailability ?? "zh",
    summary: overrides.summary ?? "适合不会组织前四拍的球员。",
    reason: overrides.reason ?? "用来解释回合组织顺序。",
    useCases: overrides.useCases ?? ["前四拍不会组织"],
    coachReason: overrides.coachReason ?? "先把组织顺序说清楚。",
    thumbnail: overrides.thumbnail ?? "/thumbnails/test.jpg",
    duration: overrides.duration ?? "03:20",
    url: overrides.url ?? "https://www.bilibili.com/video/BV1abc123456",
    environment: overrides.environment ?? "production"
  };
}

const secondServeIds = ["content_xhs_lingxi_05", "content_xhs_gaiao_03"];
const lateContactIds = ["content_fr_02", "content_cn_c_02"];
const pointConstructionIds = ["point_explanation", "content_xhs_mouratoglou_05", "content_rb_03"];
const recoveryIds = ["content_xhs_gaiao_01", "content_xhs_lingxi_02", "content_cn_c_02"];

export const recommendationRegressionCases: RecommendationRegressionCase[] = [
  {
    id: "second-serve-reliability",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      secondaryProblemTags: ["serve-basics", "serve-rhythm"],
      strokeFamily: "serve",
      mechanismFamily: "rhythm",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "rebuild_mechanics",
      trainingFocus: "先把二发节奏稳住"
    },
    lexicalTerms: ["二发", "节奏", "发球动作不连贯"],
    contentPool: pickContents(secondServeIds),
    qualityReviews: pickReviews(secondServeIds),
    expectedSlots: [
      { slot: "primary", contentId: "content_xhs_lingxi_05" },
      { slot: "explanation", contentId: "content_xhs_gaiao_03" }
    ]
  },
  {
    id: "late-contact-getting-jammed",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "late-contact",
      secondaryProblemTags: ["movement-slow", "on-the-run-late-contact", "recovery-delay"],
      strokeFamily: "general",
      mechanismFamily: "recovery",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "arrive_earlier",
      trainingFocus: "先让脚先到位，不要总在身后击球"
    },
    lexicalTerms: ["击球点偏晚", "准备慢半拍", "被球挤到"],
    contentPool: pickContents(lateContactIds),
    qualityReviews: pickReviews(lateContactIds),
    expectedSlots: [
      { slot: "primary", contentId: "content_fr_02" },
      { slot: "drill", contentId: "content_cn_c_02" }
    ]
  },
  {
    id: "passive-point-construction",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "passive-point-construction",
      secondaryProblemTags: ["key-point-indecision", "pressure-tightness"],
      strokeFamily: "general",
      mechanismFamily: "decision",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "organize_tactics",
      trainingFocus: "先把开分后的前四拍组织顺"
    },
    lexicalTerms: ["前四拍", "组织分点", "关键分不知道先打哪里"],
    contentPool: [
      createItem({
        id: "point_explanation",
        title: "回合组织教学：先把开分主线讲清楚",
        summary: "适合不知道怎么组织回合、总在前几拍被动的球员。",
        reason: "先解释清楚开分主线和目标区。",
        useCases: ["前几拍总被动", "回合组织没有主线", "开分后先打哪里"],
        coachReason: "先把组织主线讲清楚，再去练回合执行。"
      }),
      ...pickContents(pointConstructionIds.slice(1))
    ],
    qualityReviews: pickReviews(pointConstructionIds),
    requiredIds: ["point_explanation"],
    preferredIds: ["point_explanation", "content_xhs_mouratoglou_05"],
    expectedSlots: [
      { slot: "primary", contentId: "point_explanation" },
      { slot: "explanation", contentId: "content_xhs_mouratoglou_05" }
    ]
  },
  {
    id: "recovery-timing-arrive-earlier",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "movement-slow",
      secondaryProblemTags: ["late-contact", "recovery-delay", "slow-preparation"],
      strokeFamily: "general",
      mechanismFamily: "recovery",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "arrive_earlier",
      trainingFocus: "先把分腿垫步和启动到位节奏做顺"
    },
    lexicalTerms: ["分腿垫步", "启动慢", "到位节奏", "被球挤到"],
    contentPool: pickContents(recoveryIds),
    qualityReviews: pickReviews(recoveryIds),
    expectedSlots: [
      { slot: "primary", contentId: "content_xhs_gaiao_01" },
      { slot: "explanation", contentId: "content_xhs_lingxi_02" },
      { slot: "drill", contentId: "content_cn_c_02" }
    ]
  },
  {
    id: "english-no-result",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      secondaryProblemTags: ["serve-basics", "serve-rhythm"],
      strokeFamily: "serve",
      mechanismFamily: "rhythm",
      skillBand: "3.5",
      languagePreference: "en",
      planIntent: "rebuild_mechanics",
      trainingFocus: "stabilize the second-serve rhythm"
    },
    lexicalTerms: ["second serve", "rhythm", "serve tempo"],
    contentPool: pickContents(["content_xhs_lingxi_05", "content_xhs_gaiao_03"]),
    qualityReviews: pickReviews(["content_xhs_lingxi_05", "content_xhs_gaiao_03"]),
    expectedSlots: []
  },
  {
    id: "same-creator-suppression",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      secondaryProblemTags: ["serve-basics", "serve-rhythm"],
      strokeFamily: "serve",
      mechanismFamily: "rhythm",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "rebuild_mechanics",
      trainingFocus: "先把二发节奏稳住"
    },
    lexicalTerms: ["二发", "节奏", "发球"],
    contentPool: [
      createItem({
        id: "same_creator_primary",
        creatorId: "creator_same",
        title: "二发节奏先稳住",
        summary: "先解释发球节奏为什么会断。",
        reason: "先做主问题解释。",
        problemTags: ["second-serve-reliability"],
        useCases: ["二发总断节奏"]
      }),
      createItem({
        id: "same_creator_explanation",
        creatorId: "creator_same",
        title: "二发节奏完整讲解",
        summary: "同一创作者的补充解释。",
        reason: "同创作者补充。",
        problemTags: ["serve-rhythm"]
      }),
      createItem({
        id: "other_creator_drill",
        creatorId: "creator_other",
        title: "二发跟练 20 次",
        summary: "跟练型二发训练。",
        reason: "马上跟练二发节奏。",
        problemTags: ["second-serve-reliability"]
      })
    ],
    qualityReviews: pickReviews(["same_creator_primary", "same_creator_explanation", "other_creator_drill"]),
    expectedSlots: [
      { slot: "primary", contentId: "same_creator_primary" },
      { slot: "explanation", contentId: "same_creator_explanation" },
      { slot: "drill", contentId: "other_creator_drill" }
    ]
  },
  {
    id: "required-seed-does-not-bypass-eligibility",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      secondaryProblemTags: ["serve-basics", "serve-rhythm"],
      strokeFamily: "serve",
      mechanismFamily: "rhythm",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "rebuild_mechanics",
      trainingFocus: "先把二发节奏稳住"
    },
    lexicalTerms: ["二发", "节奏", "抛球"],
    contentPool: [
      createItem({
        id: "required_unreviewed",
        title: "二发节奏讲解",
        summary: "未审核内容不该被 required 放进池子。",
        problemTags: ["second-serve-reliability"]
      }),
      createItem({
        id: "verified_primary",
        title: "发球节奏主修正",
        summary: "已审核可信内容。",
        reason: "先稳住二发节奏。",
        problemTags: ["second-serve-reliability"]
      })
    ],
    qualityReviews: [
      {
        contentId: "verified_primary",
        reviewStatus: "verified",
        thumbnailStatus: "ok",
        verifiedBy: "regression-fixture"
      }
    ],
    requiredIds: ["required_unreviewed"],
    expectedSlots: [{ slot: "explanation", contentId: "verified_primary" }]
  },
  {
    id: "weak-pool-slot-floors",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      secondaryProblemTags: ["serve-basics", "serve-rhythm"],
      strokeFamily: "serve",
      mechanismFamily: "rhythm",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "rebuild_mechanics",
      trainingFocus: "先把二发节奏稳住"
    },
    lexicalTerms: ["二发", "节奏", "发球"],
    contentPool: [
      ...pickContents(["content_xhs_lingxi_05"]),
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
    qualityReviews: pickReviews(["content_xhs_lingxi_05", "weak_explanation", "warmup_mismatch"]),
    supportIds: ["warmup_mismatch"],
    expectedSlots: [{ slot: "primary", contentId: "content_xhs_lingxi_05" }]
  },
  {
    id: "warmup-backfill-needs-mechanism-match",
    guidanceContext: {
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      secondaryProblemTags: ["serve-basics", "serve-rhythm"],
      strokeFamily: "serve",
      mechanismFamily: "rhythm",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "rebuild_mechanics",
      trainingFocus: "先把二发节奏稳住"
    },
    lexicalTerms: ["二发", "节奏", "热身"],
    contentPool: [
      ...pickContents(["content_xhs_lingxi_05"]),
      createItem({
        id: "serve_warmup_only",
        creatorId: "creator_warmup_match",
        title: "发球前热身模板",
        summary: "热身型内容，不是正经 drill。",
        reason: "只是准备活动。",
        problemTags: ["serve-basics"],
        skills: ["serve", "training"]
      })
    ],
    qualityReviews: pickReviews(["content_xhs_lingxi_05", "serve_warmup_only"]),
    supportIds: ["serve_warmup_only"],
    expectedSlots: [{ slot: "primary", contentId: "content_xhs_lingxi_05" }]
  }
];
