import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ContentCard } from "@/components/library/ContentCard";
import { contents } from "@/data/contents";
import { getPreferredOutboundUrl } from "@/lib/content/outbound";

const mockLanguage = vi.hoisted(() => ({ current: "zh" as "zh" | "en" }));

const translationMap = {
  "content.openAria": "打开视频：{value}",
  "content.targetPrefix": "针对:",
  "content.unknownCreator": "未知作者",
  "content.secondaryTitle": "原始标题",
  "content.subtitle.english": "有英文字幕",
  "content.subtitle.zh": "中文字幕",
  "content.subtitle.zhEn": "中英字幕",
  "content.subtitle.none": "无字幕",
  "content.subtitle.unknown": "字幕未知",
  "content.subtitle.notNeeded": "原生英文",
  "content.lang.zh": "ZH",
  "content.lang.en": "EN",
  "content.whyRecommended": "为什么推荐这条",
  "content.bookmark.add": "添加收藏",
  "content.bookmark.remove": "移除收藏",
  "content.bookmark.removeSaved": "移除收藏",
  "content.bookmark.working": "处理中"
} as const;

function translate(key: string, replacements?: Record<string, string | number>) {
  const template = translationMap[key as keyof typeof translationMap] ?? key;

  if (!replacements) {
    return template;
  }

  return Object.entries(replacements).reduce((current, [token, value]) => {
    return current.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
  }, template);
}

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: mockLanguage.current,
    t: translate
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

describe("xiaohongshu runtime presentation", () => {
  it("uses a portrait 3:4 media ratio only for Xiaohongshu content cards", () => {
    const gaiao = contents.find((item) => item.id === "content_xhs_gaiao_01");
    const bilibili = contents.find((item) => item.id === "content_gaiao_01");

    expect(gaiao).toBeTruthy();
    expect(bilibili).toBeTruthy();
    if (!gaiao || !bilibili) {
      throw new Error("Missing comparison content");
    }

    const { rerender } = render(<ContentCard item={gaiao} />);

    expect(screen.getByTestId("content-card-media")).toHaveClass("aspect-[3/4]");

    rerender(<ContentCard item={bilibili} />);
    expect(screen.getByTestId("content-card-media")).toHaveClass("aspect-[16/9]");
  });

  it("renders Xiaohongshu cards with localized platform and subtitle labels in Chinese", () => {
    const gaiao = contents.find((item) => item.id === "content_xhs_gaiao_01");
    const mouratoglou = contents.find((item) => item.id === "content_xhs_mouratoglou_01");

    expect(gaiao).toBeTruthy();
    expect(mouratoglou).toBeTruthy();
    if (!gaiao || !mouratoglou) {
      throw new Error("Missing Xiaohongshu content seeds");
    }

    mockLanguage.current = "zh";
    const { rerender } = render(<ContentCard item={gaiao} />);

    expect(screen.getByText("小红书")).toBeInTheDocument();
    expect(screen.getByText("中文字幕")).toBeInTheDocument();

    rerender(<ContentCard item={mouratoglou} />);
    expect(screen.getByText("中英字幕")).toBeInTheDocument();
  });

  it("renders Xiaohongshu cards as RedNote in English", () => {
    const gaiao = contents.find((item) => item.id === "content_xhs_gaiao_01");

    expect(gaiao).toBeTruthy();
    if (!gaiao) {
      throw new Error("Missing content_xhs_gaiao_01");
    }

    mockLanguage.current = "en";
    render(<ContentCard item={gaiao} />);

    expect(screen.getByText("RedNote")).toBeInTheDocument();
  });

  it("renders a compact note-style metadata hierarchy for Xiaohongshu mobile cards", () => {
    const gaiao = contents.find((item) => item.id === "content_xhs_gaiao_01");

    expect(gaiao).toBeTruthy();
    if (!gaiao) {
      throw new Error("Missing content_xhs_gaiao_01");
    }

    mockLanguage.current = "zh";
    render(<ContentCard item={gaiao} layoutVariant="xhs-mobile-note" onToggleBookmark={vi.fn()} />);

    expect(screen.queryByTestId("content-card-platform-badge")).not.toBeInTheDocument();
    const metaChips = screen.getAllByTestId("content-card-meta-chip");
    expect(metaChips).toHaveLength(2);
    expect(metaChips[0]).toHaveClass("text-[9px]");
    expect(metaChips[0]).toHaveClass("whitespace-normal");
    expect(metaChips[0]).toHaveClass("break-words");
    expect(screen.getByTestId("content-card-note-bookmark")).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveClass("object-[center_38%]");
  });

  it("applies the shared crop policy to standard library cards too", () => {
    const bilibili = contents.find((item) => item.id === "content_gaiao_01");

    expect(bilibili).toBeTruthy();
    if (!bilibili) {
      throw new Error("Missing content_gaiao_01");
    }

    mockLanguage.current = "zh";
    render(<ContentCard item={bilibili} />);

    expect(screen.getByRole("img")).toHaveClass("object-[center_45%]");
  });
});

describe("xiaohongshu outbound routing", () => {
  it("prefers the RedNote app deep link on mobile for canonical note URLs", () => {
    const gaiao = contents.find((item) => item.id === "content_xhs_gaiao_01");

    expect(gaiao).toBeTruthy();
    if (!gaiao) {
      throw new Error("Missing content_xhs_gaiao_01");
    }

    expect(
      getPreferredOutboundUrl(gaiao, {
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)"
      })
    ).toEqual({
      href: "xhsdiscover://video_feed/69c29c5f0000000021012666",
      fallbackUrl: "https://www.xiaohongshu.com/explore/69c29c5f0000000021012666",
      opensInNewTab: false
    });
  });
});
