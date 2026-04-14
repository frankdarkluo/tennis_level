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
    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute("src", "/library?mobilePreview=1");
  });

  it("renders route tabs and a validated iframe src", async () => {
    const MobilePreviewPage = await loadMobilePreviewPage();
    const ui = await MobilePreviewPage({ searchParams: Promise.resolve({ route: "/plan" }) });
    render(ui);

    expect(screen.getByRole("link", { name: "Plan" })).toHaveAttribute(
      "href",
      "/mobile-preview?route=%2Fplan"
    );
    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute("src", "/plan?mobilePreview=1");
  });

  it("renders a wider shell with minimal framing", async () => {
    const MobilePreviewPage = await loadMobilePreviewPage();
    const ui = await MobilePreviewPage({ searchParams: Promise.resolve({ route: "/diagnose" }) });
    render(ui);

    expect(screen.getByTitle("Mobile preview frame")).toHaveAttribute("src", "/diagnose?mobilePreview=1");
    expect(screen.getByTestId("mobile-preview-shell")).toHaveClass("max-w-[490px]");
    expect(screen.getByTestId("mobile-preview-frame-shell")).toHaveClass("rounded-[28px]");
  });
});
