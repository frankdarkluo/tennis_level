import { describe, expect, it } from "vitest";
import {
  isXiaohongshuCandidateReviewItem,
  loadMergedXiaohongshuLibraryData,
  loadXiaohongshuCandidateReviewData
} from "@/lib/library/xiaohongshuReviewItems";

describe("xiaohongshu candidate review items", () => {
  it("maps the full QA candidate pool into library review items", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();

    expect(reviewData.summary.candidateCount).toBe(55);
    expect(reviewData.items).toHaveLength(55);
    expect(reviewData.items.every((item) => isXiaohongshuCandidateReviewItem(item))).toBe(true);
    expect(reviewData.items.find((item) => item.id === "review_xhs_candidate_67bc408d000000002602d709")).toBeUndefined();
  });

  it("builds a merged Xiaohongshu library list with runtime-first exact-title dedupe", () => {
    const mergedData = loadMergedXiaohongshuLibraryData();

    expect(mergedData.summary.runtimeCount).toBe(15);
    expect(mergedData.summary.candidateCount).toBe(55);
    expect(mergedData.summary.duplicateSuppressedCount).toBe(14);
    expect(mergedData.summary.mergedCount).toBe(56);
    expect(mergedData.items).toHaveLength(56);

    expect(mergedData.items.find((item) => item.id === "content_xhs_gaiao_02")?.title).toBe("网球正手零基础教学（详细版）");
    expect(mergedData.items.find((item) => item.id === "review_xhs_candidate_6436d3060000000011012067")).toBeUndefined();
    expect(mergedData.items.find((item) => item.id === "review_xhs_candidate_69d648c1000000001a022156")?.title).toBe("网球跟练：专治正手打不顺");
    expect(mergedData.items.find((item) => item.id === "review_xhs_candidate_67bc408d000000002602d709")).toBeUndefined();
  });

  it("keeps per-creator candidate counts aligned with the QA artifact", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const counts = Object.fromEntries(
      reviewData.summary.byCreator.map((entry) => [entry.creatorProgramId, entry.count])
    );

    expect(counts).toEqual({
      gaiao: 7,
      lingxi: 9,
      mouratoglou: 24,
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

  it("keeps newly harvested gaiao direct-note candidates visible with non-empty covers", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const gaiaoDrill = reviewData.items.find((item) => item.id === "review_xhs_candidate_69d648c1000000001a022156");
    const removedServeTwin = reviewData.items.find((item) => item.id === "review_xhs_candidate_69a44c1600000000150238d1");
    const removedForehandTwin = reviewData.items.find((item) => item.id === "review_xhs_candidate_6966483d000000002202cfb2");

    expect(gaiaoDrill?.title).toBe("网球跟练：专治正手打不顺");
    expect(gaiaoDrill?.thumbnail).toBe("/thumbnails/xiaohongshu/review/69d648c1000000001a022156.png");
    expect(gaiaoDrill?.url).toBe("https://www.xiaohongshu.com/explore/69d648c1000000001a022156");
    expect(removedServeTwin).toBeUndefined();
    expect(removedForehandTwin).toBeUndefined();
  });

  it("adds only exact-author Lingxi teaching posts from the retry harvest", () => {
    const reviewData = loadXiaohongshuCandidateReviewData();
    const lingxiSlice = reviewData.items.find((item) => item.id === "review_xhs_candidate_69650150000000001a02651e");
    const lingxiForehand = reviewData.items.find((item) => item.id === "review_xhs_candidate_68b8142f000000001c00ddeb");
    const lingxiPower = reviewData.items.find((item) => item.id === "review_xhs_candidate_6880bfff000000002400ea5e");

    expect(lingxiSlice?.title).toBe("切削想要过网低 向前是关键");
    expect(lingxiSlice?.problemTags).toEqual(["backhand-slice-floating", "slice-depth-control"]);
    expect(lingxiSlice?.url).toBe("https://www.xiaohongshu.com/explore/69650150000000001a02651e");

    expect(lingxiForehand?.title).toBe("正手肩部打开过早");
    expect(lingxiForehand?.problemTags).toEqual(["forehand-out", "timing-off"]);
    expect(lingxiForehand?.url).toBe("https://www.xiaohongshu.com/explore/68b8142f000000001c00ddeb");

    expect(lingxiPower?.thumbnail).toBe("/thumbnails/xiaohongshu/review/6880bfff000000002400ea5e.png");
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
