import {
  getContentCoachNote,
  getContentFocusLine,
  getContentPrimaryTitle
} from "@/lib/content/display";
import type { GuidanceContext } from "@/lib/guidance-context/types";
import { canonicalizeTennisText } from "@/lib/i18n/tennisGlossary";
import { buildAttachedRecommendationNarrative } from "@/lib/recommendations/attached/recommend";
import type { ContentItem } from "@/types/content";

export type ContentTeachingIntent = "teaching" | "match_example" | "commentary" | "general";
export type RecommendationTrustSignal = "direct_source" | "search_link" | "teaching" | "match_example" | "commentary";

type RecommendationSignalInput = {
  title: string;
  sourceTitle?: string;
  originalTitle?: string;
  summary: string;
  reason: string;
  coachReason: string;
  useCases: string[];
  url?: string;
};

const SEARCH_LINK_PATTERNS = [
  /search\.bilibili\.com\/all\?keyword=/i,
  /youtube\.com\/results\?search_query=/i
];

const TEACHING_PATTERNS = [
  /\bbreakdown\b/i,
  /\blesson\b/i,
  /\bmasterclass\b/i,
  /\bfundamentals?\b/i,
  /\bbasics?\b/i,
  /\bhow to\b/i,
  /\bdrill\b/i,
  /\btechnique\b/i,
  /\bmechanics?\b/i,
  /\bstep[- ]by[- ]step\b/i,
  /教学|讲解|精讲|入门|基础|纠正|训练|练习|动作|节奏|技巧|拆解/
];

const MATCH_PATTERNS = [
  /\bmatch\b/i,
  /\blive points?\b/i,
  /\bpractice set\b/i,
  /\bhighlights?\b/i,
  /\bpoint play\b/i,
  /比赛|实战|对抗|盘点|集锦|得分/
];

const COMMENTARY_PATTERNS = [
  /\bcommentary\b/i,
  /\breaction\b/i,
  /\bpodcast\b/i,
  /\binterview\b/i,
  /解说|访谈|播客|reaction/
];

function buildIntentText(input: RecommendationSignalInput): string {
  return [
    input.title,
    input.sourceTitle,
    input.originalTitle,
    input.summary,
    input.reason,
    input.coachReason,
    ...input.useCases
  ]
    .filter(Boolean)
    .join(" ");
}

function countMatches(patterns: RegExp[], text: string): number {
  return patterns.reduce((sum, pattern) => sum + (pattern.test(text) ? 1 : 0), 0);
}

export function inferContentSourceQuality(url: string): "direct_source" | "search_link" | "unknown" {
  if (!url.trim()) {
    return "unknown";
  }

  if (SEARCH_LINK_PATTERNS.some((pattern) => pattern.test(url))) {
    return "search_link";
  }

  return /^https?:\/\//i.test(url) ? "direct_source" : "unknown";
}

export function inferContentTeachingIntent(input: RecommendationSignalInput): ContentTeachingIntent {
  const text = buildIntentText(input);
  const teachingScore = countMatches(TEACHING_PATTERNS, text);
  const matchScore = countMatches(MATCH_PATTERNS, text);
  const commentaryScore = countMatches(COMMENTARY_PATTERNS, text);

  if (teachingScore >= Math.max(matchScore, commentaryScore) && teachingScore > 0) {
    return "teaching";
  }

  if (matchScore > commentaryScore && matchScore > 0) {
    return "match_example";
  }

  if (commentaryScore > 0) {
    return "commentary";
  }

  return "general";
}

export function getRecommendationTrustSignals(input: RecommendationSignalInput): RecommendationTrustSignal[] {
  const signals: RecommendationTrustSignal[] = [];
  const sourceQuality = input.url ? inferContentSourceQuality(input.url) : "unknown";
  const teachingIntent = inferContentTeachingIntent(input);

  if (sourceQuality === "direct_source") {
    signals.push("direct_source");
  } else if (sourceQuality === "search_link") {
    signals.push("search_link");
  }

  if (teachingIntent === "teaching") {
    signals.push("teaching");
  } else if (teachingIntent === "match_example") {
    signals.push("match_example");
  } else if (teachingIntent === "commentary") {
    signals.push("commentary");
  }

  return signals;
}

function buildGuidanceAwareWhySelected(
  item: ContentItem,
  language: "zh" | "en",
  guidanceContext?: GuidanceContext
): string {
  const baseWhy = getContentCoachNote(item, language)?.trim() || item.reason.trim();
  if (!guidanceContext) {
    return baseWhy || getContentPrimaryTitle(item, language);
  }

  const narrative = buildAttachedRecommendationNarrative({
    item,
    guidanceContext,
    locale: language
  });

  return narrative.whySelected || baseWhy || getContentPrimaryTitle(item, language);
}

export function buildRecommendationDetails(
  item: ContentItem,
  language: "zh" | "en",
  guidanceContext?: GuidanceContext
): {
  whySelected: string;
  technicalPoint: string | null;
  trustSignals: RecommendationTrustSignal[];
} {
  const primaryTitle = getContentPrimaryTitle(item, language);
  const focusLine = getContentFocusLine(item, language)?.trim() || null;
  const whySelected = buildGuidanceAwareWhySelected(item, language, guidanceContext) || focusLine || primaryTitle;

  return {
    whySelected: canonicalizeTennisText(whySelected, language),
    technicalPoint: focusLine && focusLine !== primaryTitle
      ? canonicalizeTennisText(focusLine, language)
      : guidanceContext
        ? canonicalizeTennisText(buildAttachedRecommendationNarrative({
          item,
          guidanceContext,
          locale: language
        }).technicalPoint ?? "", language) || null
        : null,
    trustSignals: getRecommendationTrustSignals({
      title: item.title,
      sourceTitle: item.sourceTitle,
      originalTitle: item.originalTitle,
      summary: item.summary,
      reason: item.reason,
      coachReason: item.coachReason,
      useCases: item.useCases,
      url: item.url
    })
  };
}
