import { getTeachingMetadataByContentId } from "@/data/teachingMetadata";
import { buildCatalogCorpus } from "@/lib/content-catalog/normalize";
import type { CatalogContentItem, CatalogQualityReview } from "@/lib/content-catalog/schema";
import { DIAGNOSIS_CONTENT_PROBLEM_TAG_ALIASES } from "@/lib/diagnose/problemTagSupport";
import type { GuidanceContext, GuidanceMechanismFamily, GuidancePlanIntent, GuidanceStrokeFamily } from "@/lib/guidance-context/types";
import { canonicalizeTennisText } from "@/lib/i18n/tennisGlossary";
import {
  buildTeachingSearchText,
  inferActionabilityScore,
  inferDiagnosticDepthScore,
  inferSpecificityScore,
  inferTeachingMechanismFamily,
  inferTeachingRole,
  inferTeachingStrokeFamily
} from "@/lib/recommendations/attached/metadata";
import { buildTeachingRetrievalIntent } from "@/lib/recommendations/attached/intent";
import {
  packageAttachedRecommendations,
  type PackageableAttachedCandidate
} from "@/lib/recommendations/attached/package";
import type { PlanBlueprintRole } from "@/types/plan";
import type { ContentItem, ContentSubtitleAvailability } from "@/types/content";
import type {
  TeachingInstructionalRole,
  TeachingMetadata,
  TeachingRecommendationSlot,
  TeachingRetrievalIntent
} from "@/types/teachingRecommendation";

export type AttachedInstructionalRole = TeachingInstructionalRole;

export type AttachedRecommendationRequest = {
  source: "diagnosis" | "plan";
  guidanceContext: GuidanceContext;
  maxResults?: number;
  requiredIds?: string[];
  preferredIds?: string[];
  supportIds?: string[];
  lexicalTerms?: string[];
  stepRole?: PlanBlueprintRole;
  contentPool?: ContentItem[];
  expandedContentPool?: ContentItem[];
  qualityReviews?: CatalogQualityReview[];
};

export type AttachedRecommendationBreakdown = {
  exactPrimaryTagMatch: number;
  siblingTagMatch: number;
  mechanismFamilyMatch: number;
  strokeFamilyMatch: number;
  pinpoint: number;
  fixAlignment: number;
  causeAlignment: number;
  planIntentFit: number;
  roleFit: number;
  actionability: number;
  diagnosticDepth: number;
  specificity: number;
  trainingFocusFit: number;
  skillBandOverlap: number;
  languageFit: number;
  subtitleFit: number;
  creatorQualityScore: number;
  reviewStatus: number;
  freshness: number;
  linkHealth: number;
  thumbnailHealth: number;
  preferredSeed: number;
  trustCapAdjustment: number;
  crossPlatformDuplicatePenalty: number;
  sameCreatorPenalty: number;
};

export type AttachedRecommendation = {
  item: ContentItem;
  totalScore: number;
  role: AttachedInstructionalRole;
  slot: TeachingRecommendationSlot;
  duplicateClusterId: string;
  breakdown: AttachedRecommendationBreakdown;
};

type EligibleAttachedCandidate = {
  catalogItem: CatalogContentItem;
  metadata: TeachingMetadata | null;
  role: AttachedInstructionalRole;
  strokeFamily: GuidanceStrokeFamily;
  mechanismFamily: GuidanceMechanismFamily;
  duplicateClusterId: string;
  searchText: string;
};

type RankedAttachedCandidate = EligibleAttachedCandidate & {
  rawScore: number;
  totalScore: number;
  breakdown: AttachedRecommendationBreakdown;
};

const EXACT_PRIMARY_TAG_SCORE = 50;
const SIBLING_TAG_SCORE = 18;
const MECHANISM_FAMILY_SCORE = 24;
const STROKE_FAMILY_SCORE = 18;
const PINPOINT_SCORE = 18;
const FIX_ALIGNMENT_SCORE = 16;
const CAUSE_ALIGNMENT_SCORE = 14;
const PLAN_INTENT_SCORE = 16;
const ROLE_FIT_SCORE = 14;
const ACTIONABILITY_SCORE = 12;
const DIAGNOSTIC_DEPTH_SCORE = 10;
const SPECIFICITY_SCORE = 8;
const TRAINING_FOCUS_SCORE = 16;
const EXACT_SKILL_BAND_SCORE = 14;
const OVERLAP_SKILL_BAND_SCORE = 8;
const LANGUAGE_FIT_SCORE = 10;
const SUBTITLE_FIT_SCORE = 6;
const VERIFIED_REVIEW_SCORE = 12;
const LINK_HEALTH_SCORE = 10;
const TRUSTED_REVIEW_FALLBACK_LINK_SCORE = 6;
const THUMBNAIL_HEALTH_SCORE = 6;
const REQUIRED_SEED_SCORE = 80;
const SUPPORT_SEED_SCORE = 68;
const PREFERRED_SEED_SCORE = 36;
const SAME_CREATOR_PENALTY = 12;
const TRUSTED_REVIEW_STATUSES = new Set(["verified", "manual_confirmed"]);
const ROLE_PREFERENCE_SCORE = [ROLE_FIT_SCORE, 10, 6, 3];

const LEVEL_PREFERENCE_MAP: Record<string, string[]> = {
  "2.5": ["2.5", "3.0"],
  "3.0": ["2.5", "3.0"],
  "3.5": ["3.0", "3.5"],
  "4.0": ["3.5", "4.0", "4.0+"],
  "4.0+": ["4.0", "4.0+"]
};

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/_/g, " ").trim().toLowerCase() ?? "";
}

function normalizeTerms(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => normalizeText(value)).filter((value) => value.length >= 2)));
}

function isDirectSourceCandidate(item: CatalogContentItem): boolean {
  return item.mediaType === "video" && item.rightsStatus === "direct_source";
}

function hasTrustedReviewStatus(item: CatalogContentItem): boolean {
  const status = item.qualityReview?.reviewStatus;
  return Boolean(status && TRUSTED_REVIEW_STATUSES.has(status));
}

function isHealthyHttpStatus(status: number | undefined): boolean {
  return typeof status === "number" && status >= 200 && status < 400;
}

function isLocalStaticResource(item: CatalogContentItem): boolean {
  return item.canonicalUrl.startsWith("/") || item.sourceItem.url.startsWith("/");
}

function passesLinkHealthGate(item: CatalogContentItem): boolean {
  if (isLocalStaticResource(item)) {
    return true;
  }

  if (typeof item.qualityReview?.httpStatus === "number") {
    return isHealthyHttpStatus(item.qualityReview.httpStatus);
  }

  return hasTrustedReviewStatus(item);
}

function passesThumbnailHealthGate(item: CatalogContentItem): boolean {
  if (!item.display.thumbnail) {
    return false;
  }

  return item.qualityReview?.thumbnailStatus !== "broken" && item.qualityReview?.thumbnailStatus !== "missing";
}

function hasZhSubtitles(subtitleAvailability?: ContentSubtitleAvailability): boolean {
  return subtitleAvailability === "zh" || subtitleAvailability === "zh_en";
}

function hasEnSubtitles(subtitleAvailability?: ContentSubtitleAvailability): boolean {
  return subtitleAvailability === "english" || subtitleAvailability === "zh_en" || subtitleAvailability === "not_needed";
}

function isLanguageUsable(item: CatalogContentItem, preference: GuidanceContext["languagePreference"]): boolean {
  if (preference === "zh") {
    return item.language === "zh" || item.contentLanguage === "zh" || hasZhSubtitles(item.subtitleAvailability);
  }

  return item.language === "en" || item.contentLanguage === "en" || hasEnSubtitles(item.subtitleAvailability);
}

function isSkillBandCompatible(item: CatalogContentItem, skillBand: GuidanceContext["skillBand"]): boolean {
  const preferredLevels = LEVEL_PREFERENCE_MAP[skillBand] ?? [skillBand];
  return item.levelRange.includes(skillBand) || item.levelRange.some((level) => preferredLevels.includes(level));
}

function normalizeDuplicateClusterText(item: CatalogContentItem): string {
  return normalizeText(item.qualityReview?.remoteTitle || item.display.sourceTitle || item.display.title)
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .trim();
}

export function buildAttachedDuplicateClusterId(item: CatalogContentItem): string {
  if (item.qualityReview?.duplicateClusterId) {
    return item.qualityReview.duplicateClusterId;
  }

  const titleKey = normalizeDuplicateClusterText(item);
  if (titleKey.length >= 8) {
    return `${titleKey}::${item.problemTags[0] ?? "general"}`;
  }

  return item.canonicalUrl;
}

function buildCrossPlatformClusterMap(items: CatalogContentItem[]): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();

  for (const item of items) {
    const clusterId = buildAttachedDuplicateClusterId(item);
    const platforms = map.get(clusterId) ?? new Set<string>();
    platforms.add(item.sourcePlatform);
    map.set(clusterId, platforms);
  }

  return map;
}

function overlapCount(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return left.reduce((sum, value) => sum + (rightSet.has(value) ? 1 : 0), 0);
}

function countSearchTextHits(searchText: string, terms: string[]): number {
  return terms.reduce((sum, term) => sum + (searchText.includes(term) ? 1 : 0), 0);
}

function hasRelevantTagFamily(item: CatalogContentItem, intent: TeachingRetrievalIntent): boolean {
  const expandedItemTags = new Set(
    item.problemTags.flatMap((tag) => [tag, ...(DIAGNOSIS_CONTENT_PROBLEM_TAG_ALIASES[tag] ?? [])])
  );

  return expandedItemTags.has(intent.primaryProblemTag)
    || intent.secondaryProblemTags.some((tag) => expandedItemTags.has(tag));
}

function scoreSkillBandOverlap(item: CatalogContentItem, skillBand: GuidanceContext["skillBand"]): number {
  if (item.levelRange.includes(skillBand)) {
    return EXACT_SKILL_BAND_SCORE;
  }

  const preferredLevels = LEVEL_PREFERENCE_MAP[skillBand] ?? [skillBand];
  return item.levelRange.some((level) => preferredLevels.includes(level)) ? OVERLAP_SKILL_BAND_SCORE : 0;
}

function scoreLanguageFit(item: CatalogContentItem, preference: GuidanceContext["languagePreference"]): number {
  if (preference === "zh") {
    return item.language === "zh" || item.contentLanguage === "zh"
      ? LANGUAGE_FIT_SCORE
      : hasZhSubtitles(item.subtitleAvailability)
        ? 6
        : 0;
  }

  return item.language === "en" || item.contentLanguage === "en"
    ? LANGUAGE_FIT_SCORE
    : hasEnSubtitles(item.subtitleAvailability)
      ? 6
      : 0;
}

function scoreSubtitleFit(item: CatalogContentItem, preference: GuidanceContext["languagePreference"]): number {
  if (preference === "zh") {
    return hasZhSubtitles(item.subtitleAvailability) ? SUBTITLE_FIT_SCORE : 0;
  }

  return hasEnSubtitles(item.subtitleAvailability) ? SUBTITLE_FIT_SCORE : 0;
}

function scoreCreatorQuality(item: CatalogContentItem): number {
  const reviewScore = typeof item.qualityReview?.manualQcScore === "number"
    ? Math.max(-2, Math.min(2, item.qualityReview.manualQcScore)) + 2
    : item.ingestionMethod === "curated"
      ? 3
      : 2;

  return Math.min(10, Math.max(0, reviewScore * 2));
}

function scoreReviewStatus(item: CatalogContentItem): number {
  return hasTrustedReviewStatus(item) ? VERIFIED_REVIEW_SCORE : 0;
}

function scoreLinkHealth(item: CatalogContentItem): number {
  if (isLocalStaticResource(item)) {
    return LINK_HEALTH_SCORE;
  }

  if (typeof item.qualityReview?.httpStatus === "number") {
    return isHealthyHttpStatus(item.qualityReview.httpStatus) ? LINK_HEALTH_SCORE : 0;
  }

  return hasTrustedReviewStatus(item) ? TRUSTED_REVIEW_FALLBACK_LINK_SCORE : 0;
}

function scoreThumbnailHealth(item: CatalogContentItem): number {
  if (item.qualityReview?.thumbnailStatus === "ok") {
    return THUMBNAIL_HEALTH_SCORE;
  }
  if (item.display.thumbnail) {
    return THUMBNAIL_HEALTH_SCORE - 1;
  }
  return 0;
}

function scoreFreshness(item: CatalogContentItem): number {
  const lastVerifiedAt = item.qualityReview?.lastVerifiedAt;
  if (!lastVerifiedAt) {
    return 0;
  }

  const ageInDays = (Date.now() - new Date(lastVerifiedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays <= 14) {
    return 4;
  }
  if (ageInDays <= 60) {
    return 2;
  }
  return 0;
}

function scorePlanIntentFit(
  role: AttachedInstructionalRole,
  guidanceContext: GuidanceContext,
  stepRole?: PlanBlueprintRole
): number {
  const intent = guidanceContext.planIntent;

  if (stepRole === "review_reset" && (role === "explanation" || role === "mental")) {
    return PLAN_INTENT_SCORE;
  }
  if (stepRole === "pressure_repetition" && (role === "drill" || role === "mental")) {
    return PLAN_INTENT_SCORE;
  }
  if (stepRole === "transfer" && (role === "tactic" || role === "explanation")) {
    return PLAN_INTENT_SCORE;
  }

  if (intent === "stabilize_under_pressure" && (role === "mental" || role === "drill")) return PLAN_INTENT_SCORE;
  if (intent === "arrive_earlier" && (role === "primary_fix" || role === "drill")) return PLAN_INTENT_SCORE;
  if (intent === "organize_tactics" && (role === "tactic" || role === "explanation")) return PLAN_INTENT_SCORE;
  if (intent === "rebuild_mechanics" && (role === "primary_fix" || role === "explanation" || role === "drill")) return PLAN_INTENT_SCORE;
  if (intent === "stabilize_primary_pattern" && (role === "primary_fix" || role === "drill" || role === "explanation")) return 14;
  if (intent === "assessment_priority" && (role === "primary_fix" || role === "explanation")) return 12;

  if (role === "explanation" || role === "drill") {
    return 8;
  }

  return 0;
}

function scoreRoleFit(role: AttachedInstructionalRole, intent: TeachingRetrievalIntent): number {
  const roleIndex = intent.preferredRoles.indexOf(role);
  if (roleIndex === -1) {
    return role === "explanation" ? 4 : 0;
  }

  return ROLE_PREFERENCE_SCORE[Math.min(roleIndex, ROLE_PREFERENCE_SCORE.length - 1)] ?? 0;
}

function scoreTrainingFocusFit(candidate: EligibleAttachedCandidate, intent: TeachingRetrievalIntent): number {
  const focusTerms = normalizeTerms([
    intent.trainingFocus,
    intent.planIntent.replace(/_/g, " "),
    ...intent.symptomTerms,
    ...intent.contextTerms
  ]).filter((term) => term.length >= 3);
  const hitCount = countSearchTextHits(candidate.searchText, focusTerms);

  return Math.min(TRAINING_FOCUS_SCORE, hitCount * 4);
}

function scorePinpoint(candidate: EligibleAttachedCandidate, intent: TeachingRetrievalIntent): number {
  const intentTerms = normalizeTerms([
    intent.primaryProblemTag,
    ...intent.secondaryProblemTags,
    ...intent.symptomTerms
  ]);
  const metadataTerms = normalizeTerms(candidate.metadata?.symptomTags ?? []);
  const metadataHitCount = overlapCount(metadataTerms, intentTerms);

  if (metadataHitCount > 0) {
    return Math.min(
      PINPOINT_SCORE,
      metadataHitCount * 8 + (candidate.catalogItem.problemTags.includes(intent.primaryProblemTag) ? 2 : 0)
    );
  }

  const textHitCount = countSearchTextHits(candidate.searchText, intentTerms);
  return Math.min(PINPOINT_SCORE, textHitCount * 3 + (candidate.catalogItem.problemTags.includes(intent.primaryProblemTag) ? 2 : 0));
}

function scoreFixAlignment(candidate: EligibleAttachedCandidate, intent: TeachingRetrievalIntent): number {
  const candidateFixTerms = normalizeTerms([
    ...candidate.metadata?.fixTags ?? [],
    ...candidate.metadata?.drillTags ?? []
  ]);
  const intentFixTerms = normalizeTerms([
    ...intent.fixTargets,
    ...intent.drillTargets,
    intent.trainingFocus
  ]);
  const metadataHitCount = overlapCount(candidateFixTerms, intentFixTerms);

  if (metadataHitCount > 0) {
    return Math.min(FIX_ALIGNMENT_SCORE, metadataHitCount * 6);
  }

  const textHitCount = countSearchTextHits(candidate.searchText, intentFixTerms);
  return Math.min(FIX_ALIGNMENT_SCORE, textHitCount * 2);
}

function scoreCauseAlignment(candidate: EligibleAttachedCandidate, intent: TeachingRetrievalIntent): number {
  const candidateCauseTerms = normalizeTerms(candidate.metadata?.causeTags ?? []);
  const intentCauseTerms = normalizeTerms([
    ...intent.causeCandidates,
    intent.mechanismFamily,
    intent.strokeFamily
  ]);
  const metadataHitCount = overlapCount(candidateCauseTerms, intentCauseTerms);

  if (metadataHitCount > 0) {
    return Math.min(CAUSE_ALIGNMENT_SCORE, metadataHitCount * 6);
  }

  const textHitCount = countSearchTextHits(candidate.searchText, intentCauseTerms);
  return Math.min(CAUSE_ALIGNMENT_SCORE, textHitCount * 2);
}

function buildTrustCapAdjustment(item: CatalogContentItem, rawScore: number): number {
  if (isLocalStaticResource(item)) {
    return 0;
  }

  const fullCap = typeof item.qualityReview?.httpStatus === "number" && isHealthyHttpStatus(item.qualityReview.httpStatus)
    && item.qualityReview?.thumbnailStatus === "ok";
  if (fullCap) {
    return 0;
  }

  const cap = typeof item.qualityReview?.httpStatus === "number" && isHealthyHttpStatus(item.qualityReview.httpStatus)
    ? 188
    : 176;

  return rawScore > cap ? cap - rawScore : 0;
}

function buildBaseBreakdown(input: {
  candidate: EligibleAttachedCandidate;
  intent: TeachingRetrievalIntent;
  requiredOrder: Map<string, number>;
  supportOrder: Map<string, number>;
  preferredOrder: Map<string, number>;
  crossPlatformDuplicatePenalty: number;
  stepRole?: PlanBlueprintRole;
}): AttachedRecommendationBreakdown {
  const { candidate, intent } = input;
  const exactPrimaryTagMatch = candidate.catalogItem.problemTags.includes(intent.primaryProblemTag)
    ? EXACT_PRIMARY_TAG_SCORE
    : 0;
  const siblingTagMatch = intent.secondaryProblemTags.some((tag) => candidate.catalogItem.problemTags.includes(tag))
    ? SIBLING_TAG_SCORE
    : 0;
  const mechanismFamilyMatch = candidate.mechanismFamily === intent.mechanismFamily
    ? MECHANISM_FAMILY_SCORE
    : 0;
  const strokeFamilyMatch = candidate.strokeFamily === intent.strokeFamily
    ? STROKE_FAMILY_SCORE
    : 0;
  const pinpoint = scorePinpoint(candidate, intent);
  const fixAlignment = scoreFixAlignment(candidate, intent);
  const causeAlignment = scoreCauseAlignment(candidate, intent);
  const planIntentFit = scorePlanIntentFit(candidate.role, intent.guidanceContext, input.stepRole);
  const roleFit = scoreRoleFit(candidate.role, intent);
  const actionability = Math.round(inferActionabilityScore(candidate.catalogItem, candidate.metadata) * ACTIONABILITY_SCORE);
  const diagnosticDepth = Math.round(inferDiagnosticDepthScore(candidate.catalogItem, candidate.metadata) * DIAGNOSTIC_DEPTH_SCORE);
  const specificity = Math.round(inferSpecificityScore(candidate.catalogItem, candidate.metadata) * SPECIFICITY_SCORE);
  const trainingFocusFit = scoreTrainingFocusFit(candidate, intent);
  const skillBandOverlap = scoreSkillBandOverlap(candidate.catalogItem, intent.skillBand);
  const languageFit = scoreLanguageFit(candidate.catalogItem, intent.languagePreference);
  const subtitleFit = scoreSubtitleFit(candidate.catalogItem, intent.languagePreference);
  const creatorQualityScore = scoreCreatorQuality(candidate.catalogItem);
  const reviewStatus = scoreReviewStatus(candidate.catalogItem);
  const freshness = scoreFreshness(candidate.catalogItem);
  const linkHealth = scoreLinkHealth(candidate.catalogItem);
  const thumbnailHealth = scoreThumbnailHealth(candidate.catalogItem);
  const preferredSeed = input.requiredOrder.has(candidate.catalogItem.id)
    ? Math.max(0, REQUIRED_SEED_SCORE - ((input.requiredOrder.get(candidate.catalogItem.id) ?? 0) * 18))
    : input.supportOrder.has(candidate.catalogItem.id)
      ? Math.max(0, SUPPORT_SEED_SCORE - ((input.supportOrder.get(candidate.catalogItem.id) ?? 0) * 4))
      : input.preferredOrder.has(candidate.catalogItem.id)
        ? Math.max(0, PREFERRED_SEED_SCORE - ((input.preferredOrder.get(candidate.catalogItem.id) ?? 0) * 4))
        : 0;

  return {
    exactPrimaryTagMatch,
    siblingTagMatch,
    mechanismFamilyMatch,
    strokeFamilyMatch,
    pinpoint,
    fixAlignment,
    causeAlignment,
    planIntentFit,
    roleFit,
    actionability,
    diagnosticDepth,
    specificity,
    trainingFocusFit,
    skillBandOverlap,
    languageFit,
    subtitleFit,
    creatorQualityScore,
    reviewStatus,
    freshness,
    linkHealth,
    thumbnailHealth,
    preferredSeed,
    trustCapAdjustment: 0,
    crossPlatformDuplicatePenalty: input.crossPlatformDuplicatePenalty,
    sameCreatorPenalty: 0
  };
}

function sumBreakdown(breakdown: AttachedRecommendationBreakdown): number {
  return Object.values(breakdown).reduce((sum, value) => sum + value, 0);
}

function buildEligibleCandidatePool(request: AttachedRecommendationRequest): {
  eligibleCandidates: EligibleAttachedCandidate[];
  intent: TeachingRetrievalIntent;
} {
  const intent = buildTeachingRetrievalIntent(request);
  const seedIds = new Set([...intent.requiredIds, ...intent.preferredIds, ...intent.supportIds]);
  const catalog = buildCatalogCorpus({
    curatedContents: request.contentPool,
    expandedContents: request.expandedContentPool,
    qualityReviews: request.qualityReviews
  });

  const eligibleCandidates = catalog
    .filter((item) =>
      isDirectSourceCandidate(item)
      && hasTrustedReviewStatus(item)
      && passesLinkHealthGate(item)
      && passesThumbnailHealthGate(item)
      && isSkillBandCompatible(item, intent.skillBand)
      && isLanguageUsable(item, intent.languagePreference)
    )
    .map((item) => {
      const metadata = getTeachingMetadataByContentId(item.id);
      return {
        catalogItem: item,
        metadata,
        role: inferTeachingRole(item, metadata),
        strokeFamily: inferTeachingStrokeFamily(item, metadata),
        mechanismFamily: inferTeachingMechanismFamily(item, metadata),
        duplicateClusterId: buildAttachedDuplicateClusterId(item),
        searchText: buildTeachingSearchText(item, metadata)
      };
    })
    .filter((candidate) => {
      if (seedIds.has(candidate.catalogItem.id)) {
        return true;
      }

      const metadataTerms = normalizeTerms([
        ...candidate.metadata?.symptomTags ?? [],
        ...candidate.metadata?.causeTags ?? [],
        ...candidate.metadata?.fixTags ?? [],
        ...candidate.metadata?.drillTags ?? [],
        ...candidate.metadata?.contextTags ?? []
      ]);
      const intentTerms = normalizeTerms([
        ...intent.symptomTerms,
        ...intent.causeCandidates,
        ...intent.fixTargets,
        ...intent.drillTargets,
        ...intent.contextTerms
      ]);

      return hasRelevantTagFamily(candidate.catalogItem, intent)
        || candidate.strokeFamily === intent.strokeFamily
        || candidate.mechanismFamily === intent.mechanismFamily
        || overlapCount(metadataTerms, intentTerms) > 0
        || intentTerms.some((term) => candidate.searchText.includes(term));
    });

  return { eligibleCandidates, intent };
}

function scoreEligibleCandidatePool(
  eligibleCandidates: EligibleAttachedCandidate[],
  request: AttachedRecommendationRequest,
  intent: TeachingRetrievalIntent
): RankedAttachedCandidate[] {
  const requiredOrder = new Map((request.requiredIds ?? []).map((id, index) => [id, index]));
  const supportOrder = new Map((request.supportIds ?? []).map((id, index) => [id, index]));
  const preferredOrder = new Map((request.preferredIds ?? []).map((id, index) => [id, index]));
  const clusterMap = buildCrossPlatformClusterMap(eligibleCandidates.map((candidate) => candidate.catalogItem));

  return eligibleCandidates
    .map((candidate) => {
      const crossPlatformDuplicatePenalty = (clusterMap.get(candidate.duplicateClusterId)?.size ?? 0) > 1 ? -8 : 0;
      const baseBreakdown = buildBaseBreakdown({
        candidate,
        intent,
        requiredOrder,
        supportOrder,
        preferredOrder,
        crossPlatformDuplicatePenalty,
        stepRole: request.stepRole
      });
      const rawScore = sumBreakdown(baseBreakdown);
      const trustCapAdjustment = buildTrustCapAdjustment(candidate.catalogItem, rawScore);
      const breakdown = {
        ...baseBreakdown,
        trustCapAdjustment
      };

      return {
        ...candidate,
        rawScore,
        totalScore: rawScore + trustCapAdjustment,
        breakdown
      };
    })
    .sort((left, right) => {
      if (right.totalScore !== left.totalScore) {
        return right.totalScore - left.totalScore;
      }

      if (right.catalogItem.qualityScore !== left.catalogItem.qualityScore) {
        return right.catalogItem.qualityScore - left.catalogItem.qualityScore;
      }

      return left.catalogItem.id.localeCompare(right.catalogItem.id);
    });
}

function selectBestRequiredCandidate(
  candidates: RankedAttachedCandidate[],
  requiredIds: string[],
  selected: RankedAttachedCandidate[]
): RankedAttachedCandidate | null {
  if (requiredIds.length === 0) {
    return null;
  }

  const candidateById = new Map(candidates.map((candidate) => [candidate.catalogItem.id, candidate]));
  const selectedClusters = new Set(selected.map((candidate) => candidate.duplicateClusterId));

  for (const requiredId of requiredIds) {
    const candidate = candidateById.get(requiredId);
    if (!candidate) {
      continue;
    }
    if (selected.some((entry) => entry.catalogItem.id === candidate.catalogItem.id)) {
      continue;
    }
    if (selectedClusters.has(candidate.duplicateClusterId)) {
      continue;
    }

    return candidate;
  }

  return null;
}

function selectBestRoleCandidate(
  candidates: RankedAttachedCandidate[],
  role: AttachedInstructionalRole,
  selected: RankedAttachedCandidate[]
): RankedAttachedCandidate | null {
  const selectedCreators = new Set(selected.map((candidate) => candidate.catalogItem.creatorId));
  const selectedClusters = new Set(selected.map((candidate) => candidate.duplicateClusterId));

  for (const candidate of candidates) {
    if (candidate.role !== role) {
      continue;
    }
    if (selectedClusters.has(candidate.duplicateClusterId)) {
      continue;
    }
    if (
      selectedCreators.has(candidate.catalogItem.creatorId)
      && candidates.some((entry) => entry.role === role && !selectedCreators.has(entry.catalogItem.creatorId))
    ) {
      continue;
    }

    return candidate;
  }

  return null;
}

function selectBestSupportCandidate(
  candidates: RankedAttachedCandidate[],
  supportIds: string[],
  selected: RankedAttachedCandidate[]
): RankedAttachedCandidate | null {
  if (supportIds.length === 0) {
    return null;
  }

  const candidateById = new Map(candidates.map((candidate) => [candidate.catalogItem.id, candidate]));
  const selectedCreators = new Set(selected.map((candidate) => candidate.catalogItem.creatorId));
  const selectedClusters = new Set(selected.map((candidate) => candidate.duplicateClusterId));

  for (const supportId of supportIds) {
    const candidate = candidateById.get(supportId);
    if (!candidate) {
      continue;
    }
    if (selected.some((entry) => entry.catalogItem.id === candidate.catalogItem.id)) {
      continue;
    }
    if (selectedClusters.has(candidate.duplicateClusterId)) {
      continue;
    }
    if (
      selectedCreators.has(candidate.catalogItem.creatorId)
      && candidates.some((entry) => supportIds.includes(entry.catalogItem.id) && !selectedCreators.has(entry.catalogItem.creatorId))
    ) {
      continue;
    }

    return candidate;
  }

  return null;
}

function rerankCandidates(
  candidates: RankedAttachedCandidate[],
  request: AttachedRecommendationRequest,
  intent: TeachingRetrievalIntent
): RankedAttachedCandidate[] {
  const maxResults = request.maxResults ?? 3;
  const selected: RankedAttachedCandidate[] = [];
  const creatorUsage = new Map<string, number>();
  const selectedClusters = new Set<string>();
  const supportIdSet = new Set(request.supportIds ?? []);

  const requiredCandidate = selectBestRequiredCandidate(candidates, request.requiredIds ?? [], selected);
  if (requiredCandidate) {
    selected.push(requiredCandidate);
    selectedClusters.add(requiredCandidate.duplicateClusterId);
    creatorUsage.set(requiredCandidate.catalogItem.creatorId, 1);
  }

  const roleSeedLimit = Math.min(maxResults, 3);
  const roleCandidates = intent.preferredRoles.filter(
    (role, index, list) =>
      list.indexOf(role) === index && candidates.some((candidate) => candidate.role === role)
  );

  for (const role of roleCandidates) {
    if (selected.length >= roleSeedLimit) {
      break;
    }

    const picked = selectBestRoleCandidate(candidates, role, selected);
    if (picked && !selectedClusters.has(picked.duplicateClusterId)) {
      selected.push(picked);
      selectedClusters.add(picked.duplicateClusterId);
      creatorUsage.set(picked.catalogItem.creatorId, (creatorUsage.get(picked.catalogItem.creatorId) ?? 0) + 1);
    }
  }

  if (selected.length < roleSeedLimit) {
    const supportCandidate = selectBestSupportCandidate(candidates, request.supportIds ?? [], selected);
    if (supportCandidate && !selectedClusters.has(supportCandidate.duplicateClusterId)) {
      selected.push(supportCandidate);
      selectedClusters.add(supportCandidate.duplicateClusterId);
      creatorUsage.set(
        supportCandidate.catalogItem.creatorId,
        (creatorUsage.get(supportCandidate.catalogItem.creatorId) ?? 0) + 1
      );
    }
  }

  for (const candidate of candidates) {
    if (selected.length >= maxResults) {
      break;
    }
    if (selected.some((entry) => entry.catalogItem.id === candidate.catalogItem.id)) {
      continue;
    }
    if (selectedClusters.has(candidate.duplicateClusterId)) {
      continue;
    }

    const sameCreatorPenalty = (creatorUsage.get(candidate.catalogItem.creatorId) ?? 0) * SAME_CREATOR_PENALTY;
    const adjustedCandidate = {
      ...candidate,
      totalScore: candidate.totalScore - sameCreatorPenalty,
      breakdown: {
        ...candidate.breakdown,
        sameCreatorPenalty: -sameCreatorPenalty
      }
    };

    if (selected.length < 2) {
      const creatorCountAvailable = new Set(candidates.map((entry) => entry.catalogItem.creatorId)).size;
      if (creatorCountAvailable >= 2 && (creatorUsage.get(candidate.catalogItem.creatorId) ?? 0) > 0) {
        continue;
      }
    }

    selected.push(adjustedCandidate);
    selectedClusters.add(adjustedCandidate.duplicateClusterId);
    creatorUsage.set(
      adjustedCandidate.catalogItem.creatorId,
      (creatorUsage.get(adjustedCandidate.catalogItem.creatorId) ?? 0) + 1
    );
  }

  if (selected.length === 0) {
    return [];
  }

  const topScore = selected[0].totalScore;
  const minimumScore = topScore >= 110 ? topScore - 34 : topScore >= 84 ? topScore - 26 : topScore >= 60 ? topScore - 18 : topScore;

  return selected
    .filter((candidate, index) =>
      index === 0
      || candidate.totalScore >= minimumScore
      || candidate.breakdown.preferredSeed > 0
      || supportIdSet.has(candidate.catalogItem.id)
    )
    .slice(0, maxResults);
}

export function recommendAttachedVideos(request: AttachedRecommendationRequest): AttachedRecommendation[] {
  const { eligibleCandidates, intent } = buildEligibleCandidatePool(request);
  const rankedCandidates = scoreEligibleCandidatePool(eligibleCandidates, request, intent);
  const reranked = rerankCandidates(rankedCandidates, request, intent);
  const packaged = packageAttachedRecommendations<AttachedRecommendationBreakdown>(
    reranked.map((candidate) => ({
      item: candidate.catalogItem.sourceItem,
      role: candidate.role,
      duplicateClusterId: candidate.duplicateClusterId,
      mechanismFamily: candidate.mechanismFamily,
      totalScore: candidate.totalScore,
      breakdown: candidate.breakdown
    })),
    {
      intentMechanismFamily: intent.mechanismFamily
    }
  );

  return packaged.map((candidate) => ({
    item: candidate.item,
    totalScore: candidate.totalScore,
    role: candidate.role,
    slot: candidate.slot,
    duplicateClusterId: candidate.duplicateClusterId,
    breakdown: candidate.breakdown
  }));
}

function getRoleLabel(role: AttachedInstructionalRole, locale: "zh" | "en"): string {
  if (locale === "en") {
    if (role === "primary_fix") return "fix-first";
    if (role === "drill") return "practice-first";
    if (role === "tactic") return "decision-first";
    if (role === "warmup") return "warm-up";
    if (role === "mental") return "pressure-management";
    return "explanation-first";
  }

  if (role === "primary_fix") return "主修正式";
  if (role === "drill") return "练习型";
  if (role === "tactic") return "战术型";
  if (role === "warmup") return "热身型";
  if (role === "mental") return "压力管理型";
  return "解释型";
}

function getMechanismLabel(mechanismFamily: GuidanceMechanismFamily, locale: "zh" | "en"): string {
  const zh: Record<GuidanceMechanismFamily, string> = {
    contact_window: "击球点",
    rhythm: "节奏",
    spacing: "站位距离",
    pressure_regulation: "压力下执行",
    positioning: "站位",
    decision: "决策",
    recovery: "脚步回位",
    shape_control: "动作形状"
  };
  const en: Record<GuidanceMechanismFamily, string> = {
    contact_window: "contact point",
    rhythm: "rhythm",
    spacing: "spacing",
    pressure_regulation: "pressure execution",
    positioning: "positioning",
    decision: "decision-making",
    recovery: "recovery footwork",
    shape_control: "swing shape"
  };

  return locale === "en" ? en[mechanismFamily] : zh[mechanismFamily];
}

function getPlanIntentLabel(planIntent: GuidancePlanIntent, locale: "zh" | "en"): string {
  const zh: Record<GuidancePlanIntent, string> = {
    assessment_priority: "先抓当前优先项",
    stabilize_primary_pattern: "先把主动作稳住",
    stabilize_under_pressure: "把动作带进压力下",
    arrive_earlier: "先解决准备偏晚",
    rebuild_mechanics: "先重建动作机制",
    organize_tactics: "先把出手选择理顺"
  };
  const en: Record<GuidancePlanIntent, string> = {
    assessment_priority: "prioritize the current weakness",
    stabilize_primary_pattern: "stabilize the primary pattern",
    stabilize_under_pressure: "hold the pattern under pressure",
    arrive_earlier: "arrive earlier to the ball",
    rebuild_mechanics: "rebuild the mechanics",
    organize_tactics: "organize the decision pattern"
  };

  return locale === "en" ? en[planIntent] : zh[planIntent];
}

export function buildAttachedRecommendationNarrative(input: {
  item: ContentItem;
  guidanceContext: GuidanceContext;
  locale: "zh" | "en";
  stepRole?: PlanBlueprintRole;
}): {
  whySelected: string;
  technicalPoint: string | null;
  roleLabel: string;
} {
  const catalogItem = buildCatalogCorpus({
    curatedContents: [input.item],
    expandedContents: []
  })[0];
  const metadata = getTeachingMetadataByContentId(input.item.id);
  const role = inferTeachingRole(catalogItem, metadata);
  const mechanismFamily = inferTeachingMechanismFamily(catalogItem, metadata);
  const primaryMatch = catalogItem.problemTags.includes(input.guidanceContext.primaryProblemTag);
  const siblingMatch = input.guidanceContext.secondaryProblemTags.some((tag) => catalogItem.problemTags.includes(tag));
  const matchLabel = primaryMatch
    ? input.locale === "en" ? "directly targets the current primary problem" : "直接对准当前主问题"
    : siblingMatch
      ? input.locale === "en" ? "stays inside the same problem family" : "仍然落在同一问题家族"
      : input.locale === "en" ? "supports the same training direction" : "和当前训练主线一致";
  const roleLabel = getRoleLabel(role, input.locale);
  const mechanismLabel = getMechanismLabel(mechanismFamily, input.locale);
  const planIntentLabel = getPlanIntentLabel(input.guidanceContext.planIntent, input.locale);

  if (input.locale === "en") {
    return {
      whySelected: canonicalizeTennisText(
        `This ${roleLabel} video ${matchLabel} and keeps the emphasis on ${mechanismLabel}. It supports the plan intent to ${planIntentLabel}.`,
        input.locale
      ),
      technicalPoint: input.stepRole
        ? canonicalizeTennisText(`Best used on the ${input.stepRole.replace(/_/g, " ")} step.`, input.locale)
        : canonicalizeTennisText(`Use it to reinforce "${input.guidanceContext.trainingFocus}".`, input.locale),
      roleLabel
    };
  }

  return {
    whySelected: canonicalizeTennisText(
      `这条${roleLabel}内容${matchLabel}，重点也放在${mechanismLabel}上。它和“${planIntentLabel}”这条计划意图保持一致。`,
      input.locale
    ),
    technicalPoint: input.stepRole
      ? canonicalizeTennisText(`更适合挂在“${input.stepRole.replace(/_/g, " ")}”这一步。`, input.locale)
      : canonicalizeTennisText(`可直接围绕“${input.guidanceContext.trainingFocus}”来使用。`, input.locale),
    roleLabel
  };
}
