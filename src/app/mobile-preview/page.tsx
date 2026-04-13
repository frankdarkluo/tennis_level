import Link from "next/link";
import { Card } from "@/components/ui/Card";
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

  return (
    <main className="min-h-screen bg-[var(--surface)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6">
        <div className="w-full max-w-[430px] rounded-[36px] border border-[var(--line)] bg-white p-4 shadow-soft">
          <div className="pointer-events-none mx-auto mb-3 h-1.5 w-24 rounded-full bg-slate-300" />
          <div className="rounded-[28px] border border-[var(--line)] bg-white p-3 shadow-inner">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Mobile Preview
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{currentRoute}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">430px</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {routeOptions.map((option) => (
                  <Link
                    key={option.value}
                    href={`/mobile-preview?route=${encodeURIComponent(option.value)}`}
                    className={option.value === currentRoute
                      ? "rounded-xl bg-brand-500 px-3 py-2 text-center text-sm font-semibold text-white"
                      : "rounded-xl border border-[var(--line)] px-3 py-2 text-center text-sm font-semibold text-slate-700"}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
              <Card className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white p-0">
                <div className="h-[calc(100vh-220px)] min-h-[780px] w-full bg-white">
                  <iframe
                    title="Mobile preview frame"
                    src={currentRoute}
                    className="h-full w-full border-0"
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
