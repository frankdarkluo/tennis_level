import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

const {
  mockPush,
  mockReplace,
  mockPrefetch
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn()
}));

let mockPathname = "/";
let mockSearchParams = new URLSearchParams();

const mockAppShellContext = {
  environment: "production" as const,
  language: "zh" as const,
  canChangeLanguage: true,
  loading: false,
  setLanguage: vi.fn()
};

const translations = {
  "home.hero.title": "一句话，帮你找到下一步该练什么",
  "home.hero.subtitle": "💡动作、错误、场景描述越具体，诊断越准",
  "home.hero.placeholder": "例如：我的反手总是下网，尤其对方来球一快我就更容易失误",
  "home.hero.examples": "示例",
  "home.hero.diagnose": "立即诊断",
  "home.hero.assessment": "想更准？先做 1 分钟评估",
  "home.hotContent.title": "先看这些内容",
  "home.hotCreators.title": "适合你的博主",
  "home.more": "查看更多 →",
  "assessment.empty.title": "先完成一次水平评估",
  "assessment.empty.subtitle": "做完后，我们会直接告诉你大概处在哪个能力区间，以及接下来更值得优先补哪一块。",
  "assessment.result.ctaStart": "去完成水平评估 →",
  "assessment.loading": "正在同步你的评估记录...",
  "diagnose.title": "说一句你的问题",
  "diagnose.subtitle": "具体说出动作、错误和场景，我来帮你判断先改什么。",
  "diagnose.placeholder": "例如：反手总下网，来球一快更明显 / 网前截击老冒高，双打一紧张就更明显",
  "diagnose.quickTags": "示例",
  "diagnose.button.start": "开始诊断",
  "nav.home": "首页",
  "nav.assessment": "水平评估",
  "nav.diagnose": "问题诊断",
  "nav.plan": "训练计划",
  "nav.library": "内容库",
  "nav.profile": "我的记录"
} satisfies Record<string, string>;

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

vi.mock("next/image", () => ({
  default: ({ priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) =>
    React.createElement("img", props)
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    configured: false,
    sendMagicLink: vi.fn(),
    signOut: vi.fn()
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: vi.fn(),
    closeLoginModal: vi.fn()
  }),
  AuthModalProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => mockAppShellContext,
  AppShellProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: mockAppShellContext.language,
    canChangeLanguage: mockAppShellContext.canChangeLanguage,
    setLanguage: mockAppShellContext.setLanguage,
    t: (key: string) => translations[key] ?? key
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children)
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn(),
  getLocalLogs: vi.fn(() => [])
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: vi.fn(async () => ({ data: null, error: null })),
  saveDiagnosisHistory: vi.fn(async () => ({ error: null })),
  getBookmarkedContentIds: vi.fn(async () => ({ data: [], error: null })),
  addBookmark: vi.fn(async () => ({ error: null })),
  removeBookmark: vi.fn(async () => ({ error: null }))
}));

vi.mock("@/lib/study/client", () => ({
  persistStudyArtifact: vi.fn(async () => undefined)
}));

vi.mock("@/lib/appShell/localRouteState", async () => {
  const actual = await vi.importActual<typeof import("@/lib/appShell/localRouteState")>("@/lib/appShell/localRouteState");

  return {
    ...actual,
    readLocalDiagnosisSnapshot: vi.fn(() => null),
    writeLocalDiagnosisSnapshot: vi.fn()
  };
});

describe("consumer shell PR1", () => {
  beforeEach(() => {
    cleanup();
    mockPathname = "/";
    mockSearchParams = new URLSearchParams();
    mockPush.mockReset();
    mockReplace.mockReset();
    mockPrefetch.mockReset();
    mockAppShellContext.environment = "production";
    mockAppShellContext.language = "zh";
    mockAppShellContext.loading = false;
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows a diagnose-first consumer landing even without a saved assessment", async () => {
    const { default: HomePage } = await import("@/app/page");

    render(React.createElement(HomePage));

    expect(await screen.findByText("一句话，帮你找到下一步该练什么")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "立即诊断" })).toHaveAttribute("href", "/diagnose?q=");
    expect(screen.queryByText("先完成一次水平评估")).not.toBeInTheDocument();
  });

  it("keeps the consumer home route available without any legacy gate redirects", async () => {
    const { default: HomePage } = await import("@/app/page");

    render(React.createElement(HomePage));

    expect(await screen.findByText("一句话，帮你找到下一步该练什么")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/study/start");
  });

  it("keeps text diagnose accessible without redirecting consumer users to assessment", async () => {
    const { default: DiagnosePage } = await import("@/app/diagnose/page");

    render(React.createElement(DiagnosePage));

    expect(await screen.findByText("说一句你的问题")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/反手总下网/)).toBeInTheDocument();
    expect(screen.queryByText("先完成一次水平评估")).not.toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/assessment");
  });

  it("renders the new primary destinations in the mobile bottom navigation", async () => {
    const { BottomNav } = await import("@/components/layout/BottomNav");

    render(React.createElement(BottomNav));

    expect(screen.getByRole("link", { name: "首页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "水平评估" })).toHaveAttribute("href", "/assessment");
    expect(screen.getByRole("link", { name: "内容库" })).toHaveAttribute("href", "/library");
    expect(screen.getByRole("link", { name: "我的记录" })).toHaveAttribute("href", "/profile");
    expect(screen.queryByRole("link", { name: "问题诊断" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "训练计划" })).not.toBeInTheDocument();
  });

  it("keeps study-only entry points out of the consumer mobile shell", async () => {
    const { BottomNav } = await import("@/components/layout/BottomNav");

    const { container } = render(React.createElement(BottomNav));

    expect(container.querySelector('a[href="/study/start"]')).toBeNull();
    expect(container.querySelector('a[href="/survey"]')).toBeNull();
    expect(container.querySelector('a[href="/admin/export"]')).toBeNull();
  });

  it("keeps consumer shell navigation visible on consumer routes", async () => {
    const { Header } = await import("@/components/layout/Header");
    const { BottomNav } = await import("@/components/layout/BottomNav");

    render(React.createElement("div", null, React.createElement(Header), React.createElement(BottomNav)));

    expect(screen.getAllByRole("link", { name: "首页" }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "水平评估" }).length).toBeGreaterThan(0);
  });
});
