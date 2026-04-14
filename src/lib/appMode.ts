export type ConsumerPrimaryNavLabelKey =
  | "nav.home"
  | "nav.assessment"
  | "nav.library"
  | "nav.profile";

export type ConsumerSecondaryNavLabelKey =
  | "nav.diagnose"
  | "nav.plan";

export const consumerPrimaryNavItems: ReadonlyArray<{ href: string; labelKey: ConsumerPrimaryNavLabelKey }> = [
  { href: "/", labelKey: "nav.home" },
  { href: "/assessment", labelKey: "nav.assessment" },
  { href: "/library", labelKey: "nav.library" },
  { href: "/profile", labelKey: "nav.profile" }
];

export const consumerSecondaryNavItems: ReadonlyArray<{ href: string; labelKey: ConsumerSecondaryNavLabelKey }> = [
  { href: "/diagnose", labelKey: "nav.diagnose" },
  { href: "/plan", labelKey: "nav.plan" }
];

export const consumerNavItems: ReadonlyArray<{
  href: string;
  labelKey: ConsumerPrimaryNavLabelKey | ConsumerSecondaryNavLabelKey;
}> = [...consumerPrimaryNavItems, ...consumerSecondaryNavItems];

export function shouldShowConsumerShell(pathname: string | null | undefined) {
  void pathname;
  return true;
}
