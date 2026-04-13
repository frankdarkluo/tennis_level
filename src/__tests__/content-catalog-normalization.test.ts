import { describe, expect, it } from "vitest";
import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import { buildCatalogCorpus } from "@/lib/content-catalog/normalize";

describe("content catalog normalization", () => {
  it("normalizes curated and expanded corpus items into one canonical catalog shape", () => {
    const catalog = buildCatalogCorpus({
      curatedContents: contents,
      expandedContents
    });

    const curatedDirect = catalog.find((item) => item.id === "content_gaiao_01");
    const curatedSearch = catalog.find((item) => item.id === "content_zlx_02");
    const expandedDirect = catalog.find((item) => item.id === "content_expanded_bilibili_creator_austin_camp_bv1ewq8yyeii");

    expect(curatedDirect).toMatchObject({
      id: "content_gaiao_01",
      sourcePlatform: "Bilibili",
      canonicalUrl: "https://www.bilibili.com/video/BV1XM4y187mR",
      mediaType: "video",
      rightsStatus: "direct_source",
      ingestionMethod: "curated",
      skillCategories: ["forehand"],
      levelRange: ["2.5", "3.0"]
    });
    expect(curatedDirect?.qualityScore).toBeGreaterThan(0);

    expect(curatedSearch).toMatchObject({
      id: "content_zlx_02",
      rightsStatus: "search_link",
      ingestionMethod: "curated"
    });

    expect(expandedDirect).toMatchObject({
      id: "content_expanded_bilibili_creator_austin_camp_bv1ewq8yyeii",
      rightsStatus: "direct_source",
      ingestionMethod: "expanded"
    });
    expect((curatedDirect?.qualityScore ?? 0)).toBeGreaterThan(expandedDirect?.qualityScore ?? Number.POSITIVE_INFINITY);
  });

  it("merges optional quality-review overlay data without changing base content ownership", () => {
    const catalog = buildCatalogCorpus({
      curatedContents: [
        {
          id: "content_quality_overlay",
          title: "Serve rhythm",
          creatorId: "creator_overlay",
          platform: "YouTube",
          type: "video",
          levels: ["3.0"],
          skills: ["serve"],
          problemTags: ["serve-rhythm"],
          language: "en",
          summary: "summary",
          reason: "reason",
          useCases: ["use case"],
          coachReason: "coach reason",
          url: "https://www.youtube.com/watch?v=qualityOverlay"
        }
      ],
      expandedContents: [],
      qualityReviews: [
        {
          contentId: "content_quality_overlay",
          reviewStatus: "verified",
          thumbnailStatus: "ok",
          lastVerifiedAt: "2026-04-12T00:00:00.000Z",
          manualQcScore: 2
        }
      ]
    });

    const item = catalog.find((entry) => entry.id === "content_quality_overlay");

    expect(item).toMatchObject({
      id: "content_quality_overlay",
      ingestionMethod: "curated",
      rightsStatus: "direct_source",
      qualityReview: {
        reviewStatus: "verified",
        thumbnailStatus: "ok",
        lastVerifiedAt: "2026-04-12T00:00:00.000Z",
        manualQcScore: 2
      }
    });
    expect(item?.sourceItem.id).toBe("content_quality_overlay");
    expect(item?.qualityScore).toBeGreaterThan(100);
  });
});
