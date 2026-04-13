export const MOBILE_PREVIEW_ROUTE_OPTIONS = [
  { value: "/diagnose", label: "Diagnose" },
  { value: "/plan", label: "Plan" },
  { value: "/library", label: "Library" },
  { value: "/profile", label: "Profile" }
] as const;

export const DEFAULT_MOBILE_PREVIEW_ROUTE = "/library";

const SUPPORTED_MOBILE_PREVIEW_ROUTES = new Set(MOBILE_PREVIEW_ROUTE_OPTIONS.map((option) => option.value));

export function normalizeMobilePreviewRoute(route: string | null | undefined) {
  if (!route) {
    return DEFAULT_MOBILE_PREVIEW_ROUTE;
  }

  return SUPPORTED_MOBILE_PREVIEW_ROUTES.has(route as (typeof MOBILE_PREVIEW_ROUTE_OPTIONS)[number]["value"])
    ? route
    : DEFAULT_MOBILE_PREVIEW_ROUTE;
}

export function getMobilePreviewRouteOptions() {
  return [...MOBILE_PREVIEW_ROUTE_OPTIONS];
}
