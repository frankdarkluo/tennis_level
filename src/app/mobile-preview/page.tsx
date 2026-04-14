import Link from "next/link";
import { getMobilePreviewRouteOptions, normalizeMobilePreviewRoute } from "@/lib/mobilePreview/routes";

type MobilePreviewPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MobilePreviewPage({ searchParams }: MobilePreviewPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const routeParam = Array.isArray(resolvedSearchParams.route)
    ? resolvedSearchParams.route[0]
    : resolvedSearchParams.route;
  const currentRoute = normalizeMobilePreviewRoute(routeParam);
  const routeOptions = getMobilePreviewRouteOptions();
  const frameSrc = `${currentRoute}?mobilePreview=1`;

  return (
    <main className="min-h-screen bg-[var(--surface)] px-2 py-4 sm:px-4 sm:py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3">
        <div className="flex w-full max-w-[490px] gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {routeOptions.map((option) => (
            <Link
              key={option.value}
              href={`/mobile-preview?route=${encodeURIComponent(option.value)}`}
              className={option.value === currentRoute
                ? "min-w-fit rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white"
                : "min-w-fit rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-semibold text-slate-700"}
            >
              {option.label}
            </Link>
          ))}
        </div>
        <div
          data-testid="mobile-preview-shell"
          className="w-full max-w-[490px] overflow-hidden rounded-[30px] border border-[var(--line)]/60 bg-white shadow-soft"
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
