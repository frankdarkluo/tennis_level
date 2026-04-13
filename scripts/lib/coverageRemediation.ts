import { buildCatalogCorpus } from "../../src/lib/content-catalog/normalize";
import type {
  CatalogContentItem,
  CatalogQualityReview,
  CatalogReviewStatus
} from "../../src/lib/content-catalog/schema";
import type { ContentItem } from "../../src/types/content";
import type { DiagnosisRule } from "../../src/types/diagnosis";
import { normalizeProblemTags, uniqueStrings } from "./contentNormalization";
import type { ManualReviewInputFile } from "./manualReviewImport";

export const COVERAGE_HEALTH_RULE = {
  minVerifiedDirectSourceItems: 3,
  minDistinctVerifiedCreators: 2
} as const;

export type CoverageGapSeverity = {
  verifiedItemGap: number;
  verifiedCreatorGap: number;
  remainingVerifiedItemGapAfterCandidates: number;
  remainingVerifiedCreatorGapAfterCandidates: number;
  gapSeverityScore: number;
};

export type CoverageCandidateSummary = {
  contentId: string;
  creatorId: string;
  platform: ContentItem["platform"];
  canonicalUrl: string;
  qualityScore: number;
  ingestionMethod: CatalogContentItem["ingestionMethod"];
  currentReviewStatus: CatalogReviewStatus | "unreviewed";
  candidateReason: "unreviewed_direct_source" | "needs_review_direct_source";
};

export type ProblemTagRemediationSummary = {
  problemTag: string;
  isHealthy: boolean;
  isUnderCovered: boolean;
  creatorDiversityStatus: "healthy" | "under_diversified" | "under_threshold";
  verifiedCoverage: {
    verifiedDirectSourceCount: number;
    reviewedDirectSourceCount: number;
    verifiedCreatorCount: number;
    meetsVerifiedItemTarget: boolean;
    meetsVerifiedCreatorTarget: boolean;
  };
  reviewableCandidates: CoverageCandidateSummary[];
  remainingGap: {
    verifiedItemGap: number;
    verifiedCreatorGap: number;
    remainingVerifiedItemGapAfterCandidates: number;
    remainingVerifiedCreatorGapAfterCandidates: number;
    needsNewSourcing: boolean;
  };
  gapSeverity: CoverageGapSeverity;
};

export type CoverageRemediationReport = {
  healthRule: typeof COVERAGE_HEALTH_RULE;
  summary: {
    activeProblemTagCount: number;
    healthyProblemTagCount: number;
    underCoveredProblemTagCount: number;
    needsNewSourcingProblemTagCount: number;
  };
  byProblemTag: ProblemTagRemediationSummary[];
};

export type CoverageRemediationViewOptions = {
  topN?: number | null;
  tagsFilter?: string[] | null;
};

export type ManualReviewCandidateExport = {
  selectedTags: string[];
  summary: {
    selectedProblemTagCount: number;
    exportedRecordCount: number;
  };
  payload: ManualReviewInputFile;
};

function isReviewableCandidate(item: CatalogContentItem): boolean {
  if (item.rightsStatus !== "direct_source" || item.mediaType !== "video") {
    return false;
  }

  const status = item.qualityReview?.reviewStatus;
  return status === undefined || status === "needs_review";
}

function getCurrentReviewStatus(item: CatalogContentItem): CatalogReviewStatus | "unreviewed" {
  return item.qualityReview?.reviewStatus ?? "unreviewed";
}

function toCandidateSummary(item: CatalogContentItem): CoverageCandidateSummary {
  return {
    contentId: item.id,
    creatorId: item.creatorId,
    platform: item.sourcePlatform,
    canonicalUrl: item.canonicalUrl,
    qualityScore: item.qualityScore,
    ingestionMethod: item.ingestionMethod,
    currentReviewStatus: getCurrentReviewStatus(item),
    candidateReason: item.qualityReview?.reviewStatus === "needs_review"
      ? "needs_review_direct_source"
      : "unreviewed_direct_source"
  };
}

function compareCandidates(left: CoverageCandidateSummary, right: CoverageCandidateSummary) {
  if (right.qualityScore !== left.qualityScore) {
    return right.qualityScore - left.qualityScore;
  }

  if (left.ingestionMethod !== right.ingestionMethod) {
    return left.ingestionMethod === "curated" ? -1 : 1;
  }

  if (left.creatorId !== right.creatorId) {
    return left.creatorId.localeCompare(right.creatorId);
  }

  return left.contentId.localeCompare(right.contentId);
}

function compareProblemTagSummaries(left: ProblemTagRemediationSummary, right: ProblemTagRemediationSummary) {
  if (right.gapSeverity.gapSeverityScore !== left.gapSeverity.gapSeverityScore) {
    return right.gapSeverity.gapSeverityScore - left.gapSeverity.gapSeverityScore;
  }

  return left.problemTag.localeCompare(right.problemTag);
}

function computeGapSeverity(input: {
  verifiedItemGap: number;
  verifiedCreatorGap: number;
  remainingVerifiedItemGapAfterCandidates: number;
  remainingVerifiedCreatorGapAfterCandidates: number;
}): CoverageGapSeverity {
  const gapSeverityScore =
    (input.verifiedItemGap * 100) +
    (input.verifiedCreatorGap * 40) +
    (input.remainingVerifiedItemGapAfterCandidates * 30) +
    (input.remainingVerifiedCreatorGapAfterCandidates * 15);

  return {
    ...input,
    gapSeverityScore
  };
}

export function applyCoverageRemediationView(
  report: CoverageRemediationReport,
  options?: CoverageRemediationViewOptions
): CoverageRemediationReport {
  const tagsFilter = options?.tagsFilter && options.tagsFilter.length > 0
    ? new Set(options.tagsFilter)
    : null;

  let byProblemTag = tagsFilter
    ? report.byProblemTag.filter((entry) => tagsFilter.has(entry.problemTag))
    : [...report.byProblemTag];

  if (typeof options?.topN === "number" && options.topN > 0) {
    byProblemTag = byProblemTag.slice(0, options.topN);
  }

  return {
    ...report,
    byProblemTag
  };
}

export function buildCoverageRemediationReport(input: {
  contents: ContentItem[];
  expandedContents: ContentItem[];
  diagnosisRules: Pick<DiagnosisRule, "problemTag">[];
  qualityReviews?: CatalogQualityReview[];
}): CoverageRemediationReport {
  const catalog = buildCatalogCorpus({
    curatedContents: input.contents,
    expandedContents: input.expandedContents,
    qualityReviews: input.qualityReviews
  }).filter((item) => item.mediaType === "video");

  const activeProblemTags = uniqueStrings(input.diagnosisRules.map((rule) => rule.problemTag)).sort((left, right) =>
    left.localeCompare(right)
  );

  const byProblemTag = activeProblemTags
    .map((problemTag): ProblemTagRemediationSummary => {
      const matchingItems = catalog.filter((item) => normalizeProblemTags(item.problemTags).includes(problemTag));
      const directItems = matchingItems.filter((item) => item.rightsStatus === "direct_source");
      const reviewedDirectItems = directItems.filter((item) => Boolean(item.qualityReview));
      const verifiedDirectItems = directItems.filter((item) => item.qualityReview?.reviewStatus === "verified");
      const verifiedCreators = new Set(verifiedDirectItems.map((item) => item.creatorId));
      const reviewableCandidates = directItems
        .filter((item) => isReviewableCandidate(item))
        .map(toCandidateSummary)
        .sort(compareCandidates);
      const reviewableDistinctCreatorGain = new Set(
        reviewableCandidates
          .map((candidate) => candidate.creatorId)
          .filter((creatorId) => !verifiedCreators.has(creatorId))
      ).size;

      const verifiedItemGap = Math.max(0, COVERAGE_HEALTH_RULE.minVerifiedDirectSourceItems - verifiedDirectItems.length);
      const verifiedCreatorGap = Math.max(0, COVERAGE_HEALTH_RULE.minDistinctVerifiedCreators - verifiedCreators.size);
      const remainingVerifiedItemGapAfterCandidates = Math.max(0, verifiedItemGap - reviewableCandidates.length);
      const remainingVerifiedCreatorGapAfterCandidates = Math.max(0, verifiedCreatorGap - reviewableDistinctCreatorGain);
      const meetsVerifiedItemTarget = verifiedItemGap === 0;
      const meetsVerifiedCreatorTarget = verifiedCreatorGap === 0;
      const isHealthy = meetsVerifiedItemTarget && meetsVerifiedCreatorTarget;
      const creatorDiversityStatus = isHealthy
        ? "healthy"
        : verifiedDirectItems.length >= COVERAGE_HEALTH_RULE.minVerifiedDirectSourceItems
          ? "under_diversified"
          : "under_threshold";

      return {
        problemTag,
        isHealthy,
        isUnderCovered: !isHealthy,
        creatorDiversityStatus,
        verifiedCoverage: {
          verifiedDirectSourceCount: verifiedDirectItems.length,
          reviewedDirectSourceCount: reviewedDirectItems.length,
          verifiedCreatorCount: verifiedCreators.size,
          meetsVerifiedItemTarget,
          meetsVerifiedCreatorTarget
        },
        reviewableCandidates,
        remainingGap: {
          verifiedItemGap,
          verifiedCreatorGap,
          remainingVerifiedItemGapAfterCandidates,
          remainingVerifiedCreatorGapAfterCandidates,
          needsNewSourcing: remainingVerifiedItemGapAfterCandidates > 0 || remainingVerifiedCreatorGapAfterCandidates > 0
        },
        gapSeverity: computeGapSeverity({
          verifiedItemGap,
          verifiedCreatorGap,
          remainingVerifiedItemGapAfterCandidates,
          remainingVerifiedCreatorGapAfterCandidates
        })
      };
    })
    .sort(compareProblemTagSummaries);

  return {
    healthRule: COVERAGE_HEALTH_RULE,
    summary: {
      activeProblemTagCount: activeProblemTags.length,
      healthyProblemTagCount: byProblemTag.filter((entry) => entry.isHealthy).length,
      underCoveredProblemTagCount: byProblemTag.filter((entry) => entry.isUnderCovered).length,
      needsNewSourcingProblemTagCount: byProblemTag.filter((entry) => entry.remainingGap.needsNewSourcing).length
    },
    byProblemTag
  };
}

export function exportManualReviewCandidates(
  report: CoverageRemediationReport,
  options?: CoverageRemediationViewOptions
): ManualReviewCandidateExport {
  const viewed = applyCoverageRemediationView(report, options);
  const underCoveredTags = viewed.byProblemTag.filter((entry) => entry.isUnderCovered);
  const tagMapByContentId = new Map<string, string[]>();
  const candidateMap = new Map<string, CoverageCandidateSummary>();

  for (const tag of underCoveredTags) {
    for (const candidate of tag.reviewableCandidates) {
      const existingTags = tagMapByContentId.get(candidate.contentId) ?? [];
      existingTags.push(tag.problemTag);
      tagMapByContentId.set(candidate.contentId, uniqueStrings(existingTags).sort((left, right) => left.localeCompare(right)));

      if (!candidateMap.has(candidate.contentId)) {
        candidateMap.set(candidate.contentId, candidate);
      }
    }
  }

  const candidates = [...candidateMap.values()].sort(compareCandidates);
  const payload: ManualReviewInputFile = {
    version: 1,
    generatedFromReport: "ops/quality/problem-tag-remediation.latest.json",
    records: candidates.map((candidate) => ({
      contentId: candidate.contentId,
      reviewDecision: "skip",
      verifiedBy: "",
      lastVerifiedAt: "",
      notes: `Review candidate for tags: ${(tagMapByContentId.get(candidate.contentId) ?? []).join(", ")}`,
      evidence: {
        linkStatus: "direct_source_candidate",
        decisionReason: candidate.candidateReason,
        finalUrl: candidate.canonicalUrl
      }
    }))
  };

  return {
    selectedTags: underCoveredTags.map((tag) => tag.problemTag),
    summary: {
      selectedProblemTagCount: underCoveredTags.length,
      exportedRecordCount: payload.records.length
    },
    payload
  };
}

export function renderCoverageRemediationMarkdown(report: CoverageRemediationReport): string {
  const lines = [
    "# Problem Tag Remediation Queue",
    "",
    `- health_rule: verified_direct_source_items>=${report.healthRule.minVerifiedDirectSourceItems} and distinct_verified_creators>=${report.healthRule.minDistinctVerifiedCreators}`,
    `- active_problem_tags: ${report.summary.activeProblemTagCount}`,
    `- healthy_problem_tags: ${report.summary.healthyProblemTagCount}`,
    `- under_covered_problem_tags: ${report.summary.underCoveredProblemTagCount}`,
    `- needs_new_sourcing_problem_tags: ${report.summary.needsNewSourcingProblemTagCount}`,
    "",
    "## Ranked Queue",
    "",
    "| problemTag | severity | verifiedCoverage | reviewedCoverage | verifiedCreators | reviewableCandidates | needsNewSourcing | diversityStatus |",
    "| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |",
    ...report.byProblemTag.map((entry) =>
      `| ${entry.problemTag} | ${entry.gapSeverity.gapSeverityScore} | ${entry.verifiedCoverage.verifiedDirectSourceCount} | ${entry.verifiedCoverage.reviewedDirectSourceCount} | ${entry.verifiedCoverage.verifiedCreatorCount} | ${entry.reviewableCandidates.length} | ${entry.remainingGap.needsNewSourcing} | ${entry.creatorDiversityStatus} |`
    ),
    "",
    "## Weak Tags",
    "",
    "| problemTag | verifiedCoverage | reviewableCandidates | remainingItemGap | remainingCreatorGap |",
    "| --- | ---: | ---: | ---: | ---: |",
    ...report.byProblemTag
      .filter((entry) => entry.isUnderCovered)
      .map((entry) =>
        `| ${entry.problemTag} | ${entry.verifiedCoverage.verifiedDirectSourceCount} | ${entry.reviewableCandidates.length} | ${entry.remainingGap.remainingVerifiedItemGapAfterCandidates} | ${entry.remainingGap.remainingVerifiedCreatorGapAfterCandidates} |`
      )
  ];

  return `${lines.join("\n")}\n`;
}
