import { describe, expect, it } from "vitest";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { contentQualityReviews } from "@/data/contentQualityReviews";
import { buildCatalogCorpus } from "@/lib/content-catalog/normalize";

const PROMOTED_CONTENT_IDS = [
  "content_xhs_gaiao_01",
  "content_xhs_gaiao_02",
  "content_xhs_gaiao_03",
  "content_xhs_gaiao_04",
  "content_xhs_gaiao_05",
  "content_xhs_lingxi_01",
  "content_xhs_lingxi_02",
  "content_xhs_lingxi_03",
  "content_xhs_lingxi_04",
  "content_xhs_lingxi_05",
  "content_xhs_mouratoglou_01",
  "content_xhs_mouratoglou_02",
  "content_xhs_mouratoglou_03",
  "content_xhs_mouratoglou_04",
  "content_xhs_mouratoglou_05"
] as const;

const HIDDEN_CREATOR_IDS = [
  "creator_gaiao_xiaohongshu_hidden",
  "creator_lingxi_xiaohongshu_hidden",
  "creator_mouratoglou_xiaohongshu_hidden"
] as const;

describe("xiaohongshu seed promotion", () => {
  it("promotes the full manually approved Xiaohongshu seed set with hidden source creators", () => {
    const promotedContents = contents.filter((item) => PROMOTED_CONTENT_IDS.includes(item.id as (typeof PROMOTED_CONTENT_IDS)[number]));

    expect(promotedContents).toHaveLength(15);
    expect(promotedContents.map((item) => item.id)).toEqual(PROMOTED_CONTENT_IDS);

    for (const item of promotedContents) {
      expect(item.platform).toBe("Xiaohongshu");
      expect(item.type).toBe("video");
      expect(item.url).toMatch(/^https:\/\/www\.xiaohongshu\.com\/explore\//);
      expect(item.thumbnail).toMatch(/^\/thumbnails\/xiaohongshu\//);
      expect(item.problemTags.length).toBeGreaterThan(0);
      expect(item.environment).toBeTruthy();
    }

    const hiddenCreators = creators.filter((creator) =>
      HIDDEN_CREATOR_IDS.includes(creator.id as (typeof HIDDEN_CREATOR_IDS)[number])
    );

    expect(hiddenCreators).toHaveLength(3);
    for (const creator of hiddenCreators) {
      expect(creator.platforms).toEqual(["Xiaohongshu"]);
      expect(creator.rankingEligible).toBe(false);
      expect(creator.discoveryEligible).toBe(false);
      expect(creator.profileUrl).toMatch(/^https:\/\/www\.xiaohongshu\.com\/user\/profile\//);
      expect(creator.featuredContentIds).toHaveLength(5);
    }
  });

  it("keeps promoted Xiaohongshu items as direct-source verified catalog entries", () => {
    const promotedReviewIds = contentQualityReviews
      .filter((review) => PROMOTED_CONTENT_IDS.includes(review.contentId as (typeof PROMOTED_CONTENT_IDS)[number]))
      .map((review) => review.contentId);

    expect(promotedReviewIds).toEqual(PROMOTED_CONTENT_IDS);

    const catalog = buildCatalogCorpus({
      curatedContents: contents,
      expandedContents: [],
      qualityReviews: contentQualityReviews
    });

    const promotedCatalog = PROMOTED_CONTENT_IDS.map((id) => catalog.find((item) => item.id === id));

    expect(promotedCatalog).toHaveLength(15);
    for (const item of promotedCatalog) {
      expect(item).toEqual(expect.objectContaining({
        sourcePlatform: "Xiaohongshu",
        rightsStatus: "direct_source",
        qualityReview: expect.objectContaining({
          reviewStatus: "verified"
        })
      }));
      expect(item?.canonicalUrl).toMatch(/^https:\/\/www\.xiaohongshu\.com\/explore\//);
    }
  });
});
