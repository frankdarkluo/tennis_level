import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { getSavedPlans } from "@/lib/userData";

const mockAppShellContext = {
  loading: false
};

const mockAuthState = {
  user: null as null | { id: string; email: string },
  configured: false,
  loading: false
};

const translations: Record<string, string> = {
  "profile.backHome": "回到首页",
  "profile.title": "我的记录",
  "profile.loginTitle": "登录后查看你的记录",
  "profile.loginSubtitle": "评估、诊断、收藏和训练计划都会保存在这里。",
  "profile.loginButton": "登录",
  "plan.backHome": "回到首页",
  "profile.headerSubtitle": "把你的评估结果、诊断记录、收藏和训练计划都集中放在这里。",
  "profile.notAssessed": "还没测评",
  "profile.metrics.activePlan": "当前训练计划",
  "profile.metrics.latestDiagnosis": "最近一次诊断",
  "profile.metrics.bookmarks": "收藏",
  "profile.metrics.savedPlans": "训练计划",
  "profile.activePlan.title": "当前训练计划",
  "profile.activePlan.subtitle": "先继续你现在最值得执行的这套计划。",
  "profile.activePlan.emptyDescription": "还没有可继续的训练计划。",
  "profile.latestDiagnosis.title": "最近一次诊断",
  "profile.latestDiagnosis.subtitle": "把最近的问题判断保留在首页。",
  "profile.latestDiagnosis.emptyDescription": "还没有最近诊断。",
  "profile.latestDiagnosis.open": "回到这次诊断",
  "profile.cta.continuePractice": "继续练习",
  "profile.assessment.title": "最近一次水平评估",
  "profile.assessment.emptyDescription": "先做一次评估，我们会把结果和推荐内容留在这里。",
  "profile.diagnosis.title": "诊断记录",
  "profile.diagnosis.subtitle": "更早的诊断记录放在这里。",
  "profile.diagnosis.emptyDescription": "还没有保存的诊断记录。",
  "profile.bookmarks.title": "收藏",
  "profile.bookmarks.subtitle": "收藏的视频会以紧凑列表出现。",
  "profile.bookmarks.link": "去内容库",
  "profile.bookmarks.emptyDescription": "还没有收藏内容。",
  "profile.plans.title": "保存的训练计划",
  "profile.plans.subtitle": "更早的计划记录放在这里。",
  "profile.plans.emptyDescription": "还没有保存的训练计划。",
  "profile.plans.generate": "去生成",
  "profile.records.title": "训练记录",
  "profile.records.subtitle": "更早的诊断和计划放在下面。",
  "plan.assessment": "去做水平评估",
  "plan.diagnose": "先去诊断"
};

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children)
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams()
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: vi.fn()
  })
}));

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => ({
    environment: "production" as const,
    loading: mockAppShellContext.loading,
    language: "zh" as const,
    canChangeLanguage: true,
    setLanguage: vi.fn(),
  })
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh",
    t: (key: string, replacements?: Record<string, string | number>) => {
      const template = translations[key] ?? key;
      if (!replacements) {
        return template;
      }

      return Object.entries(replacements).reduce((current, [token, value]) => {
        return current.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
      }, template);
    }
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: vi.fn(async () => ({ data: null })),
  getDiagnosisHistory: vi.fn(async () => ({ data: [] })),
  getSavedPlans: vi.fn(async () => ({ data: [] })),
  getVideoDiagnosisHistory: vi.fn(async () => ({ data: [] })),
  getBookmarkedContentIds: vi.fn(async () => ({ data: [] })),
  removeBookmark: vi.fn(async () => ({ error: null }))
}));

async function loadProfilePage() {
  const module = await import("@/app/profile/page");
  return module.default;
}

describe("profile boundary cleanup", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockAppShellContext.loading = false;
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.loading = false;
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps the profile route in login state without any study-only side panels", async () => {
    const ProfilePage = await loadProfilePage();

    render(React.createElement(ProfilePage));

    expect(screen.getByText("登录后查看你的记录")).toBeInTheDocument();
    expect(screen.queryByText("当前研究会话")).not.toBeInTheDocument();
    expect(screen.queryByText("继续上次练习")).not.toBeInTheDocument();
    expect(screen.queryByText("回看训练计划")).not.toBeInTheDocument();
    expect(screen.queryByText("回看上次诊断")).not.toBeInTheDocument();
  });

  it("keeps the authenticated profile route focused on core records only", async () => {
    mockAuthState.user = { id: "user_1", email: "player@example.com" };
    mockAuthState.configured = true;
    const ProfilePage = await loadProfilePage();

    render(React.createElement(ProfilePage));

    await waitFor(() => {
      expect(screen.getByText("最近一次水平评估")).toBeInTheDocument();
    });

    expect(screen.queryByText("当前研究会话")).not.toBeInTheDocument();
    expect(screen.queryByText("继续上次练习")).not.toBeInTheDocument();
    expect(screen.queryByText("回看训练计划")).not.toBeInTheDocument();
    expect(screen.queryByText("回看上次诊断")).not.toBeInTheDocument();
    expect(screen.getAllByText("当前训练计划").length).toBeGreaterThan(0);
    expect(screen.getAllByText("最近一次诊断").length).toBeGreaterThan(0);
    expect(screen.getAllByText("继续练习").length).toBeGreaterThan(0);
    expect(screen.queryByText("视频诊断记录")).not.toBeInTheDocument();
  });

  it("uses exact saved-plan resume for the continue-practice CTA", async () => {
    mockAuthState.user = { id: "user_1", email: "player@example.com" };
    mockAuthState.configured = true;

    vi.mocked(getSavedPlans).mockResolvedValueOnce({
      data: [
        {
          id: "saved_plan_1",
          user_id: "user_1",
          source_type: "diagnosis",
          source_label: "resume-test",
          created_at: "2026-04-14T00:00:00.000Z",
          plan_data: {
            source: "template",
            level: "3.5",
            problemTag: "second-serve-reliability",
            title: "二发训练计划",
            target: "先稳住二发节奏",
            summary: "从诊断恢复到精确训练计划。",
            resume: {
              href: "/plan?problemTag=second-serve-reliability&level=3.5&source=diagnosis&contentIds=content_a%2Ccontent_b&primaryNextStep=%E5%85%88%E7%A8%B3%E4%BD%8F%E4%BA%8C%E5%8F%91%E8%8A%82%E5%A5%8F&guidanceContext=%7B%22source%22%3A%22diagnosis%22%7D"
            },
            days: [
              {
                day: 1,
                focus: "稳住二发节奏",
                contentIds: [],
                drills: ["二发节奏 20 球"],
                duration: "20 分钟",
                goal: "让二发先稳定过网",
                warmupBlock: { title: "热身", items: ["抛球节奏 10 次"] },
                mainBlock: { title: "主练", items: ["二发节奏 20 球"] },
                pressureBlock: { title: "带压力重复", items: ["连续 5 球过网"] },
                successCriteria: ["20 球里至少 14 球有安全过网高度"],
                failureCue: "一着急就会下网",
                progressionNote: "下一步再加一点速度",
                transferCue: "关键分先守住节奏",
                intensity: "medium",
                tempo: "controlled"
              }
            ]
          } as never
        }
      ]
    });

    const ProfilePage = await loadProfilePage();
    render(React.createElement(ProfilePage));

    const continuePracticeLink = await screen.findByRole("link", { name: "继续练习" });
    expect(continuePracticeLink).toHaveAttribute(
      "href",
      "/plan?problemTag=second-serve-reliability&level=3.5&source=diagnosis&contentIds=content_a%2Ccontent_b&primaryNextStep=%E5%85%88%E7%A8%B3%E4%BD%8F%E4%BA%8C%E5%8F%91%E8%8A%82%E5%A5%8F&guidanceContext=%7B%22source%22%3A%22diagnosis%22%7D"
    );
  });
});
