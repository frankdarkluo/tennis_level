"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { consumerSecondaryNavItems, shouldShowConsumerShell } from "@/lib/appMode";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { LocaleValue } from "@/lib/i18n/config";

function isActivePath(pathname: string | null, href: string) {
  if (!pathname) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { language, t, setLanguage, canChangeLanguage } = useI18n();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const showConsumerNav = shouldShowConsumerShell(pathname);

  async function handleSignOut() {
    setIsSigningOut(true);
    logEvent("logout_click", { source: "header" });
    await signOut();
    setIsSigningOut(false);
  }

  function handleLanguageChange(nextLanguage: LocaleValue) {
    if (language === nextLanguage || !canChangeLanguage) {
      return;
    }

    logEvent("language_switch", { from: language, to: nextLanguage });
    setLanguage(nextLanguage);
  }

  const languageToggle = (
    <div
      className="inline-flex items-center gap-0.5"
      role="group"
      aria-label={t("nav.languageLabel")}
    >
      {(["zh", "en"] as const).map((option, index) => (
        <div key={option} className="flex items-center">
          {index > 0 ? <span className="text-[11px] text-slate-300">/</span> : null}
          <button
            type="button"
            className={cn(
              "rounded-md px-1.5 py-1 text-xs font-medium uppercase transition",
              language === option ? "text-brand-600" : "text-slate-400 hover:text-slate-600",
              !canChangeLanguage && "cursor-not-allowed opacity-50"
            )}
            aria-pressed={language === option}
            aria-label={option === "zh" ? t("nav.languageOptionZh") : t("nav.languageOptionEn")}
            disabled={!canChangeLanguage}
            onClick={() => handleLanguageChange(option)}
          >
            {option}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[rgba(243,249,248,0.88)] shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-2 px-4 py-2.5 md:px-6 lg:gap-3">
        <Link
          href="/"
          aria-label={t("nav.logoAria")}
          className="inline-flex min-h-14 shrink-0 items-center justify-start px-2 py-1.5"
        >
          <Image
            src="/brand/tennislevel-logo-header.png"
            alt="TennisLevel"
            width={994}
            height={256}
            priority
            className="h-[2rem] w-auto max-w-full object-contain mix-blend-multiply md:h-[2.4rem] lg:h-[2.8rem]"
          />
        </Link>

        {showConsumerNav ? (
          <nav className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1 md:px-3 lg:gap-1.5">
            {consumerSecondaryNavItems.map((item) => {
              const active = isActivePath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-lg px-2 py-1.5 text-[15px] font-semibold transition md:px-2.5 lg:px-3 lg:py-2",
                    active
                      ? "text-brand-700 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-3/5 after:-translate-x-1/2 after:rounded-full after:bg-brand-400 after:content-['']"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </nav>
        ) : null}

        <div className="hidden shrink-0 items-center gap-1 md:flex lg:gap-1.5">
          {languageToggle}
          <div className="mx-1 h-4 w-px bg-slate-200" />
          {user?.email ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 lg:text-sm"
              >
                {t("nav.profile")}
              </Link>
              <button
                type="button"
                className="rounded-lg px-2 py-1.5 text-[13px] text-slate-400 transition hover:text-slate-600 lg:text-sm"
                disabled={isSigningOut}
                onClick={() => void handleSignOut()}
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 lg:text-sm"
              onClick={() => openLoginModal(undefined, "header")}
            >
              {loading ? t("nav.account") : t("nav.login")}
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          {languageToggle}
        </div>
      </div>
    </header>
  );
}
