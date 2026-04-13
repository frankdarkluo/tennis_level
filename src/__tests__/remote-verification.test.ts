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
        }),
        createContentItem({
          id: "xhs_direct_video",
          platform: "Xiaohongshu",
          language: "zh",
          url: "https://www.xiaohongshu.com/explore/66abc123def4567890123456?xsec_token=abc"
        }),
        createContentItem({
          id: "instagram_direct_video",
          platform: "Instagram",
          url: "https://www.instagram.com/reel/C9abcDEF123/?igsh=base"
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
      }),
      expect.objectContaining({
        contentId: "xhs_direct_video",
        platform: "Xiaohongshu",
        canonicalUrl: "https://www.xiaohongshu.com/explore/66abc123def4567890123456"
      }),
      expect.objectContaining({
        contentId: "instagram_direct_video",
        platform: "Instagram",
        canonicalUrl: "https://www.instagram.com/reel/C9abcDEF123/"
      })
    ]);
  });

  it("classifies fetch outcomes conservatively", () => {
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.youtube.com/watch?v=ok",
      ok: true,
      status: 200,
      finalUrl: "https://www.youtube.com/watch?v=ok"
    })).toMatchObject({
      status: "reachable",
      failureClass: null,
      decisionReason: "http_ok_supported_surface",
      retrySuggested: false,
      needsManualReview: false
    });
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.xiaohongshu.com/explore/66abc123def4567890123456",
      ok: true,
      status: 200,
      finalUrl: "https://www.xiaohongshu.com/explore/66abc123def4567890123456"
    })).toMatchObject({
      status: "reachable",
      failureClass: null,
      decisionReason: "http_ok_supported_surface"
    });
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.instagram.com/reel/C9abcDEF123/",
      ok: true,
      status: 200,
      finalUrl: "https://www.instagram.com/reel/C9abcDEF123/"
    })).toMatchObject({
      status: "reachable",
      failureClass: null,
      decisionReason: "http_ok_supported_surface"
    });
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.youtube.com/watch?v=missing",
      ok: false,
      status: 404,
      finalUrl: "https://www.youtube.com/watch?v=missing"
    })).toMatchObject({
      status: "dead",
      failureClass: null,
      needsManualReview: true
    });
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.youtube.com/watch?v=blocked",
      ok: false,
      status: 403,
      finalUrl: "https://www.youtube.com/watch?v=blocked"
    })).toMatchObject({
      status: "blocked",
      failureClass: "platform_blocking",
      decisionReason: "http_403",
      retrySuggested: false,
      needsManualReview: true
    });
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.youtube.com/watch?v=error",
      ok: false,
      status: 500,
      finalUrl: "https://www.youtube.com/watch?v=error"
    })).toMatchObject({
      status: "ambiguous",
      failureClass: "unknown",
      retrySuggested: true,
      needsManualReview: true
    });
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.youtube.com/watch?v=timeout",
      errorName: "AbortError",
      errorMessage: "timed out"
    })).toMatchObject({
      status: "timeout",
      failureClass: "network_runtime_failure",
      decisionReason: "abort_timeout",
      retrySuggested: true,
      needsManualReview: true
    });
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.youtube.com/watch?v=network",
      errorMessage: "fetch failed: ECONNRESET"
    })).toMatchObject({
      status: "network_error",
      failureClass: "network_runtime_failure",
      decisionReason: "network_runtime_error",
      retrySuggested: true,
      needsManualReview: true
    });
    expect(classifyFetchOutcome({
      verificationSurface: "canonical_url",
      originalUrl: "https://www.youtube.com/watch?v=redirected",
      ok: true,
      status: 200,
      finalUrl: "https://www.youtube.com/post/Ugkxredirected"
    })).toMatchObject({
      status: "redirect_unverified",
      failureClass: "redirect_unverified",
      decisionReason: "redirected_to_unverified_surface",
      retrySuggested: false,
      needsManualReview: true
    });
    expect(classifyFetchOutcome({
      verificationSurface: "remote_thumbnail",
      originalUrl: "https://img.youtube.com/vi/content_1/maxresdefault.jpg",
      errorMessage: "Failed to parse URL from ftp://example.com/file.jpg"
    })).toMatchObject({
      status: "unsupported",
      failureClass: "unsupported_surface",
      decisionReason: "unsupported_verification_surface",
      retrySuggested: false,
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
        verificationSurface: "canonical_url",
        failureClass: null,
        decisionReason: "http_ok_supported_surface",
        retrySuggested: false,
        thumbnailStatus: "reachable",
        thumbnailDecisionReason: "",
        errorReason: "",
        needsManualReview: false
      }
    ]);

    expect(csv).toContain("contentId,platform,canonicalUrl,thumbnailUrl,checkedAt,linkStatus,httpStatus,finalUrl,verificationSurface,failureClass,decisionReason,retrySuggested,thumbnailStatus,thumbnailDecisionReason,errorReason,needsManualReview");
    expect(csv).toContain("content_1,YouTube");
  });
});
