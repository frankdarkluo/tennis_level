import { describe, expect, it } from "vitest";
import {
  buildDiagnosisGuidanceContext,
  encodeGuidanceContext,
  parseGuidanceContext
} from "@/lib/guidance-context/build";
import { buildRecommendationDetails } from "@/lib/content/recommendationSignals";
import type { ContentItem } from "@/types/content";

describe("guidance context", () => {
  it("builds a deterministic diagnosis guidance context from deep serve signals", () => {
    const guidanceContext = buildDiagnosisGuidanceContext({
      problemTag: "second-serve-reliability",
      level: "3.5",
      locale: "zh",
      primaryNextStep: "先建立安全二发节奏",
      diagnosisInput: "关键分时我的二发容易下网，而且会发紧。",
      deepContext: {
        mode: "deep",
        sourceInput: "关键分时我的二发容易下网，而且会发紧。",
        sceneSummaryZh: "关键分原地二发容易下网，而且会发紧。",
        sceneSummaryEn: "On key points the stationary second serve keeps going into the net and feels tight.",
        skillCategory: "serve",
        skillCategoryConfidence: "high",
        problemTag: "second-serve-reliability",
        strokeFamily: "serve",
        serveSubtype: "second_serve",
        serveMechanismFamily: "rhythm",
        sessionType: "match",
        pressureContext: "key_points",
        movement: "stationary",
        outcome: "net",
        incomingBallDepth: "unknown",
        subjectiveFeeling: "tight",
        unresolvedRequiredSlots: [],
        stoppedByCap: false,
        isDeepModeReady: true
      }
    });

    expect(guidanceContext).toMatchObject({
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      strokeFamily: "serve",
      mechanismFamily: "rhythm",
      skillBand: "3.5",
      languagePreference: "zh",
      planIntent: "stabilize_under_pressure",
      trainingFocus: "先建立安全二发节奏"
    });
    expect(guidanceContext.secondaryProblemTags).toContain("pressure-tightness");
  });

  it("round-trips guidance context through encoded plan handoff state", () => {
    const guidanceContext = buildDiagnosisGuidanceContext({
      problemTag: "running-backhand",
      level: "3.5",
      locale: "en",
      primaryNextStep: "Move the contact point farther in front",
      diagnosisInput: "My running backhand keeps going into the net."
    });

    expect(parseGuidanceContext(encodeGuidanceContext(guidanceContext))).toEqual(guidanceContext);
  });

  it("uses the shared guidance focus in recommendation rationale when the tag matches", () => {
    const item: ContentItem = {
      id: "content_test_backhand",
      title: "Backhand contact point fix",
      creatorId: "creator_test",
      platform: "YouTube",
      type: "video",
      levels: ["3.0", "3.5"],
      skills: ["backhand"],
      problemTags: ["backhand-into-net"],
      language: "en",
      subtitleAvailability: "english",
      summary: "Fix the contact point on the backhand.",
      reason: "Useful when the backhand keeps dipping into the net.",
      useCases: ["late contact"],
      coachReason: "This keeps the contact point in front.",
      url: "https://www.youtube.com/watch?v=testvideo01"
    };
    const guidanceContext = buildDiagnosisGuidanceContext({
      problemTag: "backhand-into-net",
      level: "3.5",
      locale: "en",
      primaryNextStep: "Find the backhand contact point earlier",
      diagnosisInput: "My backhand keeps going into the net."
    });

    const details = buildRecommendationDetails(item, "en", guidanceContext);

    expect(details.whySelected).toContain("directly targets the current primary problem");
    expect(details.technicalPoint).toContain("late contact");
  });

  it("keeps general rally tags and topspin tags out of invalid general-shape fallbacks", () => {
    const rallyContext = buildDiagnosisGuidanceContext({
      problemTag: "rally-consistency",
      level: "3.0",
      locale: "en",
      primaryNextStep: "Stabilize the first four rally balls",
      diagnosisInput: "My rally breaks down after a few shots."
    });
    const topspinContext = buildDiagnosisGuidanceContext({
      problemTag: "topspin-low",
      level: "3.0",
      locale: "zh",
      primaryNextStep: "先把正手弧线抬起来",
      diagnosisInput: "正手上旋总是不够。"
    });

    expect(rallyContext.strokeFamily).toBe("general");
    expect(rallyContext.mechanismFamily).toBe("rhythm");
    expect(topspinContext.strokeFamily).toBe("forehand");
  });
});
