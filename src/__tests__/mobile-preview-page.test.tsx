import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

async function loadMobilePreviewPage() {
  const module = await import("@/app/mobile-preview/page");
  return module.default;
}

describe("MobilePreviewPage", () => {
  it("defaults to /library when no route is provided", async () => {
    const MobilePreviewPage = await loadMobilePreviewPage();
    const ui = await MobilePreviewPage({ searchParams: Promise.resolve({}) });
    render(ui);

    expect(screen.getByRole("link", { name: "Library" })).toBeInTheDocument();
    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute(
      "src",
      "/library?mobilePreview=1&mobilePreviewLocale=zh&mobilePreviewViewport=390"
    );
  });

  it("renders route tabs with preserved review params and a validated iframe src", async () => {
    const MobilePreviewPage = await loadMobilePreviewPage();
    const ui = await MobilePreviewPage({
      searchParams: Promise.resolve({ route: "/plan", locale: "en", viewport: "430" })
    });
    render(ui);

    expect(screen.getByRole("link", { name: "Plan" })).toHaveAttribute(
      "href",
      "/mobile-preview?route=%2Fplan&locale=en&viewport=430"
    );
    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute(
      "src",
      "/plan?mobilePreview=1&mobilePreviewLocale=en&mobilePreviewViewport=430"
    );
  });

  it("supports review presets for Xiaohongshu library mobile review", async () => {
    const MobilePreviewPage = await loadMobilePreviewPage();
    const ui = await MobilePreviewPage({
      searchParams: Promise.resolve({ preset: "library-xhs-mobile", viewport: "430", locale: "zh" })
    });
    render(ui);

    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute(
      "src",
      "/library?platform=Xiaohongshu&mobilePreview=1&mobilePreviewLocale=zh&mobilePreviewViewport=430&mobilePreviewPreset=library-xhs-mobile"
    );
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute(
      "href",
      "/mobile-preview?preset=library-xhs-mobile&locale=zh&viewport=430"
    );
    expect(screen.getByTestId("mobile-preview-shell")).toHaveClass("max-w-[430px]");
    expect(screen.getByTestId("mobile-preview-frame-shell")).toHaveClass("rounded-[28px]");
  });

  it("supports a Xiaohongshu candidate review preset on the current library page", async () => {
    const MobilePreviewPage = await loadMobilePreviewPage();
    const ui = await MobilePreviewPage({
      searchParams: Promise.resolve({ preset: "library-xhs-review-mobile", viewport: "430", locale: "zh" })
    });
    render(ui);

    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute(
      "src",
      "/library?platform=Xiaohongshu&review=xiaohongshu-candidates&mobilePreview=1&mobilePreviewLocale=zh&mobilePreviewViewport=430&mobilePreviewPreset=library-xhs-review-mobile"
    );
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute(
      "href",
      "/mobile-preview?preset=library-xhs-review-mobile&locale=zh&viewport=430"
    );
  });

  it("supports deterministic plan and profile review presets", async () => {
    const MobilePreviewPage = await loadMobilePreviewPage();
    const ui = await MobilePreviewPage({
      searchParams: Promise.resolve({ preset: "profile-with-bookmarks", locale: "en", viewport: "390" })
    });
    render(ui);

    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute(
      "src",
      "/profile?mobilePreview=1&mobilePreviewLocale=en&mobilePreviewViewport=390&mobilePreviewPreset=profile-with-bookmarks"
    );
  });
});
