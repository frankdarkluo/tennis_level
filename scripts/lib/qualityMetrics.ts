import { buildCatalogCorpus } from "../../src/lib/content-catalog/normalize";
import type { CatalogContentItem, CatalogQualityReview } from "../../src/lib/content-catalog/schema";
import { buildAttachedDuplicateClusterId } from "../../src/lib/recommendations/attached/recommend";
import type { ContentItem } from "../../src/types/content";
import type { DiagnosisRule } from "../../src/types/diagnosis";
import { normalizeProblemTags, uniqueStrings } from "./contentNormalization";

type QualityVerificationBasis = "catalog_inferred_direct_source";

export type RecommendationSample = {
  id: string;
  lane: "diagnosis_rule_seeded" | "diagnosis_standard" | "diagnosis_deep" | "diagnosis_plan" | "assessment_plan";
  source: "diagnosis" | "plan";
  description: string;
  items: ContentItem[];
  expectedProblemTag?: string;
  matchedProblemTag?: string | null;
  matchedRuleId?: string | null;
};

type RecommendationSampleSummary = {
  id: string;
  lane: RecommendationSample["lane"];
  source: RecommendationSample["source"];
  description: string;
  totalReturned: number;
  directSourceReturned: number;
  searchLinkReturned: number;
  unknownReturned: number;
  returnedIds: string[];
  expectedProblemTag?: string;
  matchedProblemTag?: string | null;
  matchedRuleId?: string | null;
};

type RecommendationLaneSummary = {
  lane: RecommendationSample["lane"];
  sampleCount: number;
  zeroResultSamples: number;
  totalReturned: number;
  directSourceReturned: number;
  searchLinkReturned: number;
  unknownReturned: number;
  directSourceRate: number | null;
};

type RecommendationAttachedFlowSummary = {
  sampleCount: number;
  exactPrimaryTagHitRateAt3: number | null;
  manualRelevanceAcceptRateAt3: number | null;
  manualRelevanceAcceptRateAt3Method: "manual_qc_or_verified_proxy";
  creatorDiversityAt3: number | null;
  creatorDiversityCountAt3Average: number | null;
  duplicateClusterLeakageRateAt5: number | null;
  directSourceRateAt3: number | null;
  deadLinkRate: number | null;
  wrongTagSampledRate: number | null;
  thumbnailFailureRate: number | null;
};

export type RecommendationQualityReport = {
  verificationBasis: QualityVerificationBasis;
  summary: {
    sampleCount: number;
    totalReturned: number;
    directSourceReturned: number;
    searchLinkReturned: number;
    unknownReturned: number;
    recommendationDirectSourceRateOutput: number | null;
  };
  attachedFlowSummary: RecommendationAttachedFlowSummary;
  byLane: RecommendationLaneSummary[];
  samples: RecommendationSampleSummary[];
};

type PlatformCoverageSummary = {
  platform: string;
  totalItems: number;
  directSourceItems: number;
  searchLinkItems: number;
  unknownItems: number;
  curatedItems: number;
  expandedItems: number;
};

type ProblemTagCoverageSummary = {
  problemTag: string;
  totalItems: number;
  directSourceCount: number;
  searchLinkCount: number;
  unknownCount: number;
  directSourceCreatorCount: number;
  directSourcePlatformCount: number;
  directSourceIds: string[];
  searchLinkIds: string[];
};

type CreatorConcentrationSummary = {
  creatorId: string;
  directSourceCount: number;
  shareOfDirectSource: number;
  platforms: string[];
};

export type ProblemTagCoverageReport = {
  verificationBasis: QualityVerificationBasis;
  summary: {
    activeProblemTags: number;
    problemTagsWithThreePlusDirectSources: number;
    zeroDirectCoverageProblemTags: number;
    problemTagDirectCoverage3plusRate: number;
    totalVideoItems: number;
    directSourceVideoItems: number;
    searchLinkVideoItems: number;
    unknownVideoItems: number;
    curatedDirectSourceVideoItems: number;
    curatedVideoItems: number;
  };
  byPlatform: PlatformCoverageSummary[];
  byProblemTag: ProblemTagCoverageSummary[];
  byCreatorConcentration: CreatorConcentrationSummary[];
};

function toCatalogMap(contents: ContentItem[], expandedContents: ContentItem[], qualityReviews?: CatalogQualityReview[]) {
  const catalog = buildCatalogCorpus({
    curatedContents: contents,
    expandedContents,
    qualityReviews
  }).filter((item) => item.mediaType === "video");

  return new Map(catalog.map((item) => [item.id, item]));
}

function getCatalogEntry(
  item: ContentItem,
  catalogById: Map<string, CatalogContentItem>,
  qualityReviews?: CatalogQualityReview[]
): CatalogContentItem {
  const existing = catalogById.get(item.id);
  if (existing) {
    return existing;
  }

  return buildCatalogCorpus({
    curatedContents: [item],
    expandedContents: [],
    qualityReviews
  })[0];
}

function safeRate(numerator: number, denominator: number): number | null {
  if (denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function sortByName<T extends { lane?: string; problemTag?: string; creatorId?: string; platform?: string }>(left: T, right: T) {
  const leftKey = left.lane ?? left.problemTag ?? left.creatorId ?? left.platform ?? "";
  const rightKey = right.lane ?? right.problemTag ?? right.creatorId ?? right.platform ?? "";
  return leftKey.localeCompare(rightKey);
}

export function buildRecommendationQualityReport(input: {
  contents: ContentItem[];
  expandedContents: ContentItem[];
  samples: RecommendationSample[];
  qualityReviews?: CatalogQualityReview[];
}): RecommendationQualityReport {
  const catalogById = toCatalogMap(input.contents, input.expandedContents, input.qualityReviews);

  const samples = input.samples.map((sample): RecommendationSampleSummary => {
    const catalogItems = sample.items.map((item) => getCatalogEntry(item, catalogById, input.qualityReviews));
    const directSourceReturned = catalogItems.filter((item) => item.rightsStatus === "direct_source").length;
    const searchLinkReturned = catalogItems.filter((item) => item.rightsStatus === "search_link").length;
    const unknownReturned = catalogItems.filter((item) => item.rightsStatus === "unknown").length;

    return {
      id: sample.id,
      lane: sample.lane,
      source: sample.source,
      description: sample.description,
      totalReturned: sample.items.length,
      directSourceReturned,
      searchLinkReturned,
      unknownReturned,
      returnedIds: sample.items.map((item) => item.id),
      expectedProblemTag: sample.expectedProblemTag,
      matchedProblemTag: sample.matchedProblemTag,
      matchedRuleId: sample.matchedRuleId
    };
  });

  const lanes = uniqueStrings(samples.map((sample) => sample.lane)) as RecommendationSample["lane"][];
  const byLane = lanes
    .map((lane): RecommendationLaneSummary => {
      const laneSamples = samples.filter((sample) => sample.lane === lane);
      const totalReturned = laneSamples.reduce((sum, sample) => sum + sample.totalReturned, 0);
      const directSourceReturned = laneSamples.reduce((sum, sample) => sum + sample.directSourceReturned, 0);
      const searchLinkReturned = laneSamples.reduce((sum, sample) => sum + sample.searchLinkReturned, 0);
      const unknownReturned = laneSamples.reduce((sum, sample) => sum + sample.unknownReturned, 0);

      return {
        lane,
        sampleCount: laneSamples.length,
        zeroResultSamples: laneSamples.filter((sample) => sample.totalReturned === 0).length,
        totalReturned,
        directSourceReturned,
        searchLinkReturned,
        unknownReturned,
        directSourceRate: safeRate(directSourceReturned, totalReturned)
      };
    })
    .sort(sortByName);

  const totalReturned = samples.reduce((sum, sample) => sum + sample.totalReturned, 0);
  const directSourceReturned = samples.reduce((sum, sample) => sum + sample.directSourceReturned, 0);
  const searchLinkReturned = samples.reduce((sum, sample) => sum + sample.searchLinkReturned, 0);
  const unknownReturned = samples.reduce((sum, sample) => sum + sample.unknownReturned, 0);
  const attachedFlowSummary = buildAttachedFlowSummary(input.samples, catalogById, input.qualityReviews);

  return {
    verificationBasis: "catalog_inferred_direct_source",
    summary: {
      sampleCount: samples.length,
      totalReturned,
      directSourceReturned,
      searchLinkReturned,
      unknownReturned,
      recommendationDirectSourceRateOutput: safeRate(directSourceReturned, totalReturned)
    },
    attachedFlowSummary,
    byLane,
    samples
  };
}

function buildAttachedFlowSummary(
  samples: RecommendationSample[],
  catalogById: Map<string, CatalogContentItem>,
  qualityReviews?: CatalogQualityReview[]
): RecommendationAttachedFlowSummary {
  const attachedFlowLanes = new Set<RecommendationSample["lane"]>([
    "diagnosis_standard",
    "diagnosis_deep",
    "diagnosis_plan"
  ]);
  const attachedSamples = samples.filter((sample) => attachedFlowLanes.has(sample.lane));
  const topThreeEntries = attachedSamples.flatMap((sample) =>
    sample.items.slice(0, 3).map((item) => ({
      sample,
      item: getCatalogEntry(item, catalogById, qualityReviews)
    }))
  );
  const topFiveEntries = attachedSamples.map((sample) =>
    sample.items.slice(0, 5).map((item) => getCatalogEntry(item, catalogById, qualityReviews))
  );
  const samplesWithExpectedTag = attachedSamples.filter((sample) => Boolean(sample.expectedProblemTag));
  const exactPrimaryTagHitSamples = samplesWithExpectedTag.filter((sample) =>
    sample.items.slice(0, 3).some((item) =>
      normalizeProblemTags(getCatalogEntry(item, catalogById, qualityReviews).problemTags).includes(sample.expectedProblemTag!)
    )
  );
  const creatorDiversityScores = attachedSamples
    .map((sample) => {
      const topThree = sample.items.slice(0, 3);
      if (topThree.length === 0) {
        return null;
      }

      const uniqueCreatorCount = new Set(topThree.map((item) => item.creatorId)).size;
      return {
        normalized: uniqueCreatorCount / topThree.length,
        count: uniqueCreatorCount
      };
    })
    .filter((entry): entry is { normalized: number; count: number } => Boolean(entry));
  const wrongTagSamples = topThreeEntries.filter(({ sample, item }) =>
    sample.expectedProblemTag
      ? !normalizeProblemTags(item.problemTags).includes(sample.expectedProblemTag)
      : false
  );
  const duplicateLeakSamples = topFiveEntries.filter((items) => {
    const clusterIds = items.map((item) => buildAttachedDuplicateClusterId(item));
    return new Set(clusterIds).size !== clusterIds.length;
  });
  const directSourceTopThree = topThreeEntries.filter(({ item }) => item.rightsStatus === "direct_source").length;
  const deadLinkTopThree = topThreeEntries.filter(({ item }) => item.rightsStatus !== "direct_source" || !/^https?:\/\//i.test(item.sourceItem.url)).length;
  const thumbnailFailures = topThreeEntries.filter(({ item }) =>
    item.qualityReview?.thumbnailStatus === "broken"
      || item.qualityReview?.thumbnailStatus === "missing"
      || !item.display.thumbnail
  ).length;
  const manualAccepted = topThreeEntries.filter(({ item }) => isManualRelevantAccept(item)).length;

  return {
    sampleCount: attachedSamples.length,
    exactPrimaryTagHitRateAt3: safeRate(exactPrimaryTagHitSamples.length, samplesWithExpectedTag.length),
    manualRelevanceAcceptRateAt3: safeRate(manualAccepted, topThreeEntries.length),
    manualRelevanceAcceptRateAt3Method: "manual_qc_or_verified_proxy",
    creatorDiversityAt3: creatorDiversityScores.length === 0
      ? null
      : creatorDiversityScores.reduce((sum, entry) => sum + entry.normalized, 0) / creatorDiversityScores.length,
    creatorDiversityCountAt3Average: creatorDiversityScores.length === 0
      ? null
      : creatorDiversityScores.reduce((sum, entry) => sum + entry.count, 0) / creatorDiversityScores.length,
    duplicateClusterLeakageRateAt5: safeRate(duplicateLeakSamples.length, attachedSamples.length),
    directSourceRateAt3: safeRate(directSourceTopThree, topThreeEntries.length),
    deadLinkRate: safeRate(deadLinkTopThree, topThreeEntries.length),
    wrongTagSampledRate: safeRate(wrongTagSamples.length, topThreeEntries.filter(({ sample }) => Boolean(sample.expectedProblemTag)).length),
    thumbnailFailureRate: safeRate(thumbnailFailures, topThreeEntries.length)
  };
}

function isManualRelevantAccept(item: CatalogContentItem): boolean {
  if (item.qualityReview?.reviewStatus === "rejected" || item.qualityReview?.reviewStatus === "suspect") {
    return false;
  }

  if (typeof item.qualityReview?.manualQcScore === "number") {
    return item.qualityReview.manualQcScore >= 0;
  }

  if (item.qualityReview?.reviewStatus === "verified" || item.qualityReview?.reviewStatus === "manual_confirmed") {
    return true;
  }

  return item.ingestionMethod === "curated" && item.rightsStatus === "direct_source";
}

export function buildProblemTagCoverageReport(input: {
  contents: ContentItem[];
  expandedContents: ContentItem[];
  diagnosisRules: Pick<DiagnosisRule, "problemTag">[];
}): ProblemTagCoverageReport {
  const catalog = buildCatalogCorpus({
    curatedContents: input.contents,
    expandedContents: input.expandedContents
  }).filter((item) => item.mediaType === "video");

  const activeProblemTags = uniqueStrings(input.diagnosisRules.map((rule) => rule.problemTag)).sort((left, right) =>
    left.localeCompare(right)
  );

  const byProblemTag = activeProblemTags
    .map((problemTag): ProblemTagCoverageSummary => {
      const matchingItems = catalog.filter((item) => normalizeProblemTags(item.problemTags).includes(problemTag));
      const directItems = matchingItems.filter((item) => item.rightsStatus === "direct_source");
      const searchItems = matchingItems.filter((item) => item.rightsStatus === "search_link");
      const unknownItems = matchingItems.filter((item) => item.rightsStatus === "unknown");

      return {
        problemTag,
        totalItems: matchingItems.length,
        directSourceCount: directItems.length,
        searchLinkCount: searchItems.length,
        unknownCount: unknownItems.length,
        directSourceCreatorCount: uniqueStrings(directItems.map((item) => item.creatorId)).length,
        directSourcePlatformCount: uniqueStrings(directItems.map((item) => item.sourcePlatform)).length,
        directSourceIds: directItems.map((item) => item.id),
        searchLinkIds: searchItems.map((item) => item.id)
      };
    })
    .sort(sortByName);

  const byPlatform = uniqueStrings(catalog.map((item) => item.sourcePlatform))
    .map((platform): PlatformCoverageSummary => {
      const items = catalog.filter((item) => item.sourcePlatform === platform);
      return {
        platform,
        totalItems: items.length,
        directSourceItems: items.filter((item) => item.rightsStatus === "direct_source").length,
        searchLinkItems: items.filter((item) => item.rightsStatus === "search_link").length,
        unknownItems: items.filter((item) => item.rightsStatus === "unknown").length,
        curatedItems: items.filter((item) => item.ingestionMethod === "curated").length,
        expandedItems: items.filter((item) => item.ingestionMethod === "expanded").length
      };
    })
    .sort(sortByName);

  const directItems = catalog.filter((item) => item.rightsStatus === "direct_source");
  const byCreatorConcentration = uniqueStrings(directItems.map((item) => item.creatorId))
    .map((creatorId): CreatorConcentrationSummary => {
      const creatorItems = directItems.filter((item) => item.creatorId === creatorId);
      return {
        creatorId,
        directSourceCount: creatorItems.length,
        shareOfDirectSource: safeRate(creatorItems.length, directItems.length) ?? 0,
        platforms: uniqueStrings(creatorItems.map((item) => item.sourcePlatform)).sort((left, right) => left.localeCompare(right))
      };
    })
    .sort((left, right) => {
      if (right.directSourceCount !== left.directSourceCount) {
        return right.directSourceCount - left.directSourceCount;
      }

      return left.creatorId.localeCompare(right.creatorId);
    });

  const coveredWithThreePlus = byProblemTag.filter((entry) => entry.directSourceCount >= 3).length;
  const zeroDirectCoverageProblemTags = byProblemTag.filter((entry) => entry.directSourceCount === 0).length;
  const curatedItems = catalog.filter((item) => item.ingestionMethod === "curated");

  return {
    verificationBasis: "catalog_inferred_direct_source",
    summary: {
      activeProblemTags: activeProblemTags.length,
      problemTagsWithThreePlusDirectSources: coveredWithThreePlus,
      zeroDirectCoverageProblemTags,
      problemTagDirectCoverage3plusRate: activeProblemTags.length === 0 ? 0 : coveredWithThreePlus / activeProblemTags.length,
      totalVideoItems: catalog.length,
      directSourceVideoItems: directItems.length,
      searchLinkVideoItems: catalog.filter((item) => item.rightsStatus === "search_link").length,
      unknownVideoItems: catalog.filter((item) => item.rightsStatus === "unknown").length,
      curatedDirectSourceVideoItems: curatedItems.filter((item) => item.rightsStatus === "direct_source").length,
      curatedVideoItems: curatedItems.length
    },
    byPlatform,
    byProblemTag,
    byCreatorConcentration
  };
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "n/a";
  }

  return `${(value * 100).toFixed(1)}%`;
}

export function renderRecommendationQualityMarkdown(report: RecommendationQualityReport): string {
  const lines = [
    "# Recommendation Quality Baseline",
    "",
    `- verification_basis: \`${report.verificationBasis}\``,
    `- recommendation_direct_source_rate_output: **${formatPercent(report.summary.recommendationDirectSourceRateOutput)}**`,
    `- direct_source_returned: ${report.summary.directSourceReturned}`,
    `- total_returned: ${report.summary.totalReturned}`,
    "",
    "## Attached Flow Metrics",
    "",
    `- exact_primary_tag_hit_rate@3: **${formatPercent(report.attachedFlowSummary.exactPrimaryTagHitRateAt3)}**`,
    `- manual_relevance_accept_rate@3: **${formatPercent(report.attachedFlowSummary.manualRelevanceAcceptRateAt3)}**`,
    `- manual_relevance_accept_rate@3_method: \`${report.attachedFlowSummary.manualRelevanceAcceptRateAt3Method}\``,
    `- creator_diversity@3: **${formatPercent(report.attachedFlowSummary.creatorDiversityAt3)}**`,
    `- creator_diversity_count_avg@3: ${report.attachedFlowSummary.creatorDiversityCountAt3Average?.toFixed(2) ?? "n/a"}`,
    `- duplicate_cluster_leakage_rate@5: **${formatPercent(report.attachedFlowSummary.duplicateClusterLeakageRateAt5)}**`,
    `- direct_source_rate@3: **${formatPercent(report.attachedFlowSummary.directSourceRateAt3)}**`,
    `- dead_link_rate: **${formatPercent(report.attachedFlowSummary.deadLinkRate)}**`,
    `- wrong_tag_sampled_rate: **${formatPercent(report.attachedFlowSummary.wrongTagSampledRate)}**`,
    `- thumbnail_failure_rate: **${formatPercent(report.attachedFlowSummary.thumbnailFailureRate)}**`,
    "",
    "## By Lane",
    "",
    "| lane | samples | zero_result | direct_source | total | direct_source_rate |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...report.byLane.map((entry) =>
      `| ${entry.lane} | ${entry.sampleCount} | ${entry.zeroResultSamples} | ${entry.directSourceReturned} | ${entry.totalReturned} | ${formatPercent(entry.directSourceRate)} |`
    )
  ];

  return `${lines.join("\n")}\n`;
}

export function renderProblemTagCoverageMarkdown(report: ProblemTagCoverageReport): string {
  const weakTags = report.byProblemTag.filter((entry) => entry.directSourceCount < 3);
  const topCreators = report.byCreatorConcentration.slice(0, 15);
  const lines = [
    "# Problem Tag Coverage Baseline",
    "",
    `- verification_basis: \`${report.verificationBasis}\``,
    `- problem_tag_direct_coverage_3plus_rate: **${formatPercent(report.summary.problemTagDirectCoverage3plusRate)}**`,
    `- active_problem_tags: ${report.summary.activeProblemTags}`,
    `- tags_with_3plus_direct_source: ${report.summary.problemTagsWithThreePlusDirectSources}`,
    `- zero_direct_coverage_problem_tags: ${report.summary.zeroDirectCoverageProblemTags}`,
    "",
    "## By Platform",
    "",
    "| platform | total | direct_source | search_link | unknown | curated | expanded |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
    ...report.byPlatform.map((entry) =>
      `| ${entry.platform} | ${entry.totalItems} | ${entry.directSourceItems} | ${entry.searchLinkItems} | ${entry.unknownItems} | ${entry.curatedItems} | ${entry.expandedItems} |`
    ),
    "",
    "## Problem Tags",
    "",
    "| problemTag | total | direct_source | search_link | creators | direct_platforms |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...report.byProblemTag.map((entry) =>
      `| ${entry.problemTag} | ${entry.totalItems} | ${entry.directSourceCount} | ${entry.searchLinkCount} | ${entry.directSourceCreatorCount} | ${entry.directSourcePlatformCount} |`
    ),
    "",
    "## Weak Tags (<3 direct-source)",
    "",
    "| problemTag | direct_source | total | search_link_ids |",
    "| --- | ---: | ---: | --- |",
    ...weakTags.map((entry) =>
      `| ${entry.problemTag} | ${entry.directSourceCount} | ${entry.totalItems} | ${entry.searchLinkIds.join(", ") || "-"} |`
    ),
    "",
    "## Creator Concentration",
    "",
    "| creatorId | direct_source | share_of_direct_source | platforms |",
    "| --- | ---: | ---: | --- |",
    ...topCreators.map((entry) =>
      `| ${entry.creatorId} | ${entry.directSourceCount} | ${formatPercent(entry.shareOfDirectSource)} | ${entry.platforms.join(", ") || "-"} |`
    )
  ];

  return `${lines.join("\n")}\n`;
}
