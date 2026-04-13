import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AppShellProvider } from "@/components/app/AppShellProvider";
import { I18nProvider } from "@/lib/i18n/config";
import { LoginModal } from "@/components/auth/LoginModal";
import { AuthCallbackCard } from "@/components/auth/AuthCallbackCard";
import { ContentCard } from "@/components/library/ContentCard";
import { CreatorDetailModal } from "@/components/rankings/CreatorDetailModal";
import ProfilePage from "@/app/profile/page";
import { VideoUploader } from "@/components/video/VideoUploader";
import { UsageMeter } from "@/components/video/UsageMeter";
import { DayPlanCard } from "@/components/plan/DayPlanCard";
import { Header } from "@/components/layout/Header";
import { getPlanTemplate } from "@/lib/plans";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";

const {
  mockPush,
  mockSearchParamsAdapter,
  mockShellState,
  mockAuthState,
  mockAuthModalState,
  mockUserData,
  mockSupabase
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSearchParamsAdapter: {
    get: vi.fn(() => null)
  },
  mockShellState: {
    language: "en" as "zh" | "en",
    loading: false,
    canChangeLanguage: true,
    setLanguage: vi.fn()
  },
  mockAuthState: {
    user: null as null | { id: string; email?: string | null },
    loading: false,
    configured: false,
    sendMagicLink: vi.fn(async () => ({ error: null })),
    signOut: vi.fn(async () => undefined)
  },
  mockAuthModalState: {
    openLoginModal: vi.fn(),
    closeLoginModal: vi.fn()
  },
  mockUserData: {
    getLatestAssessmentResult: vi.fn(async () => ({ data: null, error: null })),
    getDiagnosisHistory: vi.fn(async () => ({ data: [], error: null })),
    getBookmarkedContentIds: vi.fn(async () => ({ data: [], error: null })),
    getSavedPlans: vi.fn(async () => ({ data: [], error: null })),
    getVideoDiagnosisHistory: vi.fn(async () => ({ data: [], error: null })),
    removeBookmark: vi.fn(async () => ({ error: null }))
  },
  mockSupabase: {
    current: null as null | {
      auth: {
        exchangeCodeForSession: (code: string) => Promise<{ error: { message: string } | null }>;
        verifyOtp: () => Promise<{ error: { message: string } | null }>;
      };
    }
  }
}));

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
  useRouter: () => ({
    push: mockPush,
    replace: mockPush,
    prefetch: vi.fn()
  }),
  useSearchParams: () => mockSearchParamsAdapter,
  usePathname: () => "/profile"
}));

vi.mock("@/components/app/AppShellProvider", async () => {
  const actual = await vi.importActual<typeof import("@/components/app/AppShellProvider")>("@/components/app/AppShellProvider");

  return {
    ...actual,
    useAppShell: () => ({
      environment: "production" as const,
      loading: mockShellState.loading,
      language: mockShellState.language,
      canChangeLanguage: mockShellState.canChangeLanguage,
      setLanguage: mockShellState.setLanguage
    })
  };
});

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => mockAuthModalState
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: (...args: unknown[]) => mockUserData.getLatestAssessmentResult(...args),
  getDiagnosisHistory: (...args: unknown[]) => mockUserData.getDiagnosisHistory(...args),
  getBookmarkedContentIds: (...args: unknown[]) => mockUserData.getBookmarkedContentIds(...args),
  getSavedPlans: (...args: unknown[]) => mockUserData.getSavedPlans(...args),
  getVideoDiagnosisHistory: (...args: unknown[]) => mockUserData.getVideoDiagnosisHistory(...args),
  removeBookmark: (...args: unknown[]) => mockUserData.removeBookmark(...args)
}));

vi.mock("@/lib/supabase", () => ({
  getSupabaseBrowserClient: () => mockSupabase.current
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn(),
  markEventLoggerSessionCompleted: vi.fn()
}));

function renderWithI18n(ui: React.ReactElement) {
  window.localStorage.setItem("tennislevel.app_language", mockShellState.language);
  return render(
    <AppShellProvider>
      <I18nProvider>{ui}</I18nProvider>
    </AppShellProvider>
  );
}

describe("surface localization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPush.mockReset();
    mockSearchParamsAdapter.get.mockReset();
    mockSearchParamsAdapter.get.mockImplementation(() => null);
    mockShellState.language = "en";
    mockShellState.loading = false;
    mockShellState.canChangeLanguage = true;
    mockShellState.setLanguage.mockClear();
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.sendMagicLink.mockClear();
    mockAuthState.signOut.mockClear();
    mockAuthModalState.openLoginModal.mockClear();
    mockUserData.getLatestAssessmentResult.mockImplementation(async () => ({ data: null, error: null }));
    mockUserData.getDiagnosisHistory.mockImplementation(async () => ({ data: [], error: null }));
    mockUserData.getBookmarkedContentIds.mockImplementation(async () => ({ data: [], error: null }));
    mockUserData.getSavedPlans.mockImplementation(async () => ({ data: [], error: null }));
    mockUserData.getVideoDiagnosisHistory.mockImplementation(async () => ({ data: [], error: null }));
    mockUserData.removeBookmark.mockImplementation(async () => ({ error: null }));
    mockSupabase.current = null;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders LoginModal in English and Chinese", () => {
    renderWithI18n(<LoginModal open onClose={() => {}} />);

    expect(screen.getByText("Email sign-in")).toBeInTheDocument();
    expect(screen.getByText("Enter your email and we will send you a sign-in link.")).toBeInTheDocument();

    mockShellState.language = "zh";
    cleanup();
    renderWithI18n(<LoginModal open onClose={() => {}} />);

    expect(screen.getByText("邮箱登录")).toBeInTheDocument();
    expect(screen.getByText("输入邮箱后，我们会给你发登录链接。")).toBeInTheDocument();
  });

  it("renders localized rate-limit copy in the login modal", async () => {
    mockAuthState.sendMagicLink.mockResolvedValue({ error: "email rate limit exceeded" });
    mockShellState.language = "zh";

    renderWithI18n(<LoginModal open onClose={() => {}} />);

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "player@example.com" }
    });
    fireEvent.click(screen.getByRole("button", { name: "发送登录链接" }));

    await waitFor(() => {
      expect(screen.getByText("邮件发送过于频繁，请稍后再试。")).toBeInTheDocument();
    });
  });

  it("renders AuthCallbackCard in English with localized error copy", async () => {
    renderWithI18n(<AuthCallbackCard />);

    await waitFor(() => {
      expect(screen.getByText("Sign-in failed")).toBeInTheDocument();
    });
    expect(screen.getByText("Supabase environment variables are not configured yet, so sign-in cannot be completed right now.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back home" })).toBeInTheDocument();
  });

  it("renders the profile page login state in English", () => {
    renderWithI18n(<ProfilePage />);

    expect(screen.getByText("Sign in to view your records")).toBeInTheDocument();
    expect(screen.getByText("Your assessments, diagnoses, bookmarks, and plans will be saved here.")).toBeInTheDocument();
  });

  it("renders the profile page authenticated empty states in English", async () => {
    mockAuthState.user = { id: "user_1", email: "player@example.com" };
    mockAuthState.configured = true;

    renderWithI18n(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Latest assessment result")).toBeInTheDocument();
    });

    expect(screen.getByText("Diagnosis history")).toBeInTheDocument();
    expect(screen.queryByText("Video diagnosis history")).not.toBeInTheDocument();
    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("Saved practice plans")).toBeInTheDocument();
  });

  it("renders VideoUploader and UsageMeter in English", () => {
    renderWithI18n(
      <div>
        <VideoUploader file={null} onFileChange={() => {}} />
        <UsageMeter successCount={1} maxFree={3} isPro={false} />
      </div>
    );

    expect(screen.getByText("Drop a clip here or click to upload a video under 1 minute")).toBeInTheDocument();
    expect(screen.getByText("Video diagnosis quota")).toBeInTheDocument();
    expect(screen.getByText("You have 2 free video diagnoses left")).toBeInTheDocument();
  });

  it("renders localized plan prescription blocks in both locales", () => {
    const zhPlan = getPlanTemplate("backhand-into-net", "3.0", "zh");
    const enPlan = getPlanTemplate("backhand-into-net", "3.0", "en");

    mockShellState.language = "zh";
    renderWithI18n(<DayPlanCard day={zhPlan.days[0]} isToday />);
    expect(screen.getByText("第 1 步 · 从这一步开始")).toBeInTheDocument();
    expect(screen.getByText("这一步目标")).toBeInTheDocument();
    expect(screen.queryByText("热身")).not.toBeInTheDocument();
    expect(screen.getAllByText("练习").length).toBeGreaterThan(0);
    expect(screen.queryByText("带压力重复")).not.toBeInTheDocument();
    expect(screen.getByText("完成标准")).toBeInTheDocument();
    expect(screen.getByText("强度 · 低")).toBeInTheDocument();
    expect(screen.getByText("节奏 · 慢节奏")).toBeInTheDocument();

    cleanup();
    mockShellState.language = "en";
    renderWithI18n(<DayPlanCard day={enPlan.days[1]} />);

    fireEvent.click(screen.getByRole("button", { name: "Expand" }));

    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Goal")).toBeInTheDocument();
    expect(screen.queryByText("Warm-up")).not.toBeInTheDocument();
    expect(screen.getAllByText("Practice").length).toBeGreaterThan(0);
    expect(screen.queryByText("Pressure reps")).not.toBeInTheDocument();
    expect(screen.getByText("Success criteria")).toBeInTheDocument();
    expect(screen.getByText("Intensity · Low")).toBeInTheDocument();
    expect(screen.getByText("Tempo · Slow")).toBeInTheDocument();
  });

  it("renders English content cards in zh mode with English titles and polished Chinese subtitles", () => {
    const item = contents.find((entry) => entry.id === "content_ttt_01");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_ttt_01");
    }

    mockShellState.language = "zh";
    renderWithI18n(<ContentCard item={item} />);

    expect(screen.getByText("Simple Tennis Serve Technique Masterclass for Beginners")).toBeInTheDocument();
    expect(screen.getByText("网球发球入门精讲")).toBeInTheDocument();
    expect(screen.getByText(/针对[:：]\s*发球抛球总偏左偏右/)).toBeInTheDocument();
  });

  it("renders creator featured videos in zh mode with a generated Chinese subtitle", () => {
    const creator = creators.find((entry) => entry.id === "creator_venus_williams");

    expect(creator).toBeTruthy();
    if (!creator) {
      throw new Error("Missing creator_venus_williams");
    }

    mockShellState.language = "zh";
    renderWithI18n(<CreatorDetailModal creator={creator} open onClose={() => {}} />);

    expect(screen.getByText("How To Hit A Basic Tennis Serve with Venus Williams")).toBeInTheDocument();
    expect(screen.getByText("跟维纳斯·威廉姆斯学网球基础发球")).toBeInTheDocument();
  });

  it("renders the current consumer header in zh without legacy beta or study-only labels", () => {
    mockShellState.language = "zh";

    renderWithI18n(<Header />);

    expect(screen.getAllByRole("group", { name: "语言切换" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "切换网站语言为中文" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "登录" })).toBeInTheDocument();
    expect(screen.queryByText("研究模式")).not.toBeInTheDocument();
    expect(screen.queryByText("视频诊断")).not.toBeInTheDocument();
    expect(screen.queryByText("测试 (Beta)")).not.toBeInTheDocument();
  });

  it("keeps the profile route on the current consumer records surface in zh", async () => {
    mockShellState.language = "zh";
    mockAuthState.user = { id: "user_1", email: "player@example.com" };
    mockAuthState.configured = true;

    renderWithI18n(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("最近评估结果")).toBeInTheDocument();
    });

    expect(screen.getByText("诊断历史")).toBeInTheDocument();
    expect(screen.getByText("收藏")).toBeInTheDocument();
    expect(screen.getByText("已保存的训练计划")).toBeInTheDocument();
    expect(screen.queryByText("当前研究会话")).not.toBeInTheDocument();
    expect(screen.queryByText("Snapshot")).not.toBeInTheDocument();
    expect(screen.queryByText("Build")).not.toBeInTheDocument();
    expect(screen.queryByText("Session ID")).not.toBeInTheDocument();
  });
});
