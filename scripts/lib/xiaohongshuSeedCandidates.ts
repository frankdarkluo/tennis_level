import { xiaohongshuConnector } from "../../src/lib/platform-connectors/xiaohongshu";
import { isProblemTag, type ProblemTag } from "../../src/types/problemTag";
import {
  canCollectXiaohongshuSeedCandidates,
  findXiaohongshuCreatorProgramEntry,
  loadXiaohongshuCreatorProgram,
  type XiaohongshuCreatorProgramEntry,
  type XiaohongshuTeachingType
} from "./xiaohongshuCreatorProgram";

export type XiaohongshuSeedCandidateInput = {
  creatorName: string;
  creatorProfileUrl: string;
  creatorShortProfileUrl?: string | null;
  rawUrl: string;
  resolvedCanonicalUrl?: string | null;
  title: string;
  profileConfirmedTitle: string;
  thumbnailUrl?: string | null;
  preliminaryProblemTags: ProblemTag[];
  discoveryQuery: string;
  surfaceDateText?: string | null;
  surfaceLikeText?: string | null;
  crossPlatformNotes?: string | null;
  teachingType: XiaohongshuTeachingType;
  languageHint?: "zh" | "en" | "mixed" | null;
  subtitleLanguageHint?: "zh" | "zh_en" | "none" | "unknown" | null;
  duplicateClusterHint?: string | null;
  priority?: number;
};

export type XiaohongshuSeedCandidate = {
  candidateId: string;
  creatorProgramId: string;
  creatorName: string;
  platform: "xiaohongshu";
  creatorProfileUrl: string;
  rawUrl: string;
  canonicalUrl: string | null;
  postId: string | null;
  title: string;
  thumbnailUrl: string | null;
  teachingType: XiaohongshuTeachingType;
  languageHint: "zh" | "en" | "mixed" | "unknown";
  subtitleLanguageHint: "zh" | "zh_en" | "none" | "unknown";
  duplicateClusterHint: string | null;
  evidence: {
    creatorEvidence: string[];
    contentEvidence: string[];
    thumbnailEvidence: string[];
  };
  preliminaryProblemTags: ProblemTag[];
  crossPlatformNotes?: string | null;
  reviewStatus: "needs_review";
};

export type XiaohongshuSeedCandidateArtifact = {
  version: 1;
  generatedAt: string;
  methodology: {
    scope: "qa_only_seed_candidates";
    candidateSource: "profile_title_confirmed_search_result_cards";
    perCreatorLimit: number;
    creatorProgramVersion: 1;
    creatorProgramScopeTarget: number;
  };
  summary: {
    candidateCount: number;
    creatorCount: number;
    creatorTargetCount: number;
    byCreator: Array<{
      creatorProgramId: string;
      creatorName: string;
      creatorProfileUrl: string | null;
      creatorProfileStatus: XiaohongshuCreatorProgramEntry["creatorProfileStatus"];
      candidateTarget: number;
      savedCount: number;
      collectible: boolean;
    }>;
  };
  candidates: XiaohongshuSeedCandidate[];
};

const PROFILE_PATTERN = /xiaohongshu\.com\/user\/profile\/([^/?#]+)/i;
const SEARCH_RESULT_PATTERN = /xiaohongshu\.com\/search_result\/([^/?#]+)/i;

function normalizeString(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function buildContentEvidence(input: XiaohongshuSeedCandidateInput): string[] {
  return uniqueStrings([
    `profile title confirmed on creator page: ${input.profileConfirmedTitle.trim()}`,
    `search query used to locate note: ${input.discoveryQuery.trim()}`,
    input.surfaceDateText ? `search-result card date text: ${input.surfaceDateText.trim()}` : "",
    input.surfaceLikeText ? `search-result card likes text: ${input.surfaceLikeText.trim()}` : "",
    `teaching type: ${input.teachingType}`,
    input.languageHint ? `language hint: ${input.languageHint}` : "",
    input.subtitleLanguageHint ? `subtitle hint: ${input.subtitleLanguageHint}` : "",
    input.duplicateClusterHint ? `duplicate cluster hint: ${input.duplicateClusterHint.trim()}` : ""
  ]);
}

function buildCreatorEvidence(
  input: XiaohongshuSeedCandidateInput,
  programEntry: XiaohongshuCreatorProgramEntry,
  creatorProfileUrl: string
): string[] {
  return uniqueStrings([
    `creator program id: ${programEntry.id}`,
    `canonical creator profile: ${creatorProfileUrl}`,
    `profile evidence note: ${programEntry.profileEvidenceNote}`,
    input.creatorShortProfileUrl ? `creator share link: ${input.creatorShortProfileUrl.trim()}` : ""
  ]);
}

function buildThumbnailEvidence(input: XiaohongshuSeedCandidateInput): string[] {
  return input.thumbnailUrl ? [`search-result card thumbnail: ${input.thumbnailUrl.trim()}`] : [];
}

function validateProblemTags(problemTags: string[]): asserts problemTags is ProblemTag[] {
  if (problemTags.length === 0) {
    throw new Error("preliminaryProblemTags must contain at least one active problem tag");
  }

  for (const tag of problemTags) {
    if (!isProblemTag(tag)) {
      throw new Error(`preliminaryProblemTags contains unsupported tag "${tag}"`);
    }
  }
}

function getCandidateId(creatorProfileId: string, postId: string | null, fallbackTitle: string): string {
  const normalizedFallback = fallbackTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `xhs_${creatorProfileId}_${postId ?? normalizedFallback}`;
}

function canonicalizeRawEntryUrl(rawUrl: string): string {
  const trimmed = normalizeString(rawUrl);
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    throw new Error(`rawUrl must be an absolute Xiaohongshu URL, received "${rawUrl}"`);
  }

  if (!trimmed.includes("xiaohongshu.com/")) {
    throw new Error(`rawUrl must point at Xiaohongshu, received "${rawUrl}"`);
  }

  if (!SEARCH_RESULT_PATTERN.test(trimmed) && !xiaohongshuConnector.extractPostId(trimmed)) {
    throw new Error(`rawUrl must be a Xiaohongshu search-result or direct note URL, received "${rawUrl}"`);
  }

  return trimmed;
}

export function canonicalizeXiaohongshuCreatorProfileUrl(url: string): string | null {
  const trimmed = normalizeString(url);
  const match = trimmed.match(PROFILE_PATTERN);
  if (!match) {
    return null;
  }

  return `https://www.xiaohongshu.com/user/profile/${match[1]}`;
}

function normalizeCandidate(
  input: XiaohongshuSeedCandidateInput,
  creatorProgram: XiaohongshuCreatorProgramEntry[]
): XiaohongshuSeedCandidate & { priority: number } {
  const creatorName = normalizeString(input.creatorName);
  const title = normalizeString(input.title);
  const profileConfirmedTitle = normalizeString(input.profileConfirmedTitle);
  const creatorProfileUrl = canonicalizeXiaohongshuCreatorProfileUrl(input.creatorProfileUrl);
  const programEntry = findXiaohongshuCreatorProgramEntry(creatorProgram, {
    creatorName,
    creatorProfileUrl: creatorProfileUrl ?? normalizeString(input.creatorProfileUrl)
  });
  const rawUrl = canonicalizeRawEntryUrl(input.rawUrl);
  const resolvedCanonicalSource = normalizeString(input.resolvedCanonicalUrl) || rawUrl;
  const canonicalUrl = xiaohongshuConnector.canonicalizeUrl(resolvedCanonicalSource);

  if (!creatorName) {
    throw new Error("creatorName is required");
  }

  if (!creatorProfileUrl) {
    throw new Error(`creatorProfileUrl must be a Xiaohongshu user/profile URL, received "${input.creatorProfileUrl}"`);
  }

  if (!programEntry) {
    throw new Error(`creator "${creatorName}" is not part of the active Xiaohongshu creator program`);
  }

  if (!canCollectXiaohongshuSeedCandidates(programEntry) || !programEntry.creatorProfileUrl) {
    throw new Error(`creator "${programEntry.displayName}" is still pending profile verification and cannot accept seed candidates yet`);
  }

  if (creatorProfileUrl !== programEntry.creatorProfileUrl) {
    throw new Error(`creatorProfileUrl does not match the creator-program profile URL for "${programEntry.displayName}"`);
  }

  if (!programEntry.allowedTeachingTypes.includes(input.teachingType)) {
    throw new Error(`teachingType "${input.teachingType}" is not allowed for creator "${programEntry.displayName}"`);
  }

  if (!title || !profileConfirmedTitle) {
    throw new Error("title and profileConfirmedTitle are required");
  }

  if (title !== profileConfirmedTitle) {
    throw new Error(`title must exactly match profileConfirmedTitle for QA safety, received "${title}" vs "${profileConfirmedTitle}"`);
  }

  if (!canonicalUrl) {
    throw new Error(`resolvedCanonicalUrl could not be normalized into a Xiaohongshu note URL: "${resolvedCanonicalSource}"`);
  }

  validateProblemTags(input.preliminaryProblemTags);

  const postId = xiaohongshuConnector.extractPostId(canonicalUrl);
  const creatorProfileId = creatorProfileUrl.match(PROFILE_PATTERN)?.[1] ?? "unknown";

  return {
    candidateId: getCandidateId(creatorProfileId, postId, title),
    creatorProgramId: programEntry.id,
    creatorName: programEntry.displayName,
    platform: "xiaohongshu",
    creatorProfileUrl,
    rawUrl,
    canonicalUrl,
    postId,
    title,
    thumbnailUrl: normalizeString(input.thumbnailUrl) || null,
    teachingType: input.teachingType,
    languageHint: input.languageHint ?? "unknown",
    subtitleLanguageHint: input.subtitleLanguageHint ?? "unknown",
    duplicateClusterHint: normalizeString(input.duplicateClusterHint) || null,
    evidence: {
      creatorEvidence: buildCreatorEvidence(input, programEntry, creatorProfileUrl),
      contentEvidence: buildContentEvidence(input),
      thumbnailEvidence: buildThumbnailEvidence(input)
    },
    preliminaryProblemTags: uniqueStrings(input.preliminaryProblemTags) as ProblemTag[],
    crossPlatformNotes: normalizeString(input.crossPlatformNotes) || null,
    reviewStatus: "needs_review",
    priority: input.priority ?? Number.MAX_SAFE_INTEGER
  };
}

export function buildXiaohongshuSeedCandidateArtifact(input: {
  generatedAt: string;
  inputs: XiaohongshuSeedCandidateInput[];
  perCreatorLimit?: number;
  creatorProgram?: XiaohongshuCreatorProgramEntry[];
}): XiaohongshuSeedCandidateArtifact {
  const perCreatorLimit = input.perCreatorLimit ?? 5;
  const creatorProgram = input.creatorProgram ?? loadXiaohongshuCreatorProgram();
  const normalizedCandidates = input.inputs.map((candidate) => normalizeCandidate(candidate, creatorProgram));
  const limitedCandidates: XiaohongshuSeedCandidate[] = [];
  const byCreatorSummary: XiaohongshuSeedCandidateArtifact["summary"]["byCreator"] = [];

  for (const creator of creatorProgram) {
    const saved = normalizedCandidates
      .filter((candidate) => candidate.creatorProgramId === creator.id)
      .sort((left, right) => left.priority - right.priority || left.title.localeCompare(right.title))
      .slice(0, perCreatorLimit)
      .map(({ priority: _priority, ...candidate }) => candidate);

    limitedCandidates.push(...saved);
    byCreatorSummary.push({
      creatorProgramId: creator.id,
      creatorName: creator.displayName,
      creatorProfileUrl: creator.creatorProfileUrl,
      creatorProfileStatus: creator.creatorProfileStatus,
      candidateTarget: creator.candidateTarget,
      savedCount: saved.length,
      collectible: canCollectXiaohongshuSeedCandidates(creator)
    });
  }

  return {
    version: 1,
    generatedAt: input.generatedAt,
    methodology: {
      scope: "qa_only_seed_candidates",
      candidateSource: "profile_title_confirmed_search_result_cards",
      perCreatorLimit,
      creatorProgramVersion: 1,
      creatorProgramScopeTarget: creatorProgram.reduce((sum, creator) => sum + creator.candidateTarget, 0)
    },
    summary: {
      candidateCount: limitedCandidates.length,
      creatorCount: byCreatorSummary.length,
      creatorTargetCount: creatorProgram.length,
      byCreator: byCreatorSummary
    },
    candidates: limitedCandidates
  };
}
