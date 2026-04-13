import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LibraryFilters } from "@/components/library/LibraryFilters";

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh",
    t: (key: string) => {
      const map: Record<string, string> = {
        "library.searchPlaceholder": "搜索技术、博主或场景",
        "library.filter.platformAll": "全部平台",
        "library.filter.languageAll": "全部语言",
        "library.filter.languageZh": "中文内容",
        "library.filter.languageEn": "英文内容",
        "library.filter.subtitleAll": "全部字幕",
        "library.filter.subtitleYes": "有英文字幕",
        "library.filter.subtitleNo": "无英文字幕",
        "library.searchAction": "搜索",
        "library.bookmarks": "我的收藏",
        "library.bookmarkOnlyTitle": "只看收藏",
        "library.bookmarkDisabledTitle": "登录后查看收藏"
      };
      return map[key] ?? key;
    }
  })
}));

describe("LibraryFilters mobile compact mode", () => {
  it("renders a sticky compact mobile filter bar instead of the desktop form", () => {
    render(
      <LibraryFilters
        keywordDraft=""
        setKeywordDraft={vi.fn()}
        onSearch={vi.fn()}
        selectedPlatform="all"
        setSelectedPlatform={vi.fn()}
        selectedContentLanguage="all"
        setSelectedContentLanguage={vi.fn()}
        selectedSubtitleAvailability="all"
        setSelectedSubtitleAvailability={vi.fn()}
        showBookmarkedOnly={false}
        setShowBookmarkedOnly={vi.fn()}
        bookmarkFilterEnabled
        compactMobile
      />
    );

    expect(screen.getByTestId("library-filters-mobile")).toBeInTheDocument();
    expect(screen.queryByTestId("library-filters-desktop")).not.toBeInTheDocument();
    expect(screen.getByTestId("library-mobile-platform-filter")).toBeInTheDocument();
  });

  it("still exposes bookmark toggle and compact search action", () => {
    const onSearch = vi.fn();
    const setShowBookmarkedOnly = vi.fn();

    render(
      <LibraryFilters
        keywordDraft="正手"
        setKeywordDraft={vi.fn()}
        onSearch={onSearch}
        selectedPlatform="Xiaohongshu"
        setSelectedPlatform={vi.fn()}
        selectedContentLanguage="all"
        setSelectedContentLanguage={vi.fn()}
        selectedSubtitleAvailability="all"
        setSelectedSubtitleAvailability={vi.fn()}
        showBookmarkedOnly={false}
        setShowBookmarkedOnly={setShowBookmarkedOnly}
        bookmarkFilterEnabled
        compactMobile
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "搜索" }));
    expect(onSearch).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "我的收藏" }));
    expect(setShowBookmarkedOnly).toHaveBeenCalledWith(true);
  });
});
