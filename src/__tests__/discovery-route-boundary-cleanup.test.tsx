import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const {
  mockPush,
  mockReplace,
  mockPrefetch,
  mockOpenLoginModal
} = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockReplace: vi.fn(),
  mockPrefetch: vi.fn(),
  mockOpenLoginModal: vi.fn()
}));

const mockAppShellContext = {
  loading: false
};

const mockAuthState = {
  user: null as null | { id: string; email?: string | null },
  configured: false,
  loading: false
};

const mockAssessmentStorage = {
  result: null as null | { answeredCount: number; level: string }
};

const mockRemoteAssessment = vi.hoisted(() => vi.fn(async () => ({ data: null, error: null })));

const translations: Record<string, string> = {
  "assessment.loading": "正在同步你的评估记录...",
  "assessment.empty.title": "先完成一次水平评估",
  "assessment.empty.subtitle": "做完后，我们会直接告诉你大概处在哪个能力区间，以及接下来更值得优先补哪一块。",
  "assessment.result.ctaStart": "去完成水平评估 →",
  "library.title": "找内容",
  "library.subtitle": "按动作、博主或场景筛选。",
  "library.bookmarkLogin": "登录后可收藏内容",
  "rankings.deprecated.title": "博主榜已下线",
  "rankings.deprecated.body": "当前版本不再维护这个入口；需要找训练内容时请直接使用内容库。",
  "rankings.deprecated.cta": "去内容库"
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
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null)
  })
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: mockOpenLoginModal
  })
}));

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => ({
    environment: "production" as const,
    loading: mockAppShellContext.loading,
    language: "zh" as const,
    canChangeLanguage: true,
    setLanguage: vi.fn()
  })
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh" as const,
    t: (key: string) => translations[key] ?? key
  })
}));

vi.mock("@/lib/assessmentStorage", () => ({
  readAssessmentResultFromStorage: () => mockAssessmentStorage.result,
  hasCompletedAssessmentResult: (result: { answeredCount?: number } | null) => Boolean(result && result.answeredCount && result.answeredCount > 0),
  hasStoredCompletedAssessmentResult: () => Boolean(mockAssessmentStorage.result && mockAssessmentStorage.result.answeredCount > 0),
  writeAssessmentResultToStorage: vi.fn()
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: (...args: unknown[]) => mockRemoteAssessment(...args),
  getBookmarkedContentIds: vi.fn(async () => ({ data: [], error: null })),
  addBookmark: vi.fn(async () => ({ error: null })),
  removeBookmark: vi.fn(async () => ({ error: null }))
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

vi.mock("@/lib/library/order", () => ({
  buildLibraryItems: vi.fn(() => [
    {
      id: "content_1",
      title: "反手稳定练习",
      creatorId: "creator_1",
      platform: "YouTube",
      type: "video",
      levels: ["3.0"],
      skills: ["backhand"],
      problemTags: ["backhand-stability"],
      language: "zh",
      summary: "summary",
      reason: "reason",
      useCases: ["training"],
      url: "https://example.com/content_1"
    }
  ]),
  sortLibraryItems: vi.fn((items: unknown[]) => items)
}));

vi.mock("@/components/library/ContentCard", () => ({
  ContentCard: ({ item }: { item: { title: string } }) => React.createElement("div", null, item.title)
}));

vi.mock("@/components/library/LibraryFilters", () => ({
  LibraryFilters: () => React.createElement("div", null, "library-filters")
}));

async function loadLibraryPage() {
  const module = await import("@/app/library/page");
  return module.default;
}

async function loadRankingsPage() {
  const module = await import("@/app/rankings/page");
  return module.default;
}

describe("discovery route boundary cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
    mockAppShellContext.loading = false;
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.loading = false;
    mockAssessmentStorage.result = null;
    mockRemoteAssessment.mockResolvedValue({ data: null, error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps library on the consumer assessment gate instead of redirecting to study start", async () => {
    const LibraryPage = await loadLibraryPage();

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("先完成一次水平评估")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalledWith("/study/start");
  });

  it("keeps rankings as a deprecated hidden route instead of redirecting into old study flow", async () => {
    const RankingsPage = await loadRankingsPage();

    render(React.createElement(RankingsPage));

    expect(await screen.findByText("博主榜已下线")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "去内容库" })).toHaveAttribute("href", "/library");
    expect(mockReplace).not.toHaveBeenCalledWith("/assessment");
    expect(mockReplace).not.toHaveBeenCalledWith("/study/start");
  });
});
