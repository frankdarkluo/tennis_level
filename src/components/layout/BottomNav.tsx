"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { consumerPrimaryNavItems, shouldShowConsumerShell } from "@/lib/appMode";
import { useI18n } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  if (!shouldShowConsumerShell(pathname)) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-white/95 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-4 px-2 py-2">
        {consumerPrimaryNavItems.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-14 items-center justify-center rounded-2xl px-2 text-center text-[15px] font-semibold transition",
                active ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              )}
            >
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
