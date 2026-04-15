import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppShellProvider } from "@/components/app/AppShellProvider";
import { MotionPrimitive } from "@/components/plan/MotionPrimitive";
import { I18nProvider } from "@/lib/i18n/config";
import { getMotionPrimitiveDefinition } from "@/lib/plan/motionPrimitives";

function renderWithI18n(ui: React.ReactElement, language: "zh" | "en" = "en") {
  window.localStorage.setItem("tennislevel.app_language", language);
  return render(
    <AppShellProvider>
      <I18nProvider>{ui}</I18nProvider>
    </AppShellProvider>
  );
}

describe("motion primitive registry", () => {
  it("exposes localized metadata for supported motion ids", () => {
    const definition = getMotionPrimitiveDefinition("split-step");

    expect(definition).toBeTruthy();
    expect(definition?.assetPath).toBe("/motions/split-step.svg");
    expect(definition?.title.en).toBe("split step");
    expect(definition?.title.zh).toBe("分腿垫步");
  });

  it("renders a replayable localized motion card", () => {
    renderWithI18n(<MotionPrimitive motionPrimitiveId="serve-toss" />, "en");

    expect(screen.getByText("Motion cue")).toBeInTheDocument();
    expect(screen.getByText("serve toss")).toBeInTheDocument();

    const image = screen.getByRole("img", { name: "serve toss motion loop" });
    expect(image.getAttribute("src")).toContain("/motions/serve-toss.svg?play=0");

    fireEvent.click(screen.getByRole("button", { name: "Replay motion" }));

    expect(screen.getByRole("img", { name: "serve toss motion loop" }).getAttribute("src")).toContain(
      "/motions/serve-toss.svg?play=1"
    );
  });
});
