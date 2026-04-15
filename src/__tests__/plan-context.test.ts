import { describe, expect, it } from "vitest";
import { buildDiagnosisGuidanceContext, parseGuidanceContext } from "@/lib/guidance-context/build";
import {
  buildDiagnosisPlanContext,
  buildPlanResume,
  buildPlanHref,
  getPlanTemplate,
  normalizePlanDraftSnapshot,
  parsePlanContext,
  resolveSavedPlanHref
} from "@/lib/plans";

describe("plan context handoff", () => {
  it("extracts structured deep context from diagnosis input", () => {
    const context = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "比赛里关键分时我原地的二发容易下网，而且会发紧。",
      primaryNextStep: "先建立安全二发节奏"
    });

    expect(context).toMatchObject({
      source: "diagnosis",
      primaryProblemTag: "second-serve-reliability",
      sessionType: "match",
      pressureContext: "high",
      movementContext: "stationary",
      outcomePattern: "net",
      feelingModifiers: ["tight"]
    });
  });

  it("round-trips plan context through the plan href and draft snapshot", () => {
    const planContext = buildDiagnosisPlanContext({
      problemTag: "running-backhand",
      diagnosisInput: "比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显。",
      primaryNextStep: "先把跑动中的击球点放到身体前面"
    });
    const guidanceContext = buildDiagnosisGuidanceContext({
      problemTag: "running-backhand",
      level: "3.5",
      locale: "zh",
      primaryNextStep: "先把跑动中的击球点放到身体前面",
      diagnosisInput: "比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显。",
      planContext
    });

    const href = buildPlanHref({
      problemTag: "running-backhand",
      level: "3.5",
      sourceType: "diagnosis",
      primaryNextStep: "先把跑动中的击球点放到身体前面",
      planContext,
      guidanceContext
    });

    const params = new URL(href, "http://localhost").searchParams;
    const roundTripped = parsePlanContext(params.get("planContext"));
    const roundTrippedGuidanceContext = parseGuidanceContext(params.get("guidanceContext"));
    const draft = normalizePlanDraftSnapshot({
      problemTag: "running-backhand",
      level: "3.5",
      sourceType: "diagnosis",
      primaryNextStep: "先把跑动中的击球点放到身体前面",
      planContext,
      guidanceContext
    });

    expect(roundTripped).toEqual(planContext);
    expect(roundTrippedGuidanceContext).toEqual(guidanceContext);
    expect(draft?.planContext).toEqual(planContext);
    expect(draft?.guidanceContext).toEqual(guidanceContext);
  });

  it("builds an exact saved-plan resume payload and href from the same routing context", () => {
    const planContext = buildDiagnosisPlanContext({
      problemTag: "running-backhand",
      diagnosisInput: "比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显。",
      primaryNextStep: "先把跑动中的击球点放到身体前面"
    });
    const guidanceContext = buildDiagnosisGuidanceContext({
      problemTag: "running-backhand",
      level: "3.5",
      locale: "zh",
      primaryNextStep: "先把跑动中的击球点放到身体前面",
      diagnosisInput: "比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显。",
      planContext
    });

    const resume = buildPlanResume({
      problemTag: "running-backhand",
      level: "3.5",
      sourceType: "diagnosis",
      preferredContentIds: ["content_a", "content_b"],
      primaryNextStep: "先把跑动中的击球点放到身体前面",
      planContext,
      guidanceContext
    });

    expect(resume.payload).toMatchObject({
      problemTag: "running-backhand",
      level: "3.5",
      sourceType: "diagnosis",
      preferredContentIds: ["content_a", "content_b"],
      primaryNextStep: "先把跑动中的击球点放到身体前面"
    });
    expect(resume.href).toContain("contentIds=content_a%2Ccontent_b");
    expect(resume.href).toContain("primaryNextStep=");
    expect(resume.href).toContain("guidanceContext=");
  });

  it("prefers the exact saved-plan resume href over approximate regeneration", () => {
    const exactHref = "/plan?problemTag=running-backhand&level=3.5&source=diagnosis&contentIds=content_a";

    expect(resolveSavedPlanHref({
      source_type: "diagnosis",
      plan_data: {
        source: "template",
        level: "3.5",
        problemTag: "running-backhand",
        title: "Test plan",
        target: "Test target",
        days: [],
        resume: {
          href: exactHref,
          payload: {
            problemTag: "running-backhand",
            level: "3.5",
            sourceType: "diagnosis",
            preferredContentIds: ["content_a"]
          }
        }
      }
    })).toBe(exactHref);
  });

  it("lets plans differentiate same-tag cases by deep context", () => {
    const matchPressureContext = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "比赛里关键分时我原地的二发容易下网，而且会发紧。",
      primaryNextStep: "先建立安全二发节奏"
    });
    const plainContext = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "我的二发不太稳。",
      primaryNextStep: "先建立安全二发节奏"
    });

    const pressurePlan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      planContext: matchPressureContext
    });
    const plainPlan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      planContext: plainContext
    });

    expect(pressurePlan.summary).toContain("关键分");
    expect(pressurePlan.days[0]?.pressureBlock.items.join(" ")).toContain("关键分");
    expect(plainPlan.summary).not.toContain("关键分");
  });

  it("hydrates detailed step contracts and primary-step attachments on generated plans", () => {
    const plan = getPlanTemplate("backhand-into-net", "3.5", "zh", [], {
      primaryNextStep: "先把拍面立起来，再把击球点放到身体前面。"
    });
    const firstDay = plan.days[0];

    expect(firstDay?.details?.goal).toBeTruthy();
    expect(firstDay?.details?.setup).toBeTruthy();
    expect(firstDay?.details?.dosage).toBeTruthy();
    expect(firstDay?.details?.focusCues.length).toBeGreaterThan(0);
    expect(firstDay?.details?.commonMistakes.length).toBeGreaterThan(0);
    expect(firstDay?.details?.successCriteria.length).toBeGreaterThan(0);
    expect(firstDay?.attachments?.primaryContentId ?? null).toBe(firstDay?.contentIds[0] ?? null);
    expect(firstDay?.attachments?.backupContentId ?? null).toBe(
      firstDay?.contentIds.find((id) => id !== firstDay.attachments?.primaryContentId) ?? null
    );
  });

  it("lets structured deepContext override shallower planContext during plan generation", () => {
    const shallowPlanContext = buildDiagnosisPlanContext({
      problemTag: "second-serve-reliability",
      diagnosisInput: "我的二发不太稳。",
      primaryNextStep: "先建立安全二发节奏"
    });
    const deepContext = {
      mode: "deep" as const,
      sourceInput: "关键分时我的二发容易下网，而且会发紧。",
      sceneSummaryZh: "二发在关键分原地发球时容易下网，而且会发紧。",
      sceneSummaryEn: "On key points my stationary second serve keeps going into the net and it feels tight.",
      skillCategory: "serve" as const,
      skillCategoryConfidence: "high" as const,
      problemTag: "second-serve-reliability",
      level: "3.5",
      strokeFamily: "serve" as const,
      serveSubtype: "second_serve" as const,
      sessionType: "match" as const,
      pressureContext: "key_points" as const,
      movement: "stationary" as const,
      outcome: "net" as const,
      incomingBallDepth: "unknown" as const,
      subjectiveFeeling: "tight" as const,
      unresolvedRequiredSlots: [],
      stoppedByCap: false,
      isDeepModeReady: true
    };
    const href = buildPlanHref({
      problemTag: "second-serve-reliability",
      level: "3.5",
      sourceType: "diagnosis",
      primaryNextStep: "先建立安全二发节奏",
      planContext: shallowPlanContext,
      deepContext
    });
    const parsedFromHref = parsePlanContext(new URL(href, "http://localhost").searchParams.get("planContext"));
    const normalizedDraft = normalizePlanDraftSnapshot({
      problemTag: "second-serve-reliability",
      level: "3.5",
      sourceType: "diagnosis",
      primaryNextStep: "先建立安全二发节奏",
      planContext: shallowPlanContext,
      deepContext
    });

    const plan = getPlanTemplate("second-serve-reliability", "3.5", "zh", [], {
      primaryNextStep: "先建立安全二发节奏",
      planContext: shallowPlanContext,
      deepContext
    });

    expect(plan.summary).toContain("关键分场景");
    expect(plan.summary).toContain("先建立安全二发节奏");
    expect(plan.summary).toContain("发紧");
    expect(parsedFromHref).toMatchObject({
      pressureContext: "high",
      movementContext: "stationary",
      outcomePattern: "net",
      feelingModifiers: ["tight"]
    });
    expect(normalizedDraft?.planContext).toMatchObject({
      pressureContext: "high",
      movementContext: "stationary",
      outcomePattern: "net",
      feelingModifiers: ["tight"]
    });
  });
});
