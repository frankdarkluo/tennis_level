"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { resolveAppEnvironment } from "@/lib/environment";
import { AppEnvironment } from "@/types/environment";
import { LocaleValue } from "@/lib/i18n/config";

const APP_LANGUAGE_KEY = "tennislevel.app_language";

type AppShellContextValue = {
  language: LocaleValue;
  environment: AppEnvironment;
  loading: boolean;
  canChangeLanguage: boolean;
  setLanguage: (language: LocaleValue) => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

function isBrowser() {
  return typeof window !== "undefined";
}

function readStoredLanguage(): LocaleValue {
  if (!isBrowser()) {
    return "zh";
  }

  const stored = window.localStorage.getItem(APP_LANGUAGE_KEY);
  return stored === "en" ? "en" : "zh";
}

function readPreviewLanguageOverride(): LocaleValue | null {
  if (!isBrowser()) {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("mobilePreview") !== "1") {
    return null;
  }

  return params.get("mobilePreviewLocale") === "en" ? "en" : "zh";
}

function writeStoredLanguage(language: LocaleValue) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(APP_LANGUAGE_KEY, language);
}

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [appLanguage, setAppLanguage] = useState<LocaleValue>("zh");
  const [loading, setLoading] = useState(true);
  const [previewLanguageOverride, setPreviewLanguageOverride] = useState<LocaleValue | null>(null);

  useEffect(() => {
    const previewLanguage = readPreviewLanguageOverride();
    setPreviewLanguageOverride(previewLanguage);
    setAppLanguage(previewLanguage ?? readStoredLanguage());
    setLoading(false);
  }, []);

  const language = appLanguage;
  const canChangeLanguage = previewLanguageOverride === null;
  const environment = resolveAppEnvironment();

  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [language]);

  const value = useMemo<AppShellContextValue>(() => ({
    language,
    environment,
    loading,
    canChangeLanguage,
    setLanguage: (nextLanguage) => {
      if (previewLanguageOverride) {
        return;
      }

      setAppLanguage(nextLanguage);
      writeStoredLanguage(nextLanguage);
    }
  }), [canChangeLanguage, environment, language, loading, previewLanguageOverride]);

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }

  return context;
}
