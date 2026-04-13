import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { shouldUseMobileXiaohongshuMasonry } from "@/lib/library/layout";

const mockAuthState = {
  user: null as null | { id: string; email: string },
  configured: false,
  loading: false
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
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  })
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => mockAuthState
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: vi.fn()
  })
}));

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh",
    t: (key: string) => {
      const map: Record<string, string> = {
        "assessment.loading": "加载中",
        "library.title": "找内容",
        "library.subtitle": "搜技术、博主或场景。",
        "library.more": "加载更多",
        "library.empty": "暂无内容",
        "library.clear": "清空",
        "library.bookmarkLogin": "登录后收藏"
      };
      return map[key] ?? key;
    }
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

vi.mock("@/lib/assessmentStorage", () => ({
  readAssessmentResultFromStorage: vi.fn(() => ({ level: "3.0" })),
  hasCompletedAssessmentResult: vi.fn(() => true),
  writeAssessmentResultToStorage: vi.fn()
}));

vi.mock("@/lib/userData", () => ({
  getLatestAssessmentResult: vi.fn(async () => ({ data: null })),
  getBookmarkedContentIds: vi.fn(async () => ({ data: [], error: null })),
  addBookmark: vi.fn(async () => ({ error: null })),
  removeBookmark: vi.fn(async () => ({ error: null }))
}));

vi.mock("@/lib/library/order", () => ({
  buildLibraryItems: vi.fn(() => [
    {
      id: "content_xhs_test_01",
      title: "小红书测试内容",
      creatorId: "creator_gaiao_xiaohongshu_hidden",
      platform: "Xiaohongshu",
      type: "video",
      levels: ["3.0"],
      skills: ["forehand"],
      problemTags: ["late-contact"],
      language: "zh",
      summary: "summary",
      reason: "reason",
      useCases: ["training"],
      url: "https://www.xiaohongshu.com/explore/abc123"
    }
  ]),
  sortLibraryItems: vi.fn((items: unknown[]) => items)
}));

vi.mock("@/components/library/ContentCard", () => ({
  ContentCard: ({ item }: { item: { title: string } }) =>
    React.createElement("article", null, item.title)
}));

vi.mock("@/components/library/LibraryFilters", () => ({
  LibraryFilters: ({
    selectedPlatform,
    setSelectedPlatform
  }: {
    selectedPlatform: string;
    setSelectedPlatform: (value: "all" | "Xiaohongshu") => void;
  }) => React.createElement(
    "div",
    null,
    React.createElement("span", null, `platform:${selectedPlatform}`),
    React.createElement("button", { type: "button", onClick: () => setSelectedPlatform("Xiaohongshu") }, "set-xhs-platform"),
    React.createElement("button", { type: "button", onClick: () => setSelectedPlatform("all") }, "set-all-platform")
  )
}));

async function loadLibraryPage() {
  const module = await import("@/app/library/page");
  return module.default;
}

describe("shouldUseMobileXiaohongshuMasonry", () => {
  it("enables masonry only for Xiaohongshu on mobile width", () => {
    expect(shouldUseMobileXiaohongshuMasonry({ selectedPlatform: "Xiaohongshu", viewportWidth: 430 })).toBe(true);
    expect(shouldUseMobileXiaohongshuMasonry({ selectedPlatform: "all", viewportWidth: 430 })).toBe(false);
    expect(shouldUseMobileXiaohongshuMasonry({ selectedPlatform: "Xiaohongshu", viewportWidth: 768 })).toBe(false);
  });
});

describe("library mobile layout", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.loading = false;
    Object.defineProperty(window, "innerWidth", { value: 430, writable: true, configurable: true });
    window.dispatchEvent(new Event("resize"));
  });

  afterEach(() => {
    cleanup();
  });

  it("switches into Xiaohongshu mobile masonry only when the platform filter is Xiaohongshu on mobile", async () => {
    const LibraryPage = await loadLibraryPage();

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("找内容")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("library-results")).toHaveAttribute("data-layout", "default");
    });

    fireEvent.click(screen.getByRole("button", { name: "set-xhs-platform" }));

    expect(screen.getByTestId("library-results")).toHaveAttribute("data-layout", "xhs-mobile-masonry");
  });
});
