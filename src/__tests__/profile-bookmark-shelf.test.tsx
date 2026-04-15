import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { contents } from "@/data/contents";
import { ProfileBookmarkShelf } from "@/components/profile/ProfileBookmarkShelf";

const translations: Record<string, string> = {
  "profile.bookmarks.title": "Bookmarks",
  "profile.bookmarks.subtitle": "Keep the videos you want to revisit in a compact list.",
  "profile.bookmarks.filterPlaceholder": "Filter saved videos",
  "profile.bookmarks.groupByCreator": "Creator",
  "profile.bookmarks.groupByTag": "Tag",
  "profile.bookmarks.removeSelected": "Remove selected",
  "profile.bookmarks.clearSelection": "Clear selection",
  "profile.bookmarks.emptyFiltered": "No saved videos match this filter.",
  "profile.bookmarks.results": "{value} saved videos",
  "profile.bookmarks.selectItem": "Select {value}",
  "profile.bookmarks.removeOne": "Remove {value}",
  "profile.none": "None yet",
  "content.lang.zh": "ZH",
  "content.lang.en": "EN"
};

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "en" as const,
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

describe("ProfileBookmarkShelf", () => {
  it("filters saved videos and lets the user switch between creator and tag grouping", () => {
    const items = ["content_gaiao_03", "content_rb_02", "content_fr_01"]
      .map((id) => contents.find((item) => item.id === id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    render(
      <ProfileBookmarkShelf
        items={items}
        pendingIds={[]}
        onRemoveOne={() => {}}
        onRemoveMany={() => {}}
      />
    );

    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Creator" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Tag" }));
    fireEvent.change(screen.getByPlaceholderText("Filter saved videos"), {
      target: { value: "return" }
    });

    expect(screen.getByText("Return of serve under pressure: positioning and first-ball choices")).toBeInTheDocument();
    expect(screen.queryByText("Backhand net errors: clean up contact and racquet-face control")).not.toBeInTheDocument();
  });

  it("supports batch unbookmark on the visible compact rows", () => {
    const onRemoveMany = vi.fn();
    const items = ["content_gaiao_03", "content_rb_02", "content_fr_01"]
      .map((id) => contents.find((item) => item.id === id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    render(
      <ProfileBookmarkShelf
        items={items}
        pendingIds={[]}
        onRemoveOne={() => {}}
        onRemoveMany={onRemoveMany}
      />
    );

    fireEvent.click(screen.getByRole("checkbox", { name: /Backhand basics: why the contact never feels solid/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Return of serve under pressure: positioning and first-ball choices/i }));
    fireEvent.click(screen.getByRole("button", { name: "Remove selected" }));

    expect(onRemoveMany).toHaveBeenCalledWith(expect.arrayContaining(["content_gaiao_03", "content_rb_02"]));
  });
});
