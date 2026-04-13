import type { ContentItem, ContentLanguageCode, ContentPlatform, ContentSubtitleAvailability, ContentType } from "@/types/content";
import type { ContentTeachingIntent } from "@/lib/content/recommendationSignals";
import type { EnvironmentValue } from "@/types/environment";
import type { ProblemTag } from "@/types/problemTag";

export type CatalogRightsStatus = "direct_source" | "search_link" | "unknown";
export type CatalogIngestionMethod = "curated" | "expanded";
export type CatalogReviewStatus = "verified" | "needs_review" | "suspect" | "rejected";
export type CatalogThumbnailStatus = "ok" | "fallback" | "missing" | "broken" | "unknown";

export type CatalogQualityReview = {
  contentId: string;
  reviewStatus: CatalogReviewStatus;
  thumbnailStatus?: CatalogThumbnailStatus;
  lastVerifiedAt?: string;
  httpStatus?: number;
  remoteTitle?: string;
  remoteDescriptionExcerpt?: string;
  metadataSimilarityScore?: number;
  manualQcScore?: number;
  duplicateClusterId?: string;
  verifiedBy?: string;
};

export type CatalogContentItem = {
  id: string;
  sourcePlatform: ContentPlatform;
  canonicalUrl: string;
  creatorId: string;
  creatorHandle: string | null;
  language: ContentLanguageCode;
  contentLanguage?: ContentLanguageCode;
  subtitleAvailability?: ContentSubtitleAvailability;
  teachingIntent: ContentTeachingIntent;
  skillCategories: string[];
  problemTags: ProblemTag[];
  levelRange: string[];
  mediaType: ContentType;
  rightsStatus: CatalogRightsStatus;
  qualityScore: number;
  ingestionMethod: CatalogIngestionMethod;
  qualityReview?: CatalogQualityReview;
  environment?: EnvironmentValue;
  display: {
    title: string;
    sourceTitle?: string;
    originalTitle?: string;
    summary: string;
    reason: string;
    coachReason: string;
    useCases: string[];
    thumbnail?: string;
    duration?: string;
  };
  sourceItem: ContentItem;
};

export type CatalogRecommendationIntent = {
  source: "diagnosis" | "plan";
  problemTags?: ProblemTag[];
  skillCategories?: string[];
  lexicalTerms?: string[];
  level?: string;
  environment?: "testing" | "production";
  maxResults: number;
  requiredIds?: string[];
  preferredIds?: string[];
  allowedRights?: CatalogRightsStatus[];
  contentPool?: ContentItem[];
  expandedContentPool?: ContentItem[];
};
