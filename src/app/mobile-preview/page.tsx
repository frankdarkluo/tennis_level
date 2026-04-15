import Link from "next/link";
import {
  buildMobilePreviewPageHref,
  getMobilePreviewRouteOptions,
  resolveMobilePreviewFrameSrc
} from "@/lib/mobilePreview/routes";

type MobilePreviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MobilePreviewPage({ searchParams }: MobilePreviewPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const routeParam = Array.isArray(resolvedSearchParams.route) ? resolvedSearchParams.route[0] : resolvedSearchParams.route;
  const localeParam = Array.isArray(resolvedSearchParams.locale) ? resolvedSearchParams.locale[0] : resolvedSearchParams.locale;
  const viewportParam = Array.isArray(resolvedSearchParams.viewport) ? resolvedSearchParams.viewport[0] : resolvedSearchParams.viewport;
  const presetParam = Array.isArray(resolvedSearchParams.preset) ? resolvedSearchParams.preset[0] : resolvedSearchParams.preset;
  const routeOptions = getMobilePreviewRouteOptions();
  const { currentRoute, locale, viewport, preset, frameSrc } = resolveMobilePreviewFrameSrc({
    route: routeParam,
    locale: localeParam,
    viewport: viewportParam,
    preset: presetParam
  });
  const shellWidthClass = viewport === 430 ? "max-w-[430px]" : "max-w-[390px]";

  return (
    <main className="min-h-screen bg-[var(--surface)] px-2 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3">
        <div className={`flex w-full ${shellWidthClass} gap-2 overflow-x-auto pb-1 [scrollbar-width:none]`}>
          {routeOptions.map((option) => (
            <Link
              key={option.value}
              href={buildMobilePreviewPageHref({
                route: option.value,
                locale,
                viewport,
                preset: preset && currentRoute === option.value ? preset : null
              })}
              className={option.value === currentRoute
                ? "min-w-fit rounded-full bg-brand-500 px-[1.125rem] py-[0.625rem] text-sm font-semibold leading-[1.15] text-white"
                : "min-w-fit rounded-full border border-[var(--line)] bg-white px-[1.125rem] py-[0.625rem] text-sm font-semibold leading-[1.15] text-slate-700"}
            >
              {option.label}
            </Link>
          ))}
        </div>
        <div
          data-testid="mobile-preview-shell"
          className={`w-full ${shellWidthClass} overflow-hidden rounded-[30px] border border-[var(--line)]/60 bg-white shadow-soft`}
        >
          <div className="pointer-events-none mx-auto mt-3 h-1.5 w-24 rounded-full bg-slate-300" />
          <div
            data-testid="mobile-preview-frame-shell"
            className="mt-3 overflow-hidden rounded-[28px] border-t border-[var(--line)]/40 bg-white"
          >
            <div className="h-[calc(100vh-84px)] min-h-[820px] w-full bg-white">
              <iframe
                title="Mobile preview frame"
                src={frameSrc}
                className="h-full w-full border-0 [scrollbar-width:none]"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
