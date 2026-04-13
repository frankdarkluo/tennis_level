import { describe, expect, it } from "vitest";
import type { ContentItem } from "@/types/content";
import type { DiagnosisRule } from "@/types/diagnosis";
import type { CatalogQualityReview } from "@/lib/content-catalog/schema";
import {
  buildCoverageRemediationReport,
  exportManualReviewCandidates
} from "../../scripts/lib/coverageRemediation";

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

describe("coverage remediation", () => {
  it("requires both verified item count and creator diversity for healthy coverage", () => {
    const contents = [
      createContentItem({ id: "v1", creatorId: "creator_a", problemTags: ["serve-rhythm"] }),
      createContentItem({ id: "v2", creatorId: "creator_a", problemTags: ["serve-rhythm"] }),
      createContentItem({ id: "v3", creatorId: "creator_a", problemTags: ["serve-rhythm"] }),
      createContentItem({ id: "candidate_1", creatorId: "creator_b", problemTags: ["serve-rhythm"] }),
      createContentItem({ id: "candidate_2", creatorId: "creator_c", problemTags: ["serve-rhythm"] }),
      createContentItem({ id: "search_only", creatorId: "creator_z", problemTags: ["slice-too-high"], url: "https://youtube.com/results?search_query=slice+depth" })
    ];
    const qualityReviews: CatalogQualityReview[] = [
      { contentId: "v1", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:00:00.000Z" },
      { contentId: "v2", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:00:00.000Z" },
      { contentId: "v3", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:00:00.000Z" }
    ];

    const report = buildCoverageRemediationReport({
      contents,
      expandedContents: [],
      diagnosisRules: [createRule("serve-rhythm"), createRule("backhand-slice-floating")],
      qualityReviews
    });
    const serveRhythm = report.byProblemTag.find((entry) => entry.problemTag === "serve-rhythm");
    const sliceFloating = report.byProblemTag.find((entry) => entry.problemTag === "backhand-slice-floating");

    expect(report.summary.activeProblemTagCount).toBe(2);
    expect(report.summary.healthyProblemTagCount).toBe(0);
    expect(serveRhythm).toMatchObject({
      problemTag: "serve-rhythm",
      verifiedCoverage: {
        verifiedDirectSourceCount: 3,
        verifiedCreatorCount: 1,
        reviewedDirectSourceCount: 3
      },
      creatorDiversityStatus: "under_diversified",
      isHealthy: false,
      remainingGap: {
        verifiedItemGap: 0,
        verifiedCreatorGap: 1
      }
    });
    expect(serveRhythm?.reviewableCandidates.map((candidate) => candidate.contentId)).toEqual([
      "candidate_1",
      "candidate_2"
    ]);
    expect(sliceFloating).toMatchObject({
      problemTag: "backhand-slice-floating",
      isUnderCovered: true
    });
  });

  it("exports existing catalog direct-source candidates into the PR3 manual review format", () => {
    const report = buildCoverageRemediationReport({
      contents: [
        createContentItem({ id: "verified_a", creatorId: "creator_a", problemTags: ["serve-rhythm"] }),
        createContentItem({ id: "candidate_b", creatorId: "creator_b", problemTags: ["serve-rhythm"] }),
        createContentItem({ id: "candidate_c", creatorId: "creator_c", problemTags: ["serve-rhythm"] }),
        createContentItem({ id: "other_tag", creatorId: "creator_d", problemTags: ["backhand-slice-floating"] })
      ],
      expandedContents: [],
      diagnosisRules: [createRule("serve-rhythm"), createRule("backhand-slice-floating")],
      qualityReviews: [
        { contentId: "verified_a", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:00:00.000Z" }
      ]
    });

    const exported = exportManualReviewCandidates(report, {
      tagsFilter: ["serve-rhythm"]
    });

    expect(exported.summary).toMatchObject({
      exportedRecordCount: 2,
      selectedProblemTagCount: 1
    });
    expect(exported.payload.records.map((record) => record.contentId)).toEqual(["candidate_b", "candidate_c"]);
    expect(exported.payload.records[0]).toMatchObject({
      reviewDecision: "skip",
      notes: expect.stringContaining("serve-rhythm"),
      evidence: {
        linkStatus: "direct_source_candidate"
      }
    });
  });

  it("re-measures coverage after imported verified reviews", () => {
    const contents = [
      createContentItem({ id: "verified_a", creatorId: "creator_a", problemTags: ["serve-rhythm"] }),
      createContentItem({ id: "verified_b", creatorId: "creator_b", problemTags: ["serve-rhythm"] }),
      createContentItem({ id: "candidate_c", creatorId: "creator_c", problemTags: ["serve-rhythm"] })
    ];
    const rules = [createRule("serve-rhythm")];

    const beforeReport = buildCoverageRemediationReport({
      contents,
      expandedContents: [],
      diagnosisRules: rules,
      qualityReviews: [
        { contentId: "verified_a", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:00:00.000Z" },
        { contentId: "verified_b", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:00:00.000Z" }
      ]
    });
    const afterReport = buildCoverageRemediationReport({
      contents,
      expandedContents: [],
      diagnosisRules: rules,
      qualityReviews: [
        { contentId: "verified_a", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:00:00.000Z" },
        { contentId: "verified_b", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:00:00.000Z" },
        { contentId: "candidate_c", reviewStatus: "verified", verifiedBy: "qa", lastVerifiedAt: "2026-04-13T00:10:00.000Z" }
      ]
    });

    expect(beforeReport.byProblemTag[0]).toMatchObject({
      isHealthy: false,
      remainingGap: {
        verifiedItemGap: 1
      }
    });
    expect(afterReport.byProblemTag[0]).toMatchObject({
      isHealthy: true,
      creatorDiversityStatus: "healthy",
      verifiedCoverage: {
        verifiedDirectSourceCount: 3,
        verifiedCreatorCount: 3
      }
    });
  });
});
