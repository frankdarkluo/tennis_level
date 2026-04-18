import { describe, expect, it } from "vitest";
import { retrieveCatalogRecommendations } from "@/lib/content-catalog/retrieve";
import { recommendationRegressionCases } from "@/data/recommendationRegressionCases";
import { recommendAttachedVideos } from "@/lib/recommendations/attached/recommend";

describe("teaching recommendation regressions", () => {
  it.each(recommendationRegressionCases)("keeps the expected slot package for $id", (testCase) => {
    const recommendations = recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext: testCase.guidanceContext,
      lexicalTerms: testCase.lexicalTerms,
      contentPool: testCase.contentPool,
      qualityReviews: testCase.qualityReviews,
      requiredIds: testCase.requiredIds,
      preferredIds: testCase.preferredIds,
      supportIds: testCase.supportIds,
      maxResults: testCase.maxResults ?? 3
    });

    expect(
      recommendations.map((entry) => ({
        slot: entry.slot,
        contentId: entry.item.id
      }))
    ).toEqual(testCase.expectedSlots);
  });

  it("does not change library retrieval ordering", () => {
    const testCase = recommendationRegressionCases[0];
    const intent = {
      source: "diagnosis" as const,
      problemTags: [testCase.guidanceContext.primaryProblemTag],
      lexicalTerms: testCase.lexicalTerms,
      level: testCase.guidanceContext.skillBand,
      maxResults: 3,
      contentPool: testCase.contentPool
    };

    const before = retrieveCatalogRecommendations(intent).map((item) => item.id);

    void recommendAttachedVideos({
      source: "diagnosis",
      guidanceContext: testCase.guidanceContext,
      lexicalTerms: testCase.lexicalTerms,
      contentPool: testCase.contentPool,
      qualityReviews: testCase.qualityReviews,
      maxResults: 3
    });

    const after = retrieveCatalogRecommendations(intent).map((item) => item.id);

    expect(after).toEqual(before);
  });
});
