import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import type { ContentItem } from "@/types/content";
import {
  buildRemoteVerificationTargets,
  classifyFetchOutcome,
  planThumbnailVerification,
  renderRemoteVerificationCsv
} from "../../scripts/lib/remoteVerification";

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

describe("remote verification helpers", () => {
  it("builds verification targets only for direct-source video items", () => {
    const targets = buildRemoteVerificationTargets({
      contents: [
        createContentItem({
          id: "direct_video",
          thumbnail: "https://img.youtube.com/vi/direct_video/maxresdefault.jpg"
        }),
        createContentItem({
          id: "search_video",
          url: "https://youtube.com/results?search_query=serve+rhythm"
        }),
        createContentItem({
          id: "article_item",
          type: "article",
          url: "https://example.com/article"
        })
      ],
      expandedContents: []
    });

    expect(targets).toEqual([
      expect.objectContaining({
        contentId: "direct_video",
        platform: "YouTube",
        canonicalUrl: "https://www.youtube.com/watch?v=direct_video",
        thumbnailUrl: "https://img.youtube.com/vi/direct_video/maxresdefault.jpg"
      })
    ]);
  });

  it("classifies fetch outcomes conservatively", () => {
    expect(classifyFetchOutcome({ ok: true, status: 200, finalUrl: "https://example.com/watch" })).toMatchObject({
      status: "reachable",
      needsManualReview: false
    });
    expect(classifyFetchOutcome({ ok: false, status: 404, finalUrl: "https://example.com/missing" })).toMatchObject({
      status: "dead",
      needsManualReview: true
    });
    expect(classifyFetchOutcome({ ok: false, status: 403, finalUrl: "https://example.com/blocked" })).toMatchObject({
      status: "blocked",
      needsManualReview: true
    });
    expect(classifyFetchOutcome({ ok: false, status: 500, finalUrl: "https://example.com/error" })).toMatchObject({
      status: "ambiguous",
      needsManualReview: true
    });
    expect(classifyFetchOutcome({ errorName: "AbortError", errorMessage: "timed out" })).toMatchObject({
      status: "timeout",
      needsManualReview: true
    });
  });

  it("plans local thumbnail checks for public assets and preserves remote thumbnails", () => {
    expect(planThumbnailVerification({
      thumbnailUrl: "/thumbnails/bilibili/example.jpg",
      publicRoot: "/repo/public"
    })).toEqual({
      mode: "local",
      assetPath: resolve("/repo/public", "./thumbnails/bilibili/example.jpg")
    });

    expect(planThumbnailVerification({
      thumbnailUrl: "https://img.youtube.com/vi/content_1/maxresdefault.jpg",
      publicRoot: "/repo/public"
    })).toEqual({
      mode: "remote",
      thumbnailUrl: "https://img.youtube.com/vi/content_1/maxresdefault.jpg"
    });
  });

  it("renders a CSV with the required review columns", () => {
    const csv = renderRemoteVerificationCsv([
      {
        contentId: "content_1",
        platform: "YouTube",
        canonicalUrl: "https://www.youtube.com/watch?v=content_1",
        thumbnailUrl: "https://img.youtube.com/vi/content_1/maxresdefault.jpg",
        checkedAt: "2026-04-12T00:00:00.000Z",
        linkStatus: "reachable",
        httpStatus: 200,
        finalUrl: "https://www.youtube.com/watch?v=content_1",
        thumbnailStatus: "reachable",
        errorReason: "",
        needsManualReview: false
      }
    ]);

    expect(csv).toContain("contentId,platform,canonicalUrl,thumbnailUrl,checkedAt,linkStatus,httpStatus,finalUrl,thumbnailStatus,errorReason,needsManualReview");
    expect(csv).toContain("content_1,YouTube");
  });
});
