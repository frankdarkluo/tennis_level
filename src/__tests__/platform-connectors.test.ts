import { describe, expect, it } from "vitest";
import { buildCatalogCorpus } from "@/lib/content-catalog/normalize";
import { instagramConnector } from "@/lib/platform-connectors/instagram";
import { xiaohongshuConnector } from "@/lib/platform-connectors/xiaohongshu";
import type { ContentItem } from "@/types/content";

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

describe("platform connectors", () => {
  it("normalizes supported Xiaohongshu and Instagram direct-source URLs in the catalog", () => {
    const catalog = buildCatalogCorpus({
      curatedContents: [
        createContentItem({
          id: "xhs_direct",
          platform: "Xiaohongshu",
          language: "zh",
          url: "https://www.xiaohongshu.com/explore/66abc123def4567890123456?xsec_token=abc&xsec_source=pc_search"
        }),
        createContentItem({
          id: "xhs_search",
          platform: "Xiaohongshu",
          language: "zh",
          url: "https://www.xiaohongshu.com/search_result?keyword=%E5%8F%91%E7%90%83"
        }),
        createContentItem({
          id: "instagram_direct",
          platform: "Instagram",
          url: "https://www.instagram.com/reel/C9abcDEF123/?igsh=YmFzZQ%3D%3D"
        }),
        createContentItem({
          id: "instagram_search",
          platform: "Instagram",
          url: "https://www.instagram.com/explore/search/keyword/?q=serve"
        })
      ],
      expandedContents: []
    });

    expect(catalog.find((item) => item.id === "xhs_direct")).toMatchObject({
      canonicalUrl: "https://www.xiaohongshu.com/explore/66abc123def4567890123456",
      rightsStatus: "direct_source"
    });
    expect(catalog.find((item) => item.id === "xhs_search")).toMatchObject({
      rightsStatus: "search_link"
    });
    expect(catalog.find((item) => item.id === "instagram_direct")).toMatchObject({
      canonicalUrl: "https://www.instagram.com/reel/C9abcDEF123/",
      rightsStatus: "direct_source"
    });
    expect(catalog.find((item) => item.id === "instagram_search")).toMatchObject({
      rightsStatus: "search_link"
    });
  });

  it("keeps unsupported Xiaohongshu and Instagram surfaces conservative", () => {
    expect(
      xiaohongshuConnector.canonicalizeUrl(
        "https://www.xiaohongshu.com/search_result?keyword=%E5%8F%91%E7%90%83"
      )
    ).toBeNull();
    expect(xiaohongshuConnector.inferRightsStatus("https://www.xiaohongshu.com/user/profile/abc123")).toBe("unknown");

    expect(instagramConnector.canonicalizeUrl("https://www.instagram.com/coach_sam/")).toBeNull();
    expect(instagramConnector.inferRightsStatus("https://www.instagram.com/coach_sam/")).toBe("unknown");

    const catalog = buildCatalogCorpus({
      curatedContents: [
        createContentItem({
          id: "xhs_unsupported",
          platform: "Xiaohongshu",
          language: "zh",
          url: "https://www.xiaohongshu.com/user/profile/abc123"
        }),
        createContentItem({
          id: "instagram_unsupported",
          platform: "Instagram",
          url: "https://www.instagram.com/coach_sam/"
        })
      ],
      expandedContents: []
    });

    expect(catalog.find((item) => item.id === "xhs_unsupported")).toMatchObject({
      canonicalUrl: "https://www.xiaohongshu.com/user/profile/abc123",
      rightsStatus: "unknown"
    });
    expect(catalog.find((item) => item.id === "instagram_unsupported")).toMatchObject({
      canonicalUrl: "https://www.instagram.com/coach_sam",
      rightsStatus: "unknown"
    });
  });

  it("preserves existing Bilibili and YouTube direct-source normalization behavior", () => {
    const catalog = buildCatalogCorpus({
      curatedContents: [
        createContentItem({
          id: "bilibili_direct",
          platform: "Bilibili",
          language: "zh",
          url: "https://www.bilibili.com/video/BV1SZ6qYFEVS/?spm_id_from=333.788"
        }),
        createContentItem({
          id: "bilibili_av_direct",
          platform: "Bilibili",
          language: "zh",
          url: "https://www.bilibili.com/video/av220842429?spm_id_from=333.788"
        }),
        createContentItem({
          id: "youtube_direct",
          platform: "YouTube",
          url: "https://youtu.be/C9abcDEF123?t=10"
        })
      ],
      expandedContents: []
    });

    expect(catalog.find((item) => item.id === "bilibili_direct")).toMatchObject({
      canonicalUrl: "https://www.bilibili.com/video/BV1SZ6qYFEVS",
      rightsStatus: "direct_source"
    });
    expect(catalog.find((item) => item.id === "bilibili_av_direct")).toMatchObject({
      canonicalUrl: "https://www.bilibili.com/video/av220842429",
      rightsStatus: "direct_source"
    });
    expect(catalog.find((item) => item.id === "youtube_direct")).toMatchObject({
      canonicalUrl: "https://www.youtube.com/watch?v=C9abcDEF123",
      rightsStatus: "direct_source"
    });
  });

  it("extracts post ids and normalizes creator handles for new connector scaffolds", () => {
    expect(
      xiaohongshuConnector.extractPostId(
        "https://www.xiaohongshu.com/explore/66abc123def4567890123456?xsec_token=abc"
      )
    ).toBe("66abc123def4567890123456");
    expect(xiaohongshuConnector.normalizeCreatorHandle?.(" @Coach.Zhang ")).toBe("coach.zhang");

    expect(
      instagramConnector.extractPostId("https://www.instagram.com/reel/C9abcDEF123/?igsh=base")
    ).toBe("C9abcDEF123");
    expect(instagramConnector.normalizeCreatorHandle?.(" @Coach_Sam ")).toBe("coach_sam");
  });
});
