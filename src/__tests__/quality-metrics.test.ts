import { describe, expect, it } from "vitest";
import type { ContentItem } from "@/types/content";
import type { DiagnosisRule } from "@/types/diagnosis";
import {
  buildProblemTagCoverageReport,
  buildRecommendationQualityReport,
  renderProblemTagCoverageMarkdown,
  renderRecommendationQualityMarkdown,
  type RecommendationSample
} from "../../scripts/lib/qualityMetrics";

function createContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: overrides.id ?? "content_1",
    title: overrides.title ?? "Default title",
    creatorId: overrides.creatorId ?? "creator_1",
    platform: overrides.platform ?? "YouTube",
    type: overrides.type ?? "video",
    levels: overrides.levels ?? ["3.0"],
    skills: overrides.skills ?? ["serve"],
    problemTags: overrides.problemTags ?? ["serve-rhythm"],
    language: overrides.language ?? "en",
    summary: overrides.summary ?? "summary",
    reason: overrides.reason ?? "reason",
    useCases: overrides.useCases ?? ["use case"],
    coachReason: overrides.coachReason ?? "coach reason",
    url: overrides.url ?? `https://www.youtube.com/watch?v=${overrides.id ?? "content_1"}`,
    environment: overrides.environment ?? ["testing", "production"],
    ...overrides
  };
}

function createRule(problemTag: DiagnosisRule["problemTag"]): DiagnosisRule {
  return {
    id: `rule_${problemTag}`,
    keywords: [problemTag],
    category: ["serve"],
    problemTag,
    causes: ["cause"],
    fixes: ["fix"],
    drills: ["drill"],
    recommendedContentIds: [],
    searchQueries: {
      bilibili: [],
      youtube: []
    },
    environment: ["testing", "production"]
  };
}

describe("quality metrics helpers", () => {
  it("normalizes problem tags before calculating 3-plus direct coverage and weak-tag gaps", () => {
    const directAliasA = createContentItem({
      id: "direct_alias_a",
      creatorId: "creator_a",
      problemTags: ["second-serve-confidence"],
      url: "https://www.youtube.com/watch?v=directAliasA"
    });
    const directAliasB = createContentItem({
      id: "direct_alias_b",
      creatorId: "creator_a",
      problemTags: ["second-serve-confidence"],
      url: "https://www.youtube.com/watch?v=directAliasB"
    });
    const directCanonical = createContentItem({
      id: "direct_canonical",
      creatorId: "creator_b",
      problemTags: ["second-serve-reliability"],
      url: "https://www.youtube.com/watch?v=directCanonical"
    });
    const searchOnly = createContentItem({
      id: "search_only",
      creatorId: "creator_c",
      problemTags: ["slice-too-high"],
      url: "https://youtube.com/results?search_query=slice+depth"
    });

    const report = buildProblemTagCoverageReport({
      contents: [directAliasA, directAliasB, directCanonical, searchOnly],
      expandedContents: [],
      diagnosisRules: [
        createRule("second-serve-reliability"),
        createRule("backhand-slice-floating")
      ]
    });

    expect(report.summary.problemTagDirectCoverage3plusRate).toBe(0.5);
    expect(report.summary.problemTagsWithThreePlusDirectSources).toBe(1);
    expect(report.summary.activeProblemTags).toBe(2);
    expect(report.byProblemTag[0]).toMatchObject({
      problemTag: "backhand-slice-floating",
      directSourceCount: 0,
      searchLinkIds: ["search_only"]
    });
    expect(report.byProblemTag[1]).toMatchObject({
      problemTag: "second-serve-reliability",
      directSourceCount: 3,
      directSourceCreatorCount: 2
    });

    const markdown = renderProblemTagCoverageMarkdown(report);
    expect(markdown).toContain("problem_tag_direct_coverage_3plus_rate");
    expect(markdown).toContain("second-serve-reliability");
    expect(markdown).toContain("search_only");
  });

  it("measures output direct-source rate from returned recommendation samples", () => {
    const directCurated = createContentItem({
      id: "direct_curated",
      creatorId: "creator_a",
      problemTags: ["serve-rhythm"],
      url: "https://www.youtube.com/watch?v=directCurated"
    });
    const searchCurated = createContentItem({
      id: "search_curated",
      creatorId: "creator_b",
      problemTags: ["serve-rhythm"],
      url: "https://youtube.com/results?search_query=serve+rhythm"
    });
    const directExpanded = createContentItem({
      id: "direct_expanded",
      creatorId: "creator_c",
      platform: "Bilibili",
      problemTags: ["serve-rhythm"],
      url: "https://www.bilibili.com/video/BV1aA4111111"
    });

    const samples: RecommendationSample[] = [
      {
        id: "diagnosis_standard_serve",
        lane: "diagnosis_standard",
        source: "diagnosis",
        description: "standard diagnose sample",
        items: [directCurated, searchCurated]
      },
      {
        id: "assessment_plan_serve",
        lane: "assessment_plan",
        source: "plan",
        description: "assessment plan sample",
        items: [directExpanded]
      }
    ];

    const report = buildRecommendationQualityReport({
      contents: [directCurated, searchCurated],
      expandedContents: [directExpanded],
      samples
    });

    expect(report.summary.recommendationDirectSourceRateOutput).toBeCloseTo(2 / 3, 5);
    expect(report.summary.directSourceReturned).toBe(2);
    expect(report.summary.totalReturned).toBe(3);
    expect(report.byLane).toEqual([
      expect.objectContaining({
        lane: "assessment_plan",
        directSourceReturned: 1,
        totalReturned: 1
      }),
      expect.objectContaining({
        lane: "diagnosis_standard",
        directSourceReturned: 1,
        totalReturned: 2
      })
    ]);

    const markdown = renderRecommendationQualityMarkdown(report);
    expect(markdown).toContain("recommendation_direct_source_rate_output");
    expect(markdown).toContain("diagnosis_standard");
    expect(markdown).toContain("assessment_plan");
  });
});
