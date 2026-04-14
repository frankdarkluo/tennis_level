import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppShellProvider } from "@/components/app/AppShellProvider";
import { Header } from "@/components/layout/Header";
import { I18nProvider, useI18n } from "@/lib/i18n/config";

const mockUsePathname = vi.fn(() => "/");
const mockSignOut = vi.fn();
const mockOpenLoginModal = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname()
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => React.createElement("a", { href, ...props }, children)
}));

vi.mock("next/image", () => ({
  default: ({ priority: _priority, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) =>
    React.createElement("img", props)
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    configured: false,
    sendMagicLink: vi.fn(),
    signOut: mockSignOut
  })
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal: mockOpenLoginModal,
    closeLoginModal: vi.fn()
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn(),
  setEventLoggerStudySession: vi.fn()
}));

vi.mock("@/lib/study/client", () => ({
  persistStudySessionEnd: vi.fn(),
  persistStudySessionStart: vi.fn()
}));

function LanguageProbe() {
  const { language, t, setLanguage } = useI18n();

  return (
    <div>
      <span data-testid="language-value">{language}</span>
      <span data-testid="translated-home">{t("nav.home")}</span>
      <button type="button" onClick={() => setLanguage("en")}>switch-to-en</button>
      <button type="button" onClick={() => setLanguage("zh")}>switch-to-zh</button>
    </div>
  );
}

describe("language switcher", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    mockSignOut.mockReset();
    mockOpenLoginModal.mockReset();
    mockUsePathname.mockReset();
    mockUsePathname.mockReturnValue("/");
  });

  afterEach(() => {
    document.documentElement.lang = "zh-CN";
  });

  it("switches the site language through the shared providers and persists it", () => {
    render(
      <AppShellProvider>
        <I18nProvider>
          <LanguageProbe />
        </I18nProvider>
      </AppShellProvider>
    );

    expect(screen.getByTestId("language-value").textContent).toBe("zh");
    expect(screen.getByTestId("translated-home").textContent).toBe("首页");

    fireEvent.click(screen.getByText("switch-to-en"));

    expect(screen.getByTestId("language-value").textContent).toBe("en");
    expect(screen.getByTestId("translated-home").textContent).toBe("Home");
    expect(window.localStorage.getItem("tennislevel.app_language")).toBe("en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("renders zh | en buttons in the header and switches to English", () => {
    render(
      <AppShellProvider>
        <I18nProvider>
          <Header />
        </I18nProvider>
      </AppShellProvider>
    );

    const englishButtons = screen.getAllByRole("button", { name: "切换网站语言为英文" });
    fireEvent.click(englishButtons[0]!);

    expect(screen.getByRole("link", { name: "Diagnosis" })).toHaveAttribute("href", "/diagnose");
    expect(screen.getByRole("link", { name: "Plan" })).toHaveAttribute("href", "/plan");
    expect(screen.getAllByRole("button", { name: "Switch site language to Chinese" }).length).toBeGreaterThan(0);
  });

  it("keeps main task navigation route-based even on a removed legacy admin path", () => {
    mockUsePathname.mockReturnValue("/admin/export");

    render(
      <AppShellProvider>
        <I18nProvider>
          <Header />
        </I18nProvider>
      </AppShellProvider>
    );

    expect(screen.getByRole("link", { name: "问题诊断" })).toHaveAttribute("href", "/diagnose");
    expect(screen.getByRole("link", { name: "训练计划" })).toHaveAttribute("href", "/plan");
  });

  it("keeps the consumer shell route-based even when leftover study-session storage exists", () => {
    mockUsePathname.mockReturnValue("/assessment");
    window.localStorage.setItem("tennislevel_study_session", JSON.stringify({
      sessionId: "study_1",
      language: "zh",
      studyMode: true
    }));

    render(
      <AppShellProvider>
        <I18nProvider>
          <Header />
        </I18nProvider>
      </AppShellProvider>
    );

    expect(screen.getByRole("link", { name: "问题诊断" })).toHaveAttribute("href", "/diagnose");
    expect(screen.getByRole("link", { name: "训练计划" })).toHaveAttribute("href", "/plan");
  });

  it("does not lock language switching just because leftover study-session storage exists", () => {
    window.localStorage.setItem("tennislevel_study_session", JSON.stringify({
      sessionId: "study_1",
      language: "zh",
      studyMode: true
    }));

    render(
      <AppShellProvider>
        <I18nProvider>
          <LanguageProbe />
        </I18nProvider>
      </AppShellProvider>
    );

    expect(screen.getByTestId("language-value").textContent).toBe("zh");

    fireEvent.click(screen.getByText("switch-to-en"));

    expect(screen.getByTestId("language-value").textContent).toBe("en");
    expect(window.localStorage.getItem("tennislevel.app_language")).toBe("en");
  });

  it("prefers the stored app language over leftover study-session storage", () => {
    window.localStorage.setItem("tennislevel.app_language", "zh");
    window.localStorage.setItem("tennislevel_study_session", JSON.stringify({
      sessionId: "study_2",
      language: "en",
      studyMode: true
    }));

    render(
      <AppShellProvider>
        <I18nProvider>
          <LanguageProbe />
        </I18nProvider>
      </AppShellProvider>
    );

    expect(screen.getByTestId("language-value").textContent).toBe("zh");
    expect(screen.getByTestId("translated-home").textContent).toBe("首页");
  });
});
