import { contents as defaultCuratedContents } from "@/data/contents";
import { contentQualityReviews as defaultQualityReviews } from "@/data/contentQualityReviews";
import { expandedContents as defaultExpandedContents } from "@/data/expandedContents";
import { inferContentSourceQuality, inferContentTeachingIntent } from "@/lib/content/recommendationSignals";
import type { ContentItem, ContentPlatform } from "@/types/content";
import type { CatalogContentItem, CatalogIngestionMethod, CatalogQualityReview } from "@/lib/content-catalog/schema";
import type { PlatformConnector } from "@/lib/platform-connectors/types";
import { bilibiliConnector } from "@/lib/platform-connectors/bilibili";
import { instagramConnector } from "@/lib/platform-connectors/instagram";
import { xiaohongshuConnector } from "@/lib/platform-connectors/xiaohongshu";
import { youtubeConnector } from "@/lib/platform-connectors/youtube";

const connectorByPlatform: Partial<Record<ContentPlatform, PlatformConnector>> = {
  Bilibili: bilibiliConnector,
  Instagram: instagramConnector,
  Xiaohongshu: xiaohongshuConnector,
  YouTube: youtubeConnector
};

function fallbackCanonicalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function fallbackRightsStatus(url: string): CatalogContentItem["rightsStatus"] {
  if (inferContentSourceQuality(url) === "search_link") {
    return "search_link";
  }

  return inferContentSourceQuality(url);
}

function getConnector(platform: ContentPlatform): PlatformConnector | null {
  return connectorByPlatform[platform] ?? null;
}

function inferCreatorHandle(creatorId: string): string | null {
  const normalized = creatorId.replace(/^creator_/, "").trim();
  return normalized.length > 0 ? normalized : null;
}

function resolveCanonicalUrl(item: ContentItem, connector: PlatformConnector | null): string {
  return connector?.canonicalizeUrl(item.url) ?? fallbackCanonicalizeUrl(item.url);
}

function resolveRightsStatus(
  item: ContentItem,
  connector: PlatformConnector | null
): CatalogContentItem["rightsStatus"] {
  if (!connector) {
    return fallbackRightsStatus(item.url);
  }

  const connectorRightsStatus = connector.inferRightsStatus(item.url);
  if (connectorRightsStatus !== "direct_source") {
    return connectorRightsStatus;
  }

  return connector.canonicalizeUrl(item.url) ? "direct_source" : "unknown";
}

function buildQualityScore(input: {
  ingestionMethod: CatalogIngestionMethod;
  rightsStatus: CatalogContentItem["rightsStatus"];
  qualityReview?: CatalogQualityReview;
}): number {
  const base = input.ingestionMethod === "curated" ? 90 : 72;
  const rightsAdjustment = input.rightsStatus === "direct_source"
    ? 10
    : input.rightsStatus === "search_link"
      ? -16
      : -24;
  const reviewAdjustment = getQualityReviewAdjustment(input.qualityReview);

  return base + rightsAdjustment + reviewAdjustment;
}

function getQualityReviewAdjustment(review?: CatalogQualityReview): number {
  if (!review) {
    return 0;
  }

  let adjustment = 0;

  if (review.reviewStatus === "verified" || review.reviewStatus === "manual_confirmed") {
    adjustment += 4;
  } else if (review.reviewStatus === "needs_review") {
    adjustment -= 4;
  } else if (review.reviewStatus === "suspect") {
    adjustment -= 12;
  } else if (review.reviewStatus === "rejected") {
    adjustment -= 24;
  }

  if (review.thumbnailStatus === "ok") {
    adjustment += 2;
  } else if (review.thumbnailStatus === "fallback") {
    adjustment -= 1;
  } else if (review.thumbnailStatus === "missing") {
    adjustment -= 4;
  } else if (review.thumbnailStatus === "broken") {
    adjustment -= 8;
  }

  if (typeof review.manualQcScore === "number" && Number.isFinite(review.manualQcScore)) {
    adjustment += Math.max(-2, Math.min(2, review.manualQcScore)) * 2;
  }

  return adjustment;
}

function buildQualityReviewMap(reviews: CatalogQualityReview[]): Map<string, CatalogQualityReview> {
  return new Map(reviews.map((review) => [review.contentId, review]));
}

function normalizeContentItem(
  item: ContentItem,
  ingestionMethod: CatalogIngestionMethod,
  qualityReviewMap: Map<string, CatalogQualityReview>
): CatalogContentItem {
  const connector = getConnector(item.platform);
  const canonicalUrl = resolveCanonicalUrl(item, connector);
  const rightsStatus = resolveRightsStatus(item, connector);
  const qualityReview = qualityReviewMap.get(item.id);
  const rawCreatorHandle = inferCreatorHandle(item.creatorId);
  const creatorHandle = rawCreatorHandle && connector?.normalizeCreatorHandle
    ? connector.normalizeCreatorHandle(rawCreatorHandle)
    : rawCreatorHandle;

  return {
    id: item.id,
    sourcePlatform: item.platform,
    canonicalUrl,
    creatorId: item.creatorId,
    creatorHandle,
    language: item.language,
    contentLanguage: item.contentLanguage,
    subtitleAvailability: item.subtitleAvailability,
    teachingIntent: inferContentTeachingIntent({
      title: item.title,
      sourceTitle: item.sourceTitle,
      originalTitle: item.originalTitle,
      summary: item.summary,
      reason: item.reason,
      coachReason: item.coachReason,
      useCases: item.useCases
    }),
    skillCategories: [...item.skills],
    problemTags: [...item.problemTags],
    levelRange: [...item.levels],
    mediaType: item.type,
    rightsStatus,
    qualityScore: buildQualityScore({ ingestionMethod, rightsStatus, qualityReview }),
    ingestionMethod,
    qualityReview,
    environment: item.environment,
    display: {
      title: item.title,
      sourceTitle: item.sourceTitle,
      originalTitle: item.originalTitle,
      summary: item.summary,
      reason: item.reason,
      coachReason: item.coachReason,
      useCases: [...item.useCases],
      thumbnail: item.thumbnail,
      duration: item.duration
    },
    sourceItem: item
  };
}

export function buildCatalogCorpus(input?: {
  curatedContents?: ContentItem[];
  expandedContents?: ContentItem[];
  qualityReviews?: CatalogQualityReview[];
}): CatalogContentItem[] {
  const combinedInput = input?.curatedContents;
  const explicitExpanded = input?.expandedContents;
  const qualityReviewMap = buildQualityReviewMap(input?.qualityReviews ?? defaultQualityReviews);
  const defaultExpandedIdSet = new Set(defaultExpandedContents.map((item) => item.id));
  const curated = explicitExpanded
    ? (combinedInput ?? defaultCuratedContents)
    : combinedInput
      ? combinedInput.filter((item) => !defaultExpandedIdSet.has(item.id))
      : defaultCuratedContents;
  const expanded = explicitExpanded
    ? explicitExpanded
    : combinedInput
      ? combinedInput.filter((item) => defaultExpandedIdSet.has(item.id))
      : defaultExpandedContents;

  return [
    ...curated.map((item) => normalizeContentItem(item, "curated", qualityReviewMap)),
    ...expanded.map((item) => normalizeContentItem(item, "expanded", qualityReviewMap))
  ];
}
