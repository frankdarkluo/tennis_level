import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AppShellProvider } from "@/components/app/AppShellProvider";
import { I18nProvider } from "@/lib/i18n/config";
import { DayPlanCard } from "@/components/plan/DayPlanCard";
import en from "@/lib/i18n/dictionaries/en";
import zh from "@/lib/i18n/dictionaries/zh";
import {
  buildDiagnosisPlanContext,
  getPlanFromAssessment,
  getPlanFromDiagnosis,
  getPlanTemplate
} from "@/lib/plans";
import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

function renderWithI18n(ui: React.ReactElement, language: "zh" | "en" = "zh") {
  window.localStorage.setItem("tennislevel.app_language", language);
  return render(
    <AppShellProvider>
      <I18nProvider>{ui}</I18nProvider>
    </AppShellProvider>
  );
}

const returnDeepContext: EnrichedDiagnosisContext = {
  mode: "deep",
  sourceInput: "关键分接发时我总是发紧，第一拍只能挡回去而且很浅。",
  sceneSummaryZh: "关键分接发时我会发紧，第一拍只能浅挡回中路。",
  sceneSummaryEn: "On key points I get tight on the return and only block the first ball back short.",
  skillCategory: "return",
  skillCategoryConfidence: "high",
  problemTag: "return-under-pressure",
  level: "4.0",
  strokeFamily: "return",
  sessionType: "match",
  pressureContext: "key_points",
  movement: "stationary",
  outcome: "short",
  incomingBallDepth: "deep",
  subjectiveFeeling: "tight",
  unresolvedRequiredSlots: [],
  stoppedByCap: false,
  isDeepModeReady: true
};

describe("7-step plan semantics", () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("keeps supported English and Chinese plan copy step-based instead of week-based", () => {
    expect(en["plan.title"]).toBe("Your 7-step practice plan");
    expect(en["plan.day.label"]).toBe("Step {day}");
    expect(en["plan.day.failure"]).toBe("Common failure cue");
    expect(en["plan.day.transfer"]).toBe("Transfer cue");
    expect(en["plan.subtitle"]).not.toMatch(/\btoday\b|\bweek\b/i);
    expect(en["plan.summary.badge"]).not.toMatch(/\bweek\b/i);
    expect(en["plan.summary.diagnosis"]).not.toMatch(/seven days|week/i);
    expect(en["plan.fallback.target"]).not.toMatch(/\bweek\b/i);

    expect(zh["plan.title"]).toBe("你的 7 步训练计划");
    expect(zh["plan.day.label"]).toBe("第 {day} 步");
    expect(zh["plan.day.failure"]).toBe("常见失败信号");
    expect(zh["plan.day.transfer"]).toBe("迁移提示");
    expect(zh["plan.subtitle"]).not.toMatch(/今天|本周|一周/);
    expect(zh["plan.summary.badge"]).not.toMatch(/本周|一周/);
    expect(zh["plan.fallback.target"]).not.toMatch(/本周|一周/);
  });

  it("renders step labels on supported plan cards in both locales", () => {
    const zhPlan = getPlanFromDiagnosis({
      problemTag: "backhand-into-net",
      fixes: ["先把拍面立起来，再把击球点放到身体前面。"],
      locale: "zh"
    });

    renderWithI18n(<DayPlanCard day={zhPlan.days[0]} isToday />, "zh");

    expect(screen.getByText(/第 1 步/)).toBeInTheDocument();
    expect(screen.queryByText(/第 1 天/)).not.toBeInTheDocument();

    const enPlan = getPlanFromDiagnosis({
      problemTag: "backhand-into-net",
      fixes: ["Set the strings earlier and meet the ball farther in front."],
      locale: "en"
    });

    cleanup();
    renderWithI18n(<DayPlanCard day={enPlan.days[1]} />, "en");

    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.queryByText("Day 2")).not.toBeInTheDocument();
  });

  it("renders each visible plan step as a compact execution contract", () => {
    renderWithI18n(
      <DayPlanCard
        isToday
        day={{
          day: 1,
          focus: "稳住二发安全弧线",
          contentIds: [],
          drills: ["二发安全弧线 20 球"],
          drill: "二发安全弧线 20 球",
          load: "4 组 x 5 球",
          executionFocus: "先守住过网高度和抛球节奏，再慢慢加速。",
          duration: "20 分钟",
          goal: "让二发先稳定过网而不是先追求速度",
          warmupBlock: { title: "二发准备", items: ["抛球节奏 10 次"] },
          mainBlock: { title: "二发主练", items: ["二发安全弧线 20 球"] },
          pressureBlock: { title: "带压力重复", items: ["连续 5 球过网才加速度"] },
          successCriteria: ["20 球里至少 14 球有安全过网高度"],
          failureCue: "一旦只想加速，二发又会下网",
          progressionNote: "下一步再把同一弧线带进接近比赛节奏",
          transferCue: "关键分先默念安全弧线，再开始抛球",
          intensity: "medium",
          tempo: "controlled",
          motionPrimitiveId: "serve-toss"
        }}
      />,
      "zh"
    );

    expect(screen.getByText("这一步目标")).toBeInTheDocument();
    expect(screen.getByText("让二发先稳定过网而不是先追求速度")).toBeInTheDocument();
    expect(screen.getByText("怎么布置")).toBeInTheDocument();
    expect(screen.getByText("抛球节奏 10 次")).toBeInTheDocument();
    expect(screen.getByText("训练量")).toBeInTheDocument();
    expect(screen.getByText("4 组 x 5 球 · 20 分钟")).toBeInTheDocument();
    expect(screen.getByText("关注点")).toBeInTheDocument();
    expect(screen.getByText("先守住过网高度和抛球节奏，再慢慢加速。")).toBeInTheDocument();
    expect(screen.getByText("完成标准")).toBeInTheDocument();
    expect(screen.getByText("20 球里至少 14 球有安全过网高度")).toBeInTheDocument();
    expect(screen.getByText("常见错误")).toBeInTheDocument();
    expect(screen.getByText("一旦只想加速，二发又会下网")).toBeInTheDocument();
    expect(screen.getByText("动作示意")).toBeInTheDocument();
    expect(screen.getByText("抛球")).toBeInTheDocument();
  });

  it("keeps diagnosis-origin plans on a step-based handoff contract", () => {
    const plan = getPlanFromDiagnosis({
      title: "Return diagnosis",
      problemTag: "return-under-pressure",
      fixes: ["Split early and block the first ball back through the middle."],
      locale: "en"
    });

    expect(plan.title).toContain("7-step");
    expect(plan.target).toContain("7-step");
    expect(plan.target).not.toMatch(/\bweek\b/i);
    expect(plan.summary).not.toMatch(/\bweek\b/i);
    expect(plan.days).toHaveLength(7);
  });

  it("keeps assessment-origin plans compatible without weekly framing", () => {
    const plan = getPlanFromAssessment({
      weakDimensions: ["serve"],
      observationDimensions: ["pressure"],
      locale: "zh"
    });

    expect(plan.days).toHaveLength(7);
    expect(plan.summary).toContain("发球");
    expect(plan.summary).toContain("关键分与压力处理");
    expect(plan.summary).not.toMatch(/本周|这周|一周/);
  });

  it("normalizes general-improvement templates through the same anti-week copy policy", () => {
    const zhPlan = getPlanTemplate("general-improvement", "3.0", "zh", []);
    const enPlan = getPlanTemplate("general-improvement", "3.0", "en", []);

    const zhUserVisibleCopy = [
      zhPlan.title,
      zhPlan.target,
      zhPlan.summary ?? "",
      ...zhPlan.days.flatMap((day) => [
        day.focus,
        day.goal,
        day.failureCue,
        day.progressionNote,
        day.transferCue,
        ...(day.successCriteria ?? []),
        ...(day.details?.focusCues ?? [])
      ])
    ].join(" ");
    const enUserVisibleCopy = [
      enPlan.title,
      enPlan.target,
      enPlan.summary ?? "",
      ...enPlan.days.flatMap((day) => [
        day.focus,
        day.goal,
        day.failureCue,
        day.progressionNote,
        day.transferCue,
        ...(day.successCriteria ?? []),
        ...(day.details?.focusCues ?? [])
      ])
    ].join(" ");

    expect(zhUserVisibleCopy).not.toMatch(/本周|这周|一周/);
    expect(enUserVisibleCopy).not.toMatch(/\bweek\b|this week|next week|within one week/i);
  });

  it("keeps later PR4 steps scene-specific without calendar wording", () => {
    const primaryNextStep = "先稳住分腿垫步，再把第一拍封挡回中路。";
    const plan = getPlanTemplate("return-under-pressure", "4.0", "zh", [], {
      primaryNextStep,
      planContext: buildDiagnosisPlanContext({
        problemTag: "return-under-pressure",
        diagnosisInput: "关键分接发时我总是发紧，第一拍只能挡回去而且很浅。",
        primaryNextStep
      }),
      deepContext: returnDeepContext
    });

    expect(plan.days[5]?.mainBlock.items.join(" ")).toContain("接发");
    expect(plan.days[6]?.goal).toContain("接发");
    expect(String((plan.days[6] as unknown as Record<string, string>).progressionNote)).not.toMatch(/明天|下周|本周|今天/);
    expect(String((plan.days[6] as unknown as Record<string, string>).transferCue)).not.toMatch(/明天|下周|本周|今天/);
  });
});
