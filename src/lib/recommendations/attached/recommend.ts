import { buildCatalogCorpus } from "@/lib/content-catalog/normalize";
import type { CatalogContentItem, CatalogQualityReview } from "@/lib/content-catalog/schema";
import { DIAGNOSIS_CONTENT_PROBLEM_TAG_ALIASES } from "@/lib/diagnose/problemTagSupport";
import type { GuidanceContext, GuidanceMechanismFamily, GuidancePlanIntent, GuidanceStrokeFamily } from "@/lib/guidance-context/types";
import { canonicalizeTennisText } from "@/lib/i18n/tennisGlossary";
import type { PlanBlueprintRole } from "@/types/plan";
import type { ContentItem, ContentSubtitleAvailability } from "@/types/content";

export type AttachedInstructionalRole = "explanation" | "drill" | "tactic" | "warmup" | "mental" | "general";

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
  planIntentFit: number;
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
  crossPlatformDuplicatePenalty: number;
  sameCreatorPenalty: number;
};

export type AttachedRecommendation = {
  item: ContentItem;
  totalScore: number;
  role: AttachedInstructionalRole;
  duplicateClusterId: string;
  breakdown: AttachedRecommendationBreakdown;
};

type RankedAttachedCandidate = {
  catalogItem: CatalogContentItem;
  role: AttachedInstructionalRole;
  strokeFamily: GuidanceStrokeFamily;
  mechanismFamily: GuidanceMechanismFamily;
  duplicateClusterId: string;
  crossPlatformDuplicatePenalty: number;
  breakdown: AttachedRecommendationBreakdown;
  totalScore: number;
};

type EligibleAttachedCandidate = {
  catalogItem: CatalogContentItem;
  role: AttachedInstructionalRole;
  strokeFamily: GuidanceStrokeFamily;
  mechanismFamily: GuidanceMechanismFamily;
  duplicateClusterId: string;
};

const EXACT_PRIMARY_TAG_SCORE = 50;
const SIBLING_TAG_SCORE = 18;
const MECHANISM_FAMILY_SCORE = 24;
const STROKE_FAMILY_SCORE = 18;
const PLAN_INTENT_SCORE = 16;
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
const DUPLICATE_CLUSTER_PENALTY = 100;
const TRUSTED_REVIEW_STATUSES = new Set(["verified", "manual_confirmed"]);

const LEVEL_PREFERENCE_MAP: Record<string, string[]> = {
  "2.5": ["2.5", "3.0"],
  "3.0": ["2.5", "3.0"],
  "3.5": ["3.0", "3.5"],
  "4.0": ["3.5", "4.0", "4.0+"],
  "4.0+": ["4.0", "4.0+"]
};

function normalizeText(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function buildSearchText(item: CatalogContentItem): string {
  return [
    item.display.title,
    item.display.sourceTitle,
    item.display.originalTitle,
    item.display.summary,
    item.display.reason,
    item.display.coachReason,
    ...item.display.useCases,
    ...item.skillCategories,
    ...item.problemTags
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function inferInstructionalRole(item: CatalogContentItem): AttachedInstructionalRole {
  const text = buildSearchText(item);

  if (/(warm[- ]?up|热身|准备活动)/i.test(text)) return "warmup";
  if (/(pressure|mental|mindset|routine|关键分|紧张|手紧|心态)/i.test(text)) return "mental";
  if (/(drill|reps|follow along|跟练|练习|模板|模版|重复|训练组)/i.test(text)) return "drill";
  if (/(tactic|pattern|point construction|doubles|poach|战术|分点|站位|双打|前四拍)/i.test(text)) return "tactic";
  if (/(how to|teaching|lesson|masterclass|basics|fundamentals|explanation|教学|讲解|精讲|基础|拆解|秘诀)/i.test(text)) {
    return "explanation";
  }

  if (item.teachingIntent === "teaching") {
    return "explanation";
  }

  return "general";
}

function inferStrokeFamily(item: CatalogContentItem): GuidanceStrokeFamily {
  const text = buildSearchText(item);

  if (/(serve|second serve|toss|double fault|发球|二发|抛球)/i.test(text)) return "serve";
  if (/(return|return of serve|接发|接发球)/i.test(text)) return "return";
  if (/(volley|net|doubles|截击|网前|双打)/i.test(text)) return "volley";
  if (/(overhead|smash|高压|扣杀)/i.test(text)) return "overhead";
  if (/(slice|切削|切球)/i.test(text)) return "slice";
  if (/(backhand|反手)/i.test(text)) return "backhand";
  if (/(forehand|正手)/i.test(text)) return "forehand";
  return "general";
}

function inferMechanismFamily(item: CatalogContentItem): GuidanceMechanismFamily {
  const text = buildSearchText(item);

  if (/(pressure|anxiety|tight|关键分|紧张|手紧)/i.test(text)) return "pressure_regulation";
  if (/(decision|pattern|point construction|战术|分点|前四拍)/i.test(text)) return "decision";
  if (/(position|poach|doubles formation|站位|位置)/i.test(text)) return "positioning";
  if (/(recovery|footwork|movement|回位|脚步|移动|跑动)/i.test(text)) return "recovery";
  if (/(spacing|distance|jammed|挤到|距离|站不开)/i.test(text)) return "spacing";
  if (/(rhythm|timing|beat|tempo|节奏|时机)/i.test(text)) return "rhythm";
  if (/(contact|window|in front|击球点|触球|击球窗口)/i.test(text)) return "contact_window";
  return "shape_control";
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

function isDirectSourceCandidate(item: CatalogContentItem): boolean {
  return item.mediaType === "video" && item.rightsStatus === "direct_source";
}

function hasTrustedReviewStatus(item: CatalogContentItem): boolean {
  const status = item.qualityReview?.reviewStatus;
  return Boolean(status && TRUSTED_REVIEW_STATUSES.has(status));
}

function shouldEnforceTrustedReviewGate(request: AttachedRecommendationRequest): boolean {
  return Array.isArray(request.qualityReviews) && request.qualityReviews.length > 0;
}

function passesReviewEligibilityGate(item: CatalogContentItem, strictReviewGate: boolean): boolean {
  if (strictReviewGate) {
    return hasTrustedReviewStatus(item);
  }

  return item.qualityReview?.reviewStatus !== "rejected" && item.qualityReview?.reviewStatus !== "suspect";
}

function isHealthyHttpStatus(status: number | undefined): boolean {
  return typeof status === "number" && status >= 200 && status < 400;
}

function isLocalStaticResource(item: CatalogContentItem): boolean {
  return item.canonicalUrl.startsWith("/") || item.sourceItem.url.startsWith("/");
}

function passesLinkHealthGate(item: CatalogContentItem, strictReviewGate: boolean): boolean {
  if (isLocalStaticResource(item)) {
    return true;
  }

  const httpStatus = item.qualityReview?.httpStatus;
  if (typeof httpStatus === "number") {
    return isHealthyHttpStatus(httpStatus);
  }

  return strictReviewGate ? hasTrustedReviewStatus(item) : true;
}

function passesThumbnailHealthGate(item: CatalogContentItem, strictReviewGate: boolean): boolean {
  if (strictReviewGate) {
    if (!item.display.thumbnail) {
      return false;
    }

    return item.qualityReview?.thumbnailStatus !== "broken" && item.qualityReview?.thumbnailStatus !== "missing";
  }

  if (item.qualityReview?.thumbnailStatus === "broken" || item.qualityReview?.thumbnailStatus === "missing") {
    return false;
  }

  return true;
}

function isSkillBandCompatible(item: CatalogContentItem, skillBand: GuidanceContext["skillBand"]): boolean {
  const preferredLevels = LEVEL_PREFERENCE_MAP[skillBand] ?? [skillBand];
  return item.levelRange.includes(skillBand) || item.levelRange.some((level) => preferredLevels.includes(level));
}

function isLanguageUsable(
  item: CatalogContentItem,
  preference: GuidanceContext["languagePreference"],
  strictReviewGate: boolean
): boolean {
  if (preference === "zh") {
    return item.language === "zh" || item.contentLanguage === "zh" || hasZhSubtitles(item.subtitleAvailability);
  }

  if (!strictReviewGate) {
    return true;
  }

  return item.language === "en"
    || item.contentLanguage === "en"
    || item.subtitleAvailability === "english"
    || item.subtitleAvailability === "zh_en";
}

function hasZhSubtitles(subtitleAvailability?: ContentSubtitleAvailability): boolean {
  return subtitleAvailability === "zh" || subtitleAvailability === "zh_en";
}

function hasEnSubtitles(subtitleAvailability?: ContentSubtitleAvailability): boolean {
  return subtitleAvailability === "english" || subtitleAvailability === "zh_en" || subtitleAvailability === "not_needed";
}

function overlapCount(left: string[], right: string[]): number {
  const rightSet = new Set(right);
  return left.reduce((sum, value) => sum + (rightSet.has(value) ? 1 : 0), 0);
}

function hasRelevantTagFamily(item: CatalogContentItem, guidanceContext: GuidanceContext): boolean {
  const expandedItemTags = new Set(
    item.problemTags.flatMap((tag) => [tag, ...(DIAGNOSIS_CONTENT_PROBLEM_TAG_ALIASES[tag] ?? [])])
  );

  return expandedItemTags.has(guidanceContext.primaryProblemTag)
    || guidanceContext.secondaryProblemTags.some((tag) => expandedItemTags.has(tag));
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

  const httpStatus = item.qualityReview?.httpStatus;
  if (typeof httpStatus === "number") {
    return isHealthyHttpStatus(httpStatus) ? LINK_HEALTH_SCORE : 0;
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

function scorePlanIntentFit(role: AttachedInstructionalRole, guidanceContext: GuidanceContext, stepRole?: PlanBlueprintRole): number {
  const intent = guidanceContext.planIntent;

  if (stepRole === "review_reset" && role === "explanation") {
    return PLAN_INTENT_SCORE;
  }
  if (stepRole === "pressure_repetition" && (role === "drill" || role === "mental")) {
    return PLAN_INTENT_SCORE;
  }
  if (stepRole === "transfer" && role === "tactic") {
    return PLAN_INTENT_SCORE;
  }

  if (intent === "stabilize_under_pressure" && (role === "mental" || role === "drill")) return PLAN_INTENT_SCORE;
  if (intent === "arrive_earlier" && role === "drill") return PLAN_INTENT_SCORE;
  if (intent === "organize_tactics" && role === "tactic") return PLAN_INTENT_SCORE;
  if (intent === "rebuild_mechanics" && (role === "explanation" || role === "drill")) return PLAN_INTENT_SCORE;
  if (intent === "stabilize_primary_pattern" && (role === "explanation" || role === "drill")) return PLAN_INTENT_SCORE;
  if (intent === "assessment_priority" && role === "explanation") return PLAN_INTENT_SCORE;

  if (role === "explanation" || role === "drill") {
    return 8;
  }

  return 0;
}

function scoreTrainingFocusFit(item: CatalogContentItem, guidanceContext: GuidanceContext, lexicalTerms: string[]): number {
  const searchText = buildSearchText(item);
  const focusTerms = [
    guidanceContext.trainingFocus,
    guidanceContext.planIntent.replace(/_/g, " "),
    ...lexicalTerms
  ]
    .map((term) => normalizeText(term))
    .filter((term) => term.length >= 3);

  const hitCount = focusTerms.reduce((sum, term) => sum + (searchText.includes(term) ? 1 : 0), 0);
  return Math.min(TRAINING_FOCUS_SCORE, hitCount * 4);
}

function buildBaseBreakdown(input: {
  item: CatalogContentItem;
  role: AttachedInstructionalRole;
  strokeFamily: GuidanceStrokeFamily;
  mechanismFamily: GuidanceMechanismFamily;
  guidanceContext: GuidanceContext;
  lexicalTerms: string[];
  requiredOrder: Map<string, number>;
  supportOrder: Map<string, number>;
  preferredOrder: Map<string, number>;
  crossPlatformDuplicatePenalty: number;
  stepRole?: PlanBlueprintRole;
}): AttachedRecommendationBreakdown {
  const exactPrimaryTagMatch = input.item.problemTags.includes(input.guidanceContext.primaryProblemTag)
    ? EXACT_PRIMARY_TAG_SCORE
    : 0;
  const siblingTagMatch = input.guidanceContext.secondaryProblemTags.some((tag) => input.item.problemTags.includes(tag))
    ? SIBLING_TAG_SCORE
    : 0;
  const mechanismFamilyMatch = input.mechanismFamily === input.guidanceContext.mechanismFamily
    ? MECHANISM_FAMILY_SCORE
    : 0;
  const strokeFamilyMatch = input.strokeFamily === input.guidanceContext.strokeFamily
    ? STROKE_FAMILY_SCORE
    : 0;
  const planIntentFit = scorePlanIntentFit(input.role, input.guidanceContext, input.stepRole);
  const trainingFocusFit = scoreTrainingFocusFit(input.item, input.guidanceContext, input.lexicalTerms);
  const skillBandOverlap = scoreSkillBandOverlap(input.item, input.guidanceContext.skillBand);
  const languageFit = scoreLanguageFit(input.item, input.guidanceContext.languagePreference);
  const subtitleFit = scoreSubtitleFit(input.item, input.guidanceContext.languagePreference);
  const creatorQualityScore = scoreCreatorQuality(input.item);
  const reviewStatus = scoreReviewStatus(input.item);
  const freshness = scoreFreshness(input.item);
  const linkHealth = scoreLinkHealth(input.item);
  const thumbnailHealth = scoreThumbnailHealth(input.item);
  const preferredSeed = input.requiredOrder.has(input.item.id)
    ? Math.max(0, REQUIRED_SEED_SCORE - ((input.requiredOrder.get(input.item.id) ?? 0) * 18))
    : input.supportOrder.has(input.item.id)
      ? Math.max(0, SUPPORT_SEED_SCORE - ((input.supportOrder.get(input.item.id) ?? 0) * 4))
    : input.preferredOrder.has(input.item.id)
      ? Math.max(0, PREFERRED_SEED_SCORE - ((input.preferredOrder.get(input.item.id) ?? 0) * 4))
      : 0;

  return {
    exactPrimaryTagMatch,
    siblingTagMatch,
    mechanismFamilyMatch,
    strokeFamilyMatch,
    planIntentFit,
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
    crossPlatformDuplicatePenalty: input.crossPlatformDuplicatePenalty,
    sameCreatorPenalty: 0
  };
}

function sumBreakdown(breakdown: AttachedRecommendationBreakdown): number {
  return Object.values(breakdown).reduce((sum, value) => sum + value, 0);
}

function buildEligibleCandidatePool(request: AttachedRecommendationRequest): EligibleAttachedCandidate[] {
  const requiredIdSet = new Set(request.requiredIds ?? []);
  const preferredIdSet = new Set(request.preferredIds ?? []);
  const supportIdSet = new Set(request.supportIds ?? []);
  const strictReviewGate = shouldEnforceTrustedReviewGate(request);
  const catalog = buildCatalogCorpus({
    curatedContents: request.contentPool,
    expandedContents: request.expandedContentPool,
    qualityReviews: request.qualityReviews
  });

  return catalog
    .filter((item) =>
      isDirectSourceCandidate(item)
      && passesReviewEligibilityGate(item, strictReviewGate)
      && passesLinkHealthGate(item, strictReviewGate)
      && passesThumbnailHealthGate(item, strictReviewGate)
      && isSkillBandCompatible(item, request.guidanceContext.skillBand)
      && isLanguageUsable(item, request.guidanceContext.languagePreference, strictReviewGate)
      && (
        hasRelevantTagFamily(item, request.guidanceContext)
        || requiredIdSet.has(item.id)
        || preferredIdSet.has(item.id)
        || supportIdSet.has(item.id)
      )
    )
    .map((item) => ({
      catalogItem: item,
      role: inferInstructionalRole(item),
      strokeFamily: inferStrokeFamily(item),
      mechanismFamily: inferMechanismFamily(item),
      duplicateClusterId: buildAttachedDuplicateClusterId(item)
    }));
}

function scoreEligibleCandidatePool(
  eligibleCandidates: EligibleAttachedCandidate[],
  request: AttachedRecommendationRequest
): RankedAttachedCandidate[] {
  const requiredIds = request.requiredIds ?? [];
  const requiredOrder = new Map(requiredIds.map((id, index) => [id, index]));
  const supportIds = request.supportIds ?? [];
  const supportOrder = new Map(supportIds.map((id, index) => [id, index]));
  const preferredIds = request.preferredIds ?? [];
  const preferredOrder = new Map(preferredIds.map((id, index) => [id, index]));
  const lexicalTerms = (request.lexicalTerms ?? []).map((term) => normalizeText(term)).filter((term) => term.length >= 3);
  const clusterMap = buildCrossPlatformClusterMap(eligibleCandidates.map((candidate) => candidate.catalogItem));

  return eligibleCandidates
    .map((candidate) => {
      const crossPlatformDuplicatePenalty = (clusterMap.get(candidate.duplicateClusterId)?.size ?? 0) > 1 ? -8 : 0;
      const breakdown = buildBaseBreakdown({
        item: candidate.catalogItem,
        role: candidate.role,
        strokeFamily: candidate.strokeFamily,
        mechanismFamily: candidate.mechanismFamily,
        guidanceContext: request.guidanceContext,
        lexicalTerms,
        requiredOrder,
        supportOrder,
        preferredOrder,
        crossPlatformDuplicatePenalty,
        stepRole: request.stepRole
      });

      return {
        catalogItem: candidate.catalogItem,
        role: candidate.role,
        strokeFamily: candidate.strokeFamily,
        mechanismFamily: candidate.mechanismFamily,
        duplicateClusterId: candidate.duplicateClusterId,
        crossPlatformDuplicatePenalty,
        breakdown,
        totalScore: sumBreakdown(breakdown)
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
    if (selectedCreators.has(candidate.catalogItem.creatorId) && candidates.some((entry) => entry.role === role && !selectedCreators.has(entry.catalogItem.creatorId))) {
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
    if (selectedCreators.has(candidate.catalogItem.creatorId) && candidates.some((entry) => supportIds.includes(entry.catalogItem.id) && !selectedCreators.has(entry.catalogItem.creatorId))) {
      continue;
    }

    return candidate;
  }

  return null;
}

function rerankCandidates(
  candidates: RankedAttachedCandidate[],
  maxResults: number,
  requiredIds: string[],
  supportIds: string[]
): RankedAttachedCandidate[] {
  const selected: RankedAttachedCandidate[] = [];
  const creatorUsage = new Map<string, number>();
  const selectedClusters = new Set<string>();
  const supportIdSet = new Set(supportIds);

  const requiredCandidate = selectBestRequiredCandidate(candidates, requiredIds, selected);
  if (requiredCandidate) {
    selected.push(requiredCandidate);
    selectedClusters.add(requiredCandidate.duplicateClusterId);
    creatorUsage.set(requiredCandidate.catalogItem.creatorId, 1);
  }

  if (supportIds.length > 0 && selected.length < maxResults) {
    const earlySupportCandidate = selectBestSupportCandidate(candidates, supportIds, selected);
    if (earlySupportCandidate && !selectedClusters.has(earlySupportCandidate.duplicateClusterId)) {
      selected.push(earlySupportCandidate);
      selectedClusters.add(earlySupportCandidate.duplicateClusterId);
      creatorUsage.set(
        earlySupportCandidate.catalogItem.creatorId,
        (creatorUsage.get(earlySupportCandidate.catalogItem.creatorId) ?? 0) + 1
      );
    }
  }

  const roleCandidates: AttachedInstructionalRole[] = [];
  if (!selected.some((candidate) => candidate.role === "explanation") && candidates.some((candidate) => candidate.role === "explanation")) {
    roleCandidates.push("explanation");
  }
  if (!selected.some((candidate) => candidate.role === "drill") && candidates.some((candidate) => candidate.role === "drill")) {
    roleCandidates.push("drill");
  }

  const roleSeedLimit = supportIds.length > 0
    ? Math.max(selected.length, Math.min(maxResults - 1, 3))
    : Math.min(maxResults, 3);

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

  if (selected.length < Math.min(maxResults, 3)) {
    const supportCandidate = selectBestSupportCandidate(candidates, supportIds, selected);
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
    const adjustedScore = candidate.totalScore - sameCreatorPenalty;
    const breakdown = {
      ...candidate.breakdown,
      sameCreatorPenalty: -sameCreatorPenalty
    };
    const adjustedCandidate = {
      ...candidate,
      breakdown,
      totalScore: adjustedScore
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
  const minimumScore = topScore >= 90 ? topScore - 36 : topScore >= 65 ? topScore - 28 : topScore >= 42 ? topScore - 18 : topScore;

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
  const eligibleCandidates = buildEligibleCandidatePool(request);
  const candidates = scoreEligibleCandidatePool(eligibleCandidates, request);
  const reranked = rerankCandidates(candidates, request.maxResults ?? 3, request.requiredIds ?? [], request.supportIds ?? []);

  return reranked.map((candidate) => ({
    item: candidate.catalogItem.sourceItem,
    totalScore: candidate.totalScore,
    role: candidate.role,
    duplicateClusterId: candidate.duplicateClusterId,
    breakdown: candidate.breakdown
  }));
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

function getRoleLabel(role: AttachedInstructionalRole, locale: "zh" | "en"): string {
  if (locale === "en") {
    if (role === "drill") return "practice-first";
    if (role === "tactic") return "decision-first";
    if (role === "warmup") return "warm-up";
    if (role === "mental") return "pressure-management";
    return "explanation-first";
  }

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
  const role = inferInstructionalRole(catalogItem);
  const mechanismFamily = inferMechanismFamily(catalogItem);
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
