import { describe, expect, it } from "vitest";
import {
  DEFAULT_MOBILE_PREVIEW_ROUTE,
  getMobilePreviewRouteOptions,
  normalizeMobilePreviewRoute
} from "@/lib/mobilePreview/routes";

describe("mobile preview route helpers", () => {
  it("falls back to the default route for unsupported values", () => {
    expect(normalizeMobilePreviewRoute("/unknown")).toBe(DEFAULT_MOBILE_PREVIEW_ROUTE);
    expect(normalizeMobilePreviewRoute("javascript:alert(1)")).toBe(DEFAULT_MOBILE_PREVIEW_ROUTE);
  });

  it("keeps supported routes", () => {
    expect(normalizeMobilePreviewRoute("/library")).toBe("/library");
    expect(normalizeMobilePreviewRoute("/profile")).toBe("/profile");
  });

  it("returns the full supported route list", () => {
    expect(getMobilePreviewRouteOptions().map((option) => option.value)).toEqual([
      "/diagnose",
      "/plan",
      "/library",
      "/profile"
    ]);
  });
});
