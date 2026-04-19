import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { buildLibraryItems } from "@/lib/library/order";
import type { ContentItem, ContentLanguageCode, ContentSubtitleAvailability } from "@/types/content";
import type { ProblemTag } from "@/types/problemTag";
import localThumbnailManifest from "../../../ops/quality/xiaohongshu-local-thumbnails.json";
import seedCandidateArtifact from "../../../ops/quality/xiaohongshu-seed-candidates.json";

export const XIAOHONGSHU_LIBRARY_REVIEW_QUERY_KEY = "review";
export const XIAOHONGSHU_LIBRARY_REVIEW_QUERY_VALUE = "xiaohongshu-candidates";
export const XIAOHONGSHU_LIBRARY_REVIEW_ITEM_PREFIX = "review_xhs_candidate_";

const CREATOR_ID_BY_PROGRAM_ID = {
  gaiao: "creator_gaiao_xiaohongshu_hidden",
  lingxi: "creator_lingxi_xiaohongshu_hidden",
  mouratoglou: "creator_mouratoglou_xiaohongshu_hidden",
  dabaiyang: "creator_dabaiyang_xiaohongshu_hidden"
} as const;

type XiaohongshuSeedCandidate = (typeof seedCandidateArtifact.candidates)[number];
type LocalThumbnailManifestEntry = {
  postId: string;
  localPath: string;
};

export type XiaohongshuCandidateReviewData = {
  items: ContentItem[];
  summary: {
    runtimeCount: number;
    candidateCount: number;
    duplicateSuppressedCount: number;
    mergedCount: number;
    byCreator: Array<{
      creatorProgramId: string;
      creatorName: string;
      count: number;
    }>;
  };
};

const PLAN_LEVEL_ORDER = ["2.5", "3.0", "3.5", "4.0", "4.5"] as const;
const TAG_LEVELS = new Map<string, string[]>();
const LOCAL_THUMBNAIL_MANIFEST = localThumbnailManifest as {
  items: LocalThumbnailManifestEntry[];
};
const LOCAL_THUMBNAIL_PATH_BY_POST_ID = new Map(
  LOCAL_THUMBNAIL_MANIFEST.items.map((entry) => [entry.postId, entry.localPath] as const)
);

for (const item of contents) {
  for (const problemTag of item.problemTags) {
    const current = TAG_LEVELS.get(problemTag) ?? [];
    TAG_LEVELS.set(problemTag, Array.from(new Set([...current, ...item.levels])));
  }
}

function mapSubtitleAvailability(
  subtitleLanguageHint: XiaohongshuSeedCandidate["subtitleLanguageHint"]
): ContentSubtitleAvailability {
  if (subtitleLanguageHint === "zh" || subtitleLanguageHint === "zh_en" || subtitleLanguageHint === "none") {
    return subtitleLanguageHint;
  }

  return "unknown";
}

function mapLanguage(languageHint: XiaohongshuSeedCandidate["languageHint"]): ContentLanguageCode {
  return languageHint === "en" ? "en" : "zh";
}

function formatTeachingTypeLabel(teachingType: XiaohongshuSeedCandidate["teachingType"]) {
  return teachingType.replace(/_/g, " ");
}

function buildReviewUseCases(candidate: XiaohongshuSeedCandidate) {
  if (candidate.preliminaryProblemTags.length > 0) {
    return [...candidate.preliminaryProblemTags];
  }

  return [formatTeachingTypeLabel(candidate.teachingType)];
}

function sortLevels(levels: string[]) {
  const order = new Map<string, number>(
    PLAN_LEVEL_ORDER.map((level, index) => [level, index] as const)
  );
  return Array.from(new Set(levels))
    .filter((level) => order.has(level))
    .sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0));
}

function inferCandidateLevels(candidate: XiaohongshuSeedCandidate, creatorLevels: string[] | undefined) {
  const tagLevels = sortLevels(
    candidate.preliminaryProblemTags.flatMap((tag) => TAG_LEVELS.get(tag) ?? [])
  );

  if (tagLevels.length > 0 && creatorLevels && creatorLevels.length > 0) {
    const narrowedLevels = tagLevels.filter((level) => creatorLevels.includes(level));
    if (narrowedLevels.length > 0) {
      return narrowedLevels;
    }
  }

  if (tagLevels.length > 0) {
    return tagLevels;
  }

  if (creatorLevels && creatorLevels.length > 0) {
    return sortLevels(creatorLevels);
  }

  if (candidate.teachingType === "mental_execution" || candidate.teachingType === "tactic") {
    return ["3.0", "3.5", "4.0", "4.5"];
  }

  if (candidate.teachingType === "warmup" || candidate.teachingType === "drill" || candidate.teachingType === "footwork") {
    return ["2.5", "3.0", "3.5", "4.0"];
  }

  return ["2.5", "3.0", "3.5"];
}

function buildReviewReason(candidate: XiaohongshuSeedCandidate) {
  return `QA candidate overlay for ${formatTeachingTypeLabel(candidate.teachingType)}. Not promoted into runtime yet.`;
}

function normalizeXiaohongshuTitleForDedup(title: string) {
  return (
    title
      .trim()
      .toLowerCase()
      .match(/[a-z0-9\u3400-\u9fff]+/g)
      ?.join("") ?? ""
  );
}

function extractXiaohongshuPostId(url: string) {
  const match = url.match(/([0-9a-f]{24})/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function buildXiaohongshuUrlDedupKey(url: string) {
  const postId = extractXiaohongshuPostId(url);

  if (postId) {
    return postId;
  }

  try {
    const parsedUrl = new URL(url);
    const normalizedPath = parsedUrl.pathname.replace(/\/+$/, "").toLowerCase();
    return `${parsedUrl.origin.toLowerCase()}${normalizedPath}`;
  } catch {
    return url.trim().replace(/\/+$/, "").toLowerCase();
  }
}

function buildCreatorTitleDedupKey(item: Pick<ContentItem, "creatorId" | "title">) {
  return `${item.creatorId}::${normalizeXiaohongshuTitleForDedup(item.title)}`;
}

function getCreatorForProgramId(creatorProgramId: keyof typeof CREATOR_ID_BY_PROGRAM_ID) {
  return creators.find((creator) => creator.id === CREATOR_ID_BY_PROGRAM_ID[creatorProgramId]) ?? null;
}

function buildReviewItem(candidate: XiaohongshuSeedCandidate): ContentItem {
  const creator = getCreatorForProgramId(candidate.creatorProgramId as keyof typeof CREATOR_ID_BY_PROGRAM_ID);
  const language = mapLanguage(candidate.languageHint);
  const localThumbnailPath = candidate.postId ? LOCAL_THUMBNAIL_PATH_BY_POST_ID.get(candidate.postId) : null;

  return {
    id: `${XIAOHONGSHU_LIBRARY_REVIEW_ITEM_PREFIX}${candidate.postId ?? candidate.candidateId}`,
    title: candidate.title,
    sourceTitle: candidate.title,
    originalTitle: candidate.title,
    displayTitleZh: candidate.title,
    creatorId: creator?.id ?? "creator_search_curated",
    platform: "Xiaohongshu",
    type: "post",
    levels: inferCandidateLevels(candidate, creator?.levels),
    skills: creator?.specialties ?? [],
    problemTags: candidate.preliminaryProblemTags as ProblemTag[],
    language,
    contentLanguage: language,
    subtitleAvailability: mapSubtitleAvailability(candidate.subtitleLanguageHint),
    summary: `候选审核内容：${candidate.title}`,
    reason: buildReviewReason(candidate),
    useCases: buildReviewUseCases(candidate),
    coachReason: "QA candidate overlay only. Review before any runtime promotion.",
    thumbnail: localThumbnailPath ?? candidate.thumbnailUrl ?? undefined,
    url: candidate.canonicalUrl ?? candidate.rawUrl,
    environment: "testing"
  };
}

export function isXiaohongshuCandidateReviewRequested(searchParams: { get(name: string): string | null } | null | undefined) {
  return searchParams?.get(XIAOHONGSHU_LIBRARY_REVIEW_QUERY_KEY) === XIAOHONGSHU_LIBRARY_REVIEW_QUERY_VALUE;
}

export function isXiaohongshuCandidateReviewItem(item: ContentItem) {
  return item.id.startsWith(XIAOHONGSHU_LIBRARY_REVIEW_ITEM_PREFIX);
}

function buildCandidateReviewSummary(items: ContentItem[]) {
  const byCreatorMap = new Map<string, { creatorProgramId: string; creatorName: string; count: number }>();

  seedCandidateArtifact.candidates.forEach((candidate) => {
    const existing = byCreatorMap.get(candidate.creatorProgramId);
    if (existing) {
      existing.count += 1;
      return;
    }

    byCreatorMap.set(candidate.creatorProgramId, {
      creatorProgramId: candidate.creatorProgramId,
      creatorName: candidate.creatorName,
      count: 1
    });
  });

  return {
    runtimeCount: 0,
    candidateCount: items.length,
    duplicateSuppressedCount: 0,
    mergedCount: items.length,
    byCreator: Array.from(byCreatorMap.values())
  };
}

export function loadXiaohongshuCandidateReviewData(): XiaohongshuCandidateReviewData {
  const items = seedCandidateArtifact.candidates.map((candidate) => buildReviewItem(candidate));

  return {
    items,
    summary: buildCandidateReviewSummary(items)
  };
}

export function loadMergedXiaohongshuLibraryData(): XiaohongshuCandidateReviewData {
  const runtimeItems = buildLibraryItems().filter((item) => item.platform === "Xiaohongshu");
  const reviewData = loadXiaohongshuCandidateReviewData();
  const runtimeTitleKeys = new Set(runtimeItems.map((item) => buildCreatorTitleDedupKey(item)));
  const runtimeUrlKeys = new Set(runtimeItems.map((item) => buildXiaohongshuUrlDedupKey(item.url)));
  const dedupedCandidateItems = reviewData.items.filter((item) => {
    const titleKey = buildCreatorTitleDedupKey(item);
    const urlKey = buildXiaohongshuUrlDedupKey(item.url);
    return !runtimeTitleKeys.has(titleKey) && !runtimeUrlKeys.has(urlKey);
  });
  const duplicateSuppressedCount = reviewData.items.length - dedupedCandidateItems.length;

  return {
    items: [...runtimeItems, ...dedupedCandidateItems],
    summary: {
      ...reviewData.summary,
      runtimeCount: runtimeItems.length,
      duplicateSuppressedCount,
      mergedCount: runtimeItems.length + dedupedCandidateItems.length
    }
  };
}
