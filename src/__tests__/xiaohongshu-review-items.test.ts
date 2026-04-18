import { describe, expect, it } from "vitest";
import {
  isXiaohongshuCandidateReviewItem,
  loadXiaohongshuCandidateReviewData
} from "@/lib/library/xiaohongshuReviewItems";

describe("xiaohongshu candidate review items", () => {
  it("maps the full QA candidate pool into library review items", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();

    expect(reviewData.summary.candidateCount).toBe(50);
    expect(reviewData.items).toHaveLength(50);
    expect(reviewData.items.every((item) => isXiaohongshuCandidateReviewItem(item))).toBe(true);
  });

  it("keeps per-creator candidate counts aligned with the QA artifact", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const counts = Object.fromEntries(
      reviewData.summary.byCreator.map((entry) => [entry.creatorProgramId, entry.count])
    );

    expect(counts).toEqual({
      gaiao: 5,
      lingxi: 5,
      mouratoglou: 25,
      dabaiyang: 15
    });
  });

  it("maps dabaiyang candidates onto the hidden Xiaohongshu creator record instead of unknown creator fallback", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const dabaiyangItem = reviewData.items.find((item) => item.creatorId === "creator_dabaiyang_xiaohongshu_hidden");

    expect(dabaiyangItem).toBeTruthy();
    expect(dabaiyangItem?.platform).toBe("Xiaohongshu");
  });

  it("uses review-local thumbnail paths when local thumbnail assets exist", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const gaiaoItem = reviewData.items.find((item) => item.id === "review_xhs_candidate_6436d3060000000011012067");

    expect(gaiaoItem?.thumbnail).toBe("/thumbnails/xiaohongshu/review/6436d3060000000011012067.png");
  });

  it("derives narrower review levels from problem tags instead of always using the full creator range", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const gaiaoBasics = reviewData.items.find((item) => item.id === "review_xhs_candidate_6436d3060000000011012067");
    const mouratoglouServe = reviewData.items.find((item) => item.id === "review_xhs_candidate_69bbf151000000001b003add");

    expect(gaiaoBasics?.levels).toEqual(["2.5", "3.0", "3.5"]);
    expect(mouratoglouServe?.levels).toEqual(["3.0", "3.5", "4.0"]);
  });

  it("does not leak serve-only tags into unrelated mouratoglou review candidates", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const hipRotation = reviewData.items.find((item) => item.id === "review_xhs_candidate_699dbbcc000000001a0344a3");
    const lowerStance = reviewData.items.find((item) => item.id === "review_xhs_candidate_694981eb0000000019027d11");
    const netClearance = reviewData.items.find((item) => item.id === "review_xhs_candidate_69497b9b000000000d03e873");

    expect(hipRotation?.problemTags).toEqual(["forehand-no-power", "general-improvement"]);
    expect(hipRotation?.levels).toEqual(["3.0", "3.5", "4.0", "4.5"]);

    expect(lowerStance?.problemTags).toEqual(["topspin-low", "general-improvement"]);
    expect(lowerStance?.levels).toEqual(["3.0", "3.5", "4.0", "4.5"]);

    expect(netClearance?.problemTags).toEqual(["balls-too-short", "general-improvement"]);
    expect(netClearance?.levels).toEqual(["3.0", "3.5", "4.0", "4.5"]);
  });

  it("keeps return and mental candidates on semantically aligned tag families", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const returnItem = reviewData.items.find((item) => item.id === "review_xhs_candidate_69b5d8bc000000001f006be1");
    const flowItem = reviewData.items.find((item) => item.id === "review_xhs_candidate_69d9c58700000000210066a2");
    const relaxItem = reviewData.items.find((item) => item.id === "review_xhs_candidate_69cf38490000000021005899");

    expect(returnItem?.problemTags).toEqual(["return-under-pressure", "late-contact"]);
    expect(returnItem?.levels).toEqual(["3.0", "3.5", "4.0"]);

    expect(flowItem?.problemTags).toEqual(["match-anxiety", "pressure-tightness"]);
    expect(flowItem?.levels).toEqual(["3.0", "3.5", "4.0"]);

    expect(relaxItem?.problemTags).toEqual(["pressure-tightness", "general-improvement"]);
    expect(relaxItem?.levels).toEqual(["3.0", "3.5", "4.0"]);
  });
});
