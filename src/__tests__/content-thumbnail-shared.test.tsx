import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ContentCard } from "@/components/library/ContentCard";
import type { ContentItem } from "@/types/content";

const translationMap = {
  "content.openAria": "open",
  "content.subtitle.yes": "有英文字幕",
  "content.subtitle.no": "无英文字幕",
  "content.subtitle.unknown": "字幕未知",
  "content.subtitle.notNeeded": "原生英文",
  "content.lang.zh": "ZH",
  "content.lang.en": "EN",
  "content.secondaryTitle": "原始标题",
  "content.targetPrefix": "针对:",
  "content.unknownCreator": "未知作者",
  "content.whyRecommended": "为什么选这条"
} as const;

function t(key: string, params?: Record<string, string>) {
  if (key === "content.openAria") {
    return `${translationMap["content.openAria"]} ${params?.value ?? ""}`.trim();
  }

  return translationMap[key as keyof typeof translationMap] ?? key;
}

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "zh",
    t
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

function createItem(): ContentItem {
  return {
    id: "thumbnail_fallback_test",
    title: "正手总出界：先把弧线拉起来",
    creatorId: "creator_mouratoglou_cn",
    platform: "Bilibili",
    type: "video",
    levels: ["3.5"],
    skills: ["forehand"],
    problemTags: ["forehand-out"],
    language: "zh",
    summary: "适合正手总出界的球员。",
    reason: "帮助理解弧线和控制。",
    useCases: ["正手一发力就出界"],
    coachReason: "先建立过网弧线。",
    thumbnail: "https://broken-thumbnail.example.invalid/library.jpg",
    duration: "8:18",
    url: "https://example.com/video"
  };
}

describe("shared thumbnail fallback", () => {
  it("keeps library cards on the shared neutral placeholder instead of title initials", () => {
    render(<ContentCard item={createItem()} />);

    const image = screen.getByRole("img");
    fireEvent.error(image);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const fallback = screen.getByTestId("video-thumbnail-fallback");
    expect(within(fallback).queryByText("正")).not.toBeInTheDocument();
    expect(within(fallback).queryByText("BILIBILI")).not.toBeInTheDocument();
  });

  it("does not force no-referrer for Xiaohongshu CDN thumbnails", () => {
    const item: ContentItem = {
      ...createItem(),
      id: "thumbnail_xhs_test",
      platform: "Xiaohongshu",
      thumbnail: "https://sns-webpic-qc.xhscdn.com/example-xhs-cover.jpg",
      url: "https://www.xiaohongshu.com/explore/69c29c5f0000000021012666"
    };

    render(<ContentCard item={item} />);

    const image = screen.getByRole("img");
    expect(image.getAttribute("referrerpolicy")).not.toBe("no-referrer");
  });
});
