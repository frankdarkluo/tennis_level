import { buildDiagnosisGuidanceContext } from "@/lib/guidance-context/build";
import {
  XIAOHONGSHU_LIBRARY_REVIEW_QUERY_KEY,
  XIAOHONGSHU_LIBRARY_REVIEW_QUERY_VALUE
} from "@/lib/library/xiaohongshuReviewItems";
import { buildDiagnosisPlanContext, buildPlanHref } from "@/lib/plans";
import type { ProblemTag } from "@/types/problemTag";

export const MOBILE_PREVIEW_ROUTE_OPTIONS = [
  { value: "/diagnose", label: "Diagnose" },
  { value: "/plan", label: "Plan" },
  { value: "/library", label: "Library" },
  { value: "/profile", label: "Profile" }
] as const;

export type MobilePreviewRoute = (typeof MOBILE_PREVIEW_ROUTE_OPTIONS)[number]["value"];
export type MobilePreviewLocale = "zh" | "en";
export type MobilePreviewViewport = 390 | 430;
export type MobilePreviewPreset =
  | "profile-with-bookmarks"
  | "plan-expanded"
  | "plan-collapsed"
  | "diagnose-with-attached-videos"
  | "library-xhs-mobile"
  | "library-xhs-review-mobile";

export const DEFAULT_MOBILE_PREVIEW_ROUTE: MobilePreviewRoute = "/library";
const DEFAULT_MOBILE_PREVIEW_LOCALE: MobilePreviewLocale = "zh";
const DEFAULT_MOBILE_PREVIEW_VIEWPORT: MobilePreviewViewport = 390;
const SUPPORTED_MOBILE_PREVIEW_ROUTES = new Set(MOBILE_PREVIEW_ROUTE_OPTIONS.map((option) => option.value));
const MOBILE_PREVIEW_PRESET_ROUTE: Record<MobilePreviewPreset, MobilePreviewRoute> = {
  "profile-with-bookmarks": "/profile",
  "plan-expanded": "/plan",
  "plan-collapsed": "/plan",
  "diagnose-with-attached-videos": "/diagnose",
  "library-xhs-mobile": "/library",
  "library-xhs-review-mobile": "/library"
};

export function normalizeMobilePreviewRoute(route: string | null | undefined): MobilePreviewRoute {
  if (!route) {
    return DEFAULT_MOBILE_PREVIEW_ROUTE;
  }

  return SUPPORTED_MOBILE_PREVIEW_ROUTES.has(route as MobilePreviewRoute)
    ? route as MobilePreviewRoute
    : DEFAULT_MOBILE_PREVIEW_ROUTE;
}

export function normalizeMobilePreviewLocale(locale: string | null | undefined): MobilePreviewLocale {
  return locale === "en" ? "en" : DEFAULT_MOBILE_PREVIEW_LOCALE;
}

export function normalizeMobilePreviewViewport(viewport: string | null | undefined): MobilePreviewViewport {
  return viewport === "430" ? 430 : DEFAULT_MOBILE_PREVIEW_VIEWPORT;
}

export function normalizeMobilePreviewPreset(preset: string | null | undefined): MobilePreviewPreset | null {
  if (!preset) {
    return null;
  }

  return preset in MOBILE_PREVIEW_PRESET_ROUTE ? preset as MobilePreviewPreset : null;
}

function appendMobilePreviewQuery(input: {
  href: string;
  locale: MobilePreviewLocale;
  viewport: MobilePreviewViewport;
  preset: MobilePreviewPreset | null;
}): string {
  const url = new URL(input.href, "http://localhost");
  url.searchParams.set("mobilePreview", "1");
  url.searchParams.set("mobilePreviewLocale", input.locale);
  url.searchParams.set("mobilePreviewViewport", String(input.viewport));

  if (input.preset) {
    url.searchParams.set("mobilePreviewPreset", input.preset);
  }

  return `${url.pathname}?${url.searchParams.toString()}`;
}

function buildDiagnosePreviewHref(locale: MobilePreviewLocale): string {
  const query = locale === "en"
    ? "On key points my second serve keeps dropping into the net and I tighten up."
    : "比赛里关键分时我的二发总是下网，而且会发紧。";

  return `/diagnose?q=${encodeURIComponent(query)}`;
}

function buildPlanPreviewHref(locale: MobilePreviewLocale): string {
  const problemTag: ProblemTag = "second-serve-reliability";
  const level = "3.5";
  const diagnosisInput = locale === "en"
    ? "On key points my second serve keeps dropping into the net and I tighten up."
    : "比赛里关键分时我的二发总是下网，而且会发紧。";
  const primaryNextStep = locale === "en"
    ? "Stabilize the second-serve rhythm first"
    : "先稳住二发节奏";
  const planContext = buildDiagnosisPlanContext({
    problemTag,
    diagnosisInput,
    primaryNextStep
  });
  const guidanceContext = buildDiagnosisGuidanceContext({
    problemTag,
    level,
    locale,
    diagnosisInput,
    primaryNextStep,
    planContext
  });

  return buildPlanHref({
    problemTag,
    level,
    sourceType: "diagnosis",
    primaryNextStep,
    planContext,
    guidanceContext
  });
}

function buildPresetRouteHref(preset: MobilePreviewPreset, locale: MobilePreviewLocale): string {
  if (preset === "diagnose-with-attached-videos") {
    return buildDiagnosePreviewHref(locale);
  }

  if (preset === "plan-expanded" || preset === "plan-collapsed") {
    return buildPlanPreviewHref(locale);
  }

  if (preset === "library-xhs-mobile") {
    return "/library?platform=Xiaohongshu";
  }

  if (preset === "library-xhs-review-mobile") {
    return `/library?platform=Xiaohongshu&${XIAOHONGSHU_LIBRARY_REVIEW_QUERY_KEY}=${XIAOHONGSHU_LIBRARY_REVIEW_QUERY_VALUE}`;
  }

  return "/profile";
}

export function resolveMobilePreviewFrameSrc(input: {
  route?: string | null;
  locale?: string | null;
  viewport?: string | null;
  preset?: string | null;
}) {
  const preset = normalizeMobilePreviewPreset(input.preset);
  const locale = normalizeMobilePreviewLocale(input.locale);
  const viewport = normalizeMobilePreviewViewport(input.viewport);
  const currentRoute = preset
    ? MOBILE_PREVIEW_PRESET_ROUTE[preset]
    : normalizeMobilePreviewRoute(input.route);
  const baseHref = preset
    ? buildPresetRouteHref(preset, locale)
    : currentRoute;

  return {
    currentRoute,
    locale,
    viewport,
    preset,
    frameSrc: appendMobilePreviewQuery({
      href: baseHref,
      locale,
      viewport,
      preset
    })
  };
}

export function buildMobilePreviewPageHref(input: {
  route?: MobilePreviewRoute;
  locale?: MobilePreviewLocale;
  viewport?: MobilePreviewViewport;
  preset?: MobilePreviewPreset | null;
}) {
  const params = new URLSearchParams();

  if (input.preset) {
    params.set("preset", input.preset);
  } else if (input.route) {
    params.set("route", input.route);
  }

  if (input.locale) {
    params.set("locale", input.locale);
  }

  if (input.viewport) {
    params.set("viewport", String(input.viewport));
  }

  const query = params.toString();
  return query ? `/mobile-preview?${query}` : "/mobile-preview";
}

export function getMobilePreviewRouteOptions() {
  return [...MOBILE_PREVIEW_ROUTE_OPTIONS];
}
