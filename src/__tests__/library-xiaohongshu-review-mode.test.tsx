import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";

const mockAuthState = {
  user: null as null | { id: string; email: string },
  configured: false,
  loading: false
};
let mockHasCompletedAssessment = true;

const mockSearchParamsState = {
  value: "platform=Xiaohongshu&mobilePreview=1"
};

const loadMergedXiaohongshuLibraryData = vi.fn(() => ({
  items: [
    {
      id: "content_xhs_runtime_01",
      title: "已推广小红书内容",
      creatorId: "creator_gaiao_xiaohongshu_hidden",
      platform: "Xiaohongshu",
      type: "video",
      levels: ["3.0"],
      skills: ["forehand"],
      problemTags: ["forehand-basics"],
      language: "zh",
      subtitleAvailability: "zh",
      summary: "summary",
      reason: "reason",
      useCases: ["use-case"],
      coachReason: "runtime",
      thumbnail: "https://example.com/runtime.jpg",
      url: "https://www.xiaohongshu.com/explore/runtime-01"
    },
    {
      id: "review_xhs_candidate_alpha",
      title: "候选帖子 A",
      creatorId: "creator_gaiao_xiaohongshu_hidden",
      platform: "Xiaohongshu",
      type: "post",
      levels: ["3.0"],
      skills: ["forehand"],
      problemTags: ["forehand-basics"],
      language: "zh",
      subtitleAvailability: "zh",
      summary: "summary",
      reason: "reason",
      useCases: ["use-case"],
      coachReason: "candidate",
      thumbnail: "https://example.com/a.jpg",
      url: "https://www.xiaohongshu.com/explore/review-a"
    },
    {
      id: "review_xhs_candidate_beta",
      title: "候选帖子 B",
      creatorId: "creator_dabaiyang_xiaohongshu_hidden",
      platform: "Xiaohongshu",
      type: "post",
      levels: ["3.0"],
      skills: ["serve"],
      problemTags: ["serve-basics"],
      language: "zh",
      subtitleAvailability: "zh",
      summary: "summary",
      reason: "reason",
      useCases: ["use-case"],
      coachReason: "candidate",
      thumbnail: "https://example.com/b.jpg",
      url: "https://www.xiaohongshu.com/explore/review-b"
    }
  ],
  summary: {
    runtimeCount: 1,
    candidateCount: 3,
    duplicateSuppressedCount: 1,
    mergedCount: 3
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
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(mockSearchParamsState.value)
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
    t: (key: string, values?: Record<string, string | number>) => {
      const map: Record<string, string> = {
        "assessment.loading": "加载中",
        "library.title": "找内容",
        "library.subtitle": "搜技术、博主或场景。",
        "library.more": "查看更多",
        "library.empty": "暂无内容",
        "library.clear": "清空",
        "library.bookmarkLogin": "登录后收藏",
        "library.review.title": "小红书合并内容视图",
        "library.review.body": "当前页合并显示 runtime 小红书内容与 QA 补充帖，重复标题已自动去重。",
        "library.review.counts": "当前显示 {runtimeCount} 条 runtime 内容 + {uniqueCandidateCount} 条 QA 补充帖，已去重 {duplicateSuppressedCount} 条重复帖"
      };

      const template = map[key] ?? key;
      if (!values) {
        return template;
      }

      return Object.entries(values).reduce((result, [token, value]) => {
        return result.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
      }, template);
    }
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

vi.mock("@/lib/assessmentStorage", () => ({
  readAssessmentResultFromStorage: vi.fn(() => ({ level: "3.0" })),
  hasCompletedAssessmentResult: vi.fn(() => mockHasCompletedAssessment),
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
      id: "content_xhs_runtime_01",
      title: "已推广小红书内容",
      creatorId: "creator_gaiao_xiaohongshu_hidden",
      platform: "Xiaohongshu",
      type: "video",
      levels: ["3.0"],
      skills: ["forehand"],
      problemTags: ["forehand-basics"],
      language: "zh",
      subtitleAvailability: "zh",
      summary: "summary",
      reason: "reason",
      useCases: ["training"],
      coachReason: "runtime",
      url: "https://www.xiaohongshu.com/explore/runtime-01"
    }
  ]),
  sortLibraryItems: vi.fn((items: unknown[]) => items)
}));

vi.mock("@/lib/library/xiaohongshuReviewItems", () => ({
  loadMergedXiaohongshuLibraryData,
  isXiaohongshuCandidateReviewRequested: (searchParams: { get(name: string): string | null }) =>
    searchParams.get("review") === "xiaohongshu-candidates",
  isXiaohongshuCandidateReviewItem: (item: { id: string }) => item.id.startsWith("review_xhs_candidate_")
}));

vi.mock("@/components/library/ContentCard", () => ({
  ContentCard: ({
    item,
    onToggleBookmark
  }: {
    item: { id: string; title: string };
    onToggleBookmark?: () => void;
  }) =>
    React.createElement(
      "article",
      {
        "data-testid": `content-card-${item.id}`,
        "data-bookmark-enabled": onToggleBookmark ? "1" : "0"
      },
      item.title
    )
}));

vi.mock("@/components/library/LibraryFilters", () => ({
  LibraryFilters: ({ selectedPlatform }: { selectedPlatform: string }) =>
    React.createElement("div", null, `platform:${selectedPlatform}`)
}));

async function loadLibraryPage() {
  const module = await import("@/app/library/page");
  return module.default;
}

describe("library xiaohongshu review mode", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockHasCompletedAssessment = true;
    mockAuthState.user = null;
    mockAuthState.configured = false;
    mockAuthState.loading = false;
    mockSearchParamsState.value = "platform=Xiaohongshu&mobilePreview=1";
    Object.defineProperty(window, "innerWidth", { value: 430, writable: true, configurable: true });
    window.dispatchEvent(new Event("resize"));
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the merged deduped Xiaohongshu list on the default Xiaohongshu library path", async () => {
    const LibraryPage = await loadLibraryPage();

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("找内容")).toBeInTheDocument();
    expect(await screen.findByText("已推广小红书内容")).toBeInTheDocument();
    expect(await screen.findByText("候选帖子 A")).toBeInTheDocument();
    expect(await screen.findByText("候选帖子 B")).toBeInTheDocument();
    expect(screen.queryByTestId("library-review-banner")).not.toBeInTheDocument();
    expect(loadMergedXiaohongshuLibraryData).toHaveBeenCalledTimes(1);
  });

  it("keeps review-query compatibility while rendering the same merged deduped Xiaohongshu set", async () => {
    mockSearchParamsState.value = "platform=Xiaohongshu&mobilePreview=1&review=xiaohongshu-candidates";
    const LibraryPage = await loadLibraryPage();

    render(React.createElement(LibraryPage));

    expect(await screen.findByText("已推广小红书内容")).toBeInTheDocument();

    await waitFor(() => {
      expect(loadMergedXiaohongshuLibraryData).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("候选帖子 A")).toBeInTheDocument();
    expect(await screen.findByText("候选帖子 B")).toBeInTheDocument();
    expect(screen.queryByTestId("library-review-banner")).not.toBeInTheDocument();
    expect(screen.getByTestId("content-card-content_xhs_runtime_01")).toHaveAttribute("data-bookmark-enabled", "1");
    expect(screen.getByTestId("content-card-review_xhs_candidate_alpha")).toHaveAttribute("data-bookmark-enabled", "1");
    expect(screen.getByTestId("content-card-review_xhs_candidate_beta")).toHaveAttribute("data-bookmark-enabled", "1");
  });

  it("allows explicit Xiaohongshu review mode to bypass the assessment gate", async () => {
    mockHasCompletedAssessment = false;
    mockSearchParamsState.value = "platform=Xiaohongshu&review=xiaohongshu-candidates";
    const LibraryPage = await loadLibraryPage();

    render(React.createElement(LibraryPage));

    await waitFor(() => {
      expect(loadMergedXiaohongshuLibraryData).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("已推广小红书内容")).toBeInTheDocument();
    expect(screen.queryByText("先完成一次水平评估")).not.toBeInTheDocument();
    expect(await screen.findByText("候选帖子 A")).toBeInTheDocument();
    expect(await screen.findByText("候选帖子 B")).toBeInTheDocument();
  });
});
