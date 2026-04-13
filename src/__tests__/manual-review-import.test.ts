import { describe, expect, it } from "vitest";
import {
  buildManualReviewImportArtifacts,
  parseManualReviewInput
} from "../../scripts/lib/manualReviewImport";

describe("manual review import", () => {
  it("fails clearly for invalid or incomplete manual review rows", () => {
    expect(() => parseManualReviewInput(JSON.stringify({
      version: 1,
      records: [
        {
          contentId: "content_missing",
          reviewDecision: "suspect",
          verifiedBy: "",
          lastVerifiedAt: "not-a-date",
          notes: ""
        }
      ]
    }), {
      allowedContentIds: new Set(["content_ok"])
    })).toThrow(/content_missing|verifiedBy|lastVerifiedAt|notes/i);
  });

  it("converts approved manual review rows into overlay-compatible review entries", () => {
    const artifacts = buildManualReviewImportArtifacts({
      rawInput: JSON.stringify({
        version: 1,
        records: [
          {
            contentId: "content_ok",
            reviewDecision: "verified",
            thumbnailStatus: "ok",
            verifiedBy: "qa-user",
            lastVerifiedAt: "2026-04-13T00:00:00.000Z",
            manualQcScore: 2,
            httpStatus: 200
          },
          {
            contentId: "content_skip",
            reviewDecision: "skip",
            verifiedBy: "qa-user",
            lastVerifiedAt: "2026-04-13T00:00:00.000Z",
            notes: "leave unresolved"
          }
        ]
      }),
      allowedContentIds: new Set(["content_ok", "content_skip"])
    });

    expect(artifacts.summary).toMatchObject({
      importedCount: 1,
      skippedCount: 1,
      invalidCount: 0
    });
    expect(artifacts.overlayEntries).toEqual([
      {
        contentId: "content_ok",
        reviewStatus: "verified",
        thumbnailStatus: "ok",
        verifiedBy: "qa-user",
        lastVerifiedAt: "2026-04-13T00:00:00.000Z",
        manualQcScore: 2,
        httpStatus: 200
      }
    ]);
    expect(artifacts.moduleSource).toContain("export const contentQualityReviews");
    expect(artifacts.moduleSource).toContain("content_ok");
  });
});
