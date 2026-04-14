import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { ASSESSMENT_QUESTIONS, PROFILE_QUESTION_IDS } from "@/data/assessmentQuestions";
import { calculateAssessmentResult } from "@/lib/assessment";
import { normalizeDraftStepIndex } from "@/lib/assessmentDraft";
import { ResultSummary } from "@/components/assessment/ResultSummary";
import { ASSESSMENT_DRAFT_STORAGE_KEY, ASSESSMENT_STORAGE_KEY } from "@/lib/utils";

const { mockPush, mockReplace, mockPrefetch, mockRouter } = vi.hoisted(() => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();
  const mockPrefetch = vi.fn();

  return {
    mockPush,
    mockReplace,
    mockPrefetch,
    mockRouter: {
      push: mockPush,
      replace: mockReplace,
      prefetch: mockPrefetch
    }
  };
});

let mockLanguage: "zh" | "en" = "zh";

const translationMap = {
  "assessment.title": "1 分钟测一下你的水平",
  "assessment.subtitle": "10 个核心问题先判断区间，再用 2 个轻量问题定制训练计划。",
  "assessment.loading": "正在同步你的评估记录...",
  "assessment.start": "开始评估",
  "assessment.previous": "上一题",
  "assessment.progress.core": "核心评估进度",
  "assessment.transition.title": "核心评估已完成",
  "assessment.transition.subtitle": "最后 2 个轻量问题，用来定制你的训练计划。",
  "assessment.transition.cta": "继续定制",
  "assessment.empty.title": "先完成一次水平评估",
  "assessment.empty.subtitle": "做完后，我们会给出能力区间、打法画像和下一步训练重点。",
  "assessment.result.headline": "你的当前能力区间",
  "assessment.result.level": "参考区间",
  "assessment.result.headlineLabel": "当前重点",
  "assessment.result.planHintLabel": "计划提示",
  "assessment.result.styleLabel": "打法画像",
  "assessment.result.contextLabel": "打球场景",
  "assessment.result.strongLabel": "当前强项",
  "assessment.result.weakLabel": "优先补强",
  "assessment.result.skillBreakdown": "分项能力",
  "assessment.result.skillBreakdownHint": "10 个核心维度按 1–4 分映射为四档状态。"
} satisfies Record<string, string>;

const translationMapEn = {
  "assessment.title": "A 1-minute read on your level",
  "assessment.subtitle": "Use 10 core questions to read your range, then 2 light profile cards to shape the plan.",
  "assessment.loading": "Syncing your assessment record...",
  "assessment.start": "Start assessment",
  "assessment.previous": "Back",
  "assessment.progress.core": "Core assessment progress",
  "assessment.transition.title": "Core assessment complete",
  "assessment.transition.subtitle": "Two light profile questions remain to tailor your training plan.",
  "assessment.transition.cta": "Continue",
  "assessment.empty.title": "Complete the assessment first",
  "assessment.empty.subtitle": "After that, we will show your level band, style profile, and next training focus.",
  "assessment.result.headline": "Your current level band",
  "assessment.result.level": "Level band",
  "assessment.result.headlineLabel": "Current focus",
  "assessment.result.planHintLabel": "Plan hint",
  "assessment.result.styleLabel": "Style profile",
  "assessment.result.contextLabel": "Playing context",
  "assessment.result.strongLabel": "Current strengths",
  "assessment.result.weakLabel": "Priority gaps",
  "assessment.result.skillBreakdown": "Skill breakdown",
  "assessment.result.skillBreakdownHint": "The 10 core dimensions map each 1–4 answer into a simple status band."
} satisfies Record<string, string>;

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    configured: false,
    loading: false
  })
}));

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => ({
    environment: "production",
    loading: false,
    language: mockLanguage,
    canChangeLanguage: true,
    setLanguage: vi.fn()
  })
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: mockLanguage,
    canChangeLanguage: true,
    setLanguage: vi.fn(),
    t: (key: string) => (mockLanguage === "en" ? translationMapEn : translationMap)[key] ?? key
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

vi.mock("@/lib/userData", () => ({
  saveAssessmentResult: vi.fn(async () => ({ error: null }))
}));

vi.mock("@/lib/study/client", () => ({
  persistStudyArtifact: vi.fn(async () => undefined)
}));

vi.mock("@/lib/appShell/localRouteState", () => ({
  updateLocalStudyProgress: vi.fn()
}));

const coreAnswerLabels = [
  "9–15 拍多数能维持，遇到稍快的球也还能继续打",
  "大多数时候能打出有质量的正手，偶尔能主动压住对手",
  "反手多数能稳住，切削能作为过渡球或防守变化使用",
  "一发有基本落点或节奏，二发大多数时候能把回合稳定开始",
  "大多数发球都能接进场，并把回合正常拉起来",
  "大多数球能赶到，打完也能基本回到准备位置",
  "知道什么时候该上网，第一拍大多能处理干净，半截击偶尔能救",
  "大多数高球和高压都能处理干净，不容易白送",
  "大体还能保持平时水平，不至于关键分完全失常",
  "有 1–2 个比较常用的套路，比如先压一侧再找空档"
] as const;

async function answerCoreQuestions(labels: readonly string[]) {
  for (const label of labels) {
    fireEvent.click(await screen.findByRole("button", { name: label }));
  }
}

describe("assessment flow and result summary", () => {
  beforeEach(() => {
    cleanup();
    mockLanguage = "zh";
    window.localStorage.clear();
    window.history.pushState({}, "", "/assessment");
    mockPush.mockReset();
    mockReplace.mockReset();
    mockPrefetch.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("uses the new 10+2 assessment structure and keeps profile questions out of the core progress bar", async () => {
    const { default: AssessmentPage } = await import("@/app/assessment/page");
    const { container } = render(<AssessmentPage />);

    expect(await screen.findByRole("button", { name: "开始评估" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "开始评估" }));

    expect(await screen.findByText("平时对拉时，你多数情况下能把球维持在什么质量？")).toBeInTheDocument();

    await answerCoreQuestions(coreAnswerLabels.slice(0, 8));

    expect(await screen.findByText("比分紧、被追分，或者连续失误后，你通常会怎样？")).toBeInTheDocument();
    expect((container.querySelector(".h-2.rounded-full.bg-brand-500.transition-all") as HTMLElement | null)?.style.width).toBe("80%");

    await answerCoreQuestions(coreAnswerLabels.slice(8));

    expect(await screen.findByText("核心评估已完成")).toBeInTheDocument();
    expect(screen.queryByText("你现在更接近哪种打球风格？")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "继续定制" }));

    const styleQuestion = await screen.findByText("你现在更接近哪种打球风格？");
    const styleCardGrid = styleQuestion.closest("div");
    expect(styleCardGrid).not.toBeNull();
    expect(screen.getAllByRole("button").length).toBeGreaterThanOrEqual(4);
    expect(screen.getByText("稳定防守型")).toBeInTheDocument();
    expect(screen.getByText("网前压迫型")).toBeInTheDocument();
  });

  it("allows users to restart the assessment when retake=1 even with a completed stored result", async () => {
    const storedResult = calculateAssessmentResult({
      rally_stability: "rally_3",
      forehand_weapon: "forehand_4",
      backhand_slice_reliability: "backhand_slice_3",
      serve_quality: "serve_1",
      return_quality: "return_3",
      movement_recovery: "movement_2",
      net_transition_volley: "net_3",
      overhead_highball: "overhead_3",
      pressure_matchplay: "pressure_3",
      point_construction: "tactics_2",
      play_style_profile: "baseline_attack",
      play_context_modifier: "singles_standard"
    });

    window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, JSON.stringify(storedResult));
    window.history.pushState({}, "", "/assessment?retake=1");

    const { default: AssessmentPage } = await import("@/app/assessment/page");

    render(<AssessmentPage />);

    expect(await screen.findByRole("button", { name: "开始评估" })).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/assessment/result");
  });

  it("treats legacy branch-era draft answers as stale and keeps valid 10+2 drafts aligned", () => {
    expect(normalizeDraftStepIndex(
      4,
      {
        coarse_rally: "1",
        coarse_serve: "1"
      },
      ASSESSMENT_QUESTIONS
    )).toBe(0);

    expect(normalizeDraftStepIndex(
      6,
      {
        rally_stability: "rally_3",
        forehand_weapon: "forehand_3",
        backhand_slice_reliability: "backhand_slice_3",
        serve_quality: "serve_3",
        return_quality: "return_3",
        movement_recovery: "movement_3"
      },
      ASSESSMENT_QUESTIONS
    )).toBe(6);
  });

  it("renders level band, profile summary, and strongest/weakest areas from the player profile vector", () => {
    const result = calculateAssessmentResult({
      rally_stability: "rally_3",
      forehand_weapon: "forehand_4",
      backhand_slice_reliability: "backhand_slice_3",
      serve_quality: "serve_1",
      return_quality: "return_3",
      movement_recovery: "movement_2",
      net_transition_volley: "net_3",
      overhead_highball: "overhead_3",
      pressure_matchplay: "pressure_3",
      point_construction: "tactics_2",
      play_style_profile: "baseline_attack",
      play_context_modifier: "singles_standard"
    });

    render(<ResultSummary result={result} />);

    expect(screen.getByText("你的当前能力区间")).toBeInTheDocument();
    expect(screen.getByText("3.5")).toBeInTheDocument();
    expect(screen.getByText("当前重点")).toBeInTheDocument();
    expect(screen.getByText("当前最值得优先补强的是发球")).toBeInTheDocument();
    expect(screen.getByText("计划提示")).toBeInTheDocument();
    expect(screen.getByText("后续训练计划应先围绕发球展开。")).toBeInTheDocument();
    expect(screen.getByText("打法画像")).toBeInTheDocument();
    expect(screen.getByText("底线推进型")).toBeInTheDocument();
    expect(screen.getByText("打球场景")).toBeInTheDocument();
    expect(screen.getByText("单打为主")).toBeInTheDocument();
    expect(screen.getByText("当前强项")).toBeInTheDocument();
    expect(screen.getByText("优先补强")).toBeInTheDocument();

    const strengthsCard = screen.getByText("当前强项").closest("div");
    const weakCard = screen.getByText("优先补强").closest("div");

    expect(strengthsCard).not.toBeNull();
    expect(weakCard).not.toBeNull();
    expect(within(strengthsCard as HTMLElement).getByText("正手主动能力")).toBeInTheDocument();
    expect(within(weakCard as HTMLElement).getByText("发球")).toBeInTheDocument();
  });
});
