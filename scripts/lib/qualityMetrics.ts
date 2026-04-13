import { buildCatalogCorpus } from "../../src/lib/content-catalog/normalize";
import type { CatalogContentItem } from "../../src/lib/content-catalog/schema";
import type { ContentItem } from "../../src/types/content";
import type { DiagnosisRule } from "../../src/types/diagnosis";
import { normalizeProblemTags, uniqueStrings } from "./contentNormalization";

type QualityVerificationBasis = "catalog_inferred_direct_source";

export type RecommendationSample = {
  id: string;
  lane: "diagnosis_rule_seeded" | "diagnosis_standard" | "diagnosis_deep" | "assessment_plan";
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

function toCatalogMap(contents: ContentItem[], expandedContents: ContentItem[]) {
  const catalog = buildCatalogCorpus({
    curatedContents: contents,
    expandedContents
  }).filter((item) => item.mediaType === "video");

  return new Map(catalog.map((item) => [item.id, item]));
}

function getCatalogEntry(
  item: ContentItem,
  catalogById: Map<string, CatalogContentItem>
): CatalogContentItem {
  const existing = catalogById.get(item.id);
  if (existing) {
    return existing;
  }

  return buildCatalogCorpus({
    curatedContents: [item],
    expandedContents: []
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
}): RecommendationQualityReport {
  const catalogById = toCatalogMap(input.contents, input.expandedContents);

  const samples = input.samples.map((sample): RecommendationSampleSummary => {
    const catalogItems = sample.items.map((item) => getCatalogEntry(item, catalogById));
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
    byLane,
    samples
  };
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
