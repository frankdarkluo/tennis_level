import { describe, expect, it } from "vitest";
import {
  canCollectXiaohongshuSeedCandidates,
  findXiaohongshuCreatorProgramEntry,
  loadXiaohongshuCreatorProgram
} from "../../scripts/lib/xiaohongshuCreatorProgram";

describe("xiaohongshu creator program", () => {
  it("loads the four-creator program scope with candidate-pool targets", () => {
    const program = loadXiaohongshuCreatorProgram();

    expect(program.map((entry) => ({
      id: entry.id,
      displayName: entry.displayName,
      candidateTarget: entry.candidateTarget,
      creatorProfileStatus: entry.creatorProfileStatus
    }))).toEqual([
      {
        id: "gaiao",
        displayName: "盖奥网球",
        candidateTarget: 100,
        creatorProfileStatus: "verified_profile"
      },
      {
        id: "lingxi",
        displayName: "灵熙",
        candidateTarget: 100,
        creatorProfileStatus: "verified_profile"
      },
      {
        id: "mouratoglou",
        displayName: "冠军教练-莫拉特格鲁",
        candidateTarget: 100,
        creatorProfileStatus: "verified_profile"
      },
      {
        id: "dabaiyang",
        displayName: "奔跑的大白羊",
        candidateTarget: 50,
        creatorProfileStatus: "pending_profile_verification"
      }
    ]);
  });

  it("matches creators by alias or canonical profile url", () => {
    const program = loadXiaohongshuCreatorProgram();

    expect(findXiaohongshuCreatorProgramEntry(program, {
      creatorName: "灵熙🎾"
    })?.id).toBe("lingxi");
    expect(findXiaohongshuCreatorProgramEntry(program, {
      creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5"
    })?.id).toBe("mouratoglou");
  });

  it("keeps pending-profile creators QA-only", () => {
    const program = loadXiaohongshuCreatorProgram();
    const pendingCreator = program.find((entry) => entry.id === "dabaiyang");

    expect(pendingCreator).toBeTruthy();
    expect(canCollectXiaohongshuSeedCandidates(pendingCreator!)).toBe(false);
  });
});
