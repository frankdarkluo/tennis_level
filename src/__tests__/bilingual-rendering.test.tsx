import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { DiagnoseResult } from "@/components/diagnose/DiagnoseResult";
import { HotContentSection } from "@/components/home/HotContentSection";
import { ContentCard } from "@/components/library/ContentCard";
import { CreatorDetailModal } from "@/components/rankings/CreatorDetailModal";
import { CreatorCard } from "@/components/rankings/CreatorCard";
import { DayPlanCard } from "@/components/plan/DayPlanCard";
import LibraryPage from "@/app/library/page";
import { getCreatorTags } from "@/lib/content/display";

const openLoginModal = vi.fn();

const translationMap = {
  "content.openAria": "Open video: {value}",
  "content.targetPrefix": "Focus:",
  "content.unknownCreator": "Unknown creator",
  "content.secondaryTitle": "Original title",
  "content.subtitle.yes": "EN subtitles",
  "content.subtitle.no": "No subtitles",
  "content.subtitle.unknown": "Subtitles unknown",
  "content.subtitle.notNeeded": "Native English",
  "content.lang.zh": "ZH",
  "content.lang.en": "EN",
  "content.bookmark.add": "Add bookmark",
  "content.bookmark.remove": "Remove bookmark",
  "content.bookmark.removeSaved": "Remove bookmark",
  "content.bookmark.working": "Working...",
  "content.open": "Open video",
  "content.whyRecommended": "Why recommended",
  "content.whyPrefix": "Recommended because:",
  "content.recommendationWhy": "Why selected",
  "content.recommendationTarget": "Technical point",
  "content.recommendationTrust": "Trust signals",
  "content.trust.directSource": "Direct source",
  "content.trust.searchLink": "Search link",
  "content.trust.teaching": "Teaching video",
  "content.trust.matchExample": "Match example",
  "content.trust.commentary": "Commentary",
  "creator.modalTitle": "Creator details",
  "creator.suitableFor": "Best for",
  "creator.theirContent": "Their content",
  "creator.noContent": "No indexed content yet",
  "creator.goHome": "Visit homepage",
  "creator.platformAria": "Visit {name} on {platform}",
  "creator.targetPrefix": "Focus:",
  "modal.close": "Close",
  "plan.day.today": "Start here",
  "plan.day.label": "Step {day}",
  "plan.day.what": "What to practice",
  "plan.day.duration": "How long",
  "plan.day.watch": "Watch this",
  "plan.day.open": "Open video",
  "plan.day.goal": "Goal",
  "plan.day.setup": "Setup",
  "plan.day.dosage": "Dosage",
  "plan.day.focusCues": "Focus cues",
  "plan.day.mistakes": "Common mistakes",
  "plan.day.primaryVideo": "Primary video",
  "plan.day.backupVideo": "Backup video",
  "plan.day.drill": "Drill",
  "plan.day.load": "Load / volume",
  "plan.day.executionFocus": "Execution focus",
  "plan.day.warmup": "Warm-up",
  "plan.day.main": "Practice",
  "plan.day.pressure": "Pressure reps",
  "plan.day.success": "Success criteria",
  "plan.day.failure": "Common failure cue",
  "plan.day.transfer": "Transfer cue",
  "plan.day.linkedReason": "Why watch this today",
  "plan.day.intensity": "Intensity",
  "plan.day.tempo": "Tempo",
  "plan.day.intensity.low": "Low",
  "plan.day.intensity.medium": "Medium",
  "plan.day.intensity.medium_high": "Medium-high",
  "plan.day.tempo.slow": "Slow",
  "plan.day.tempo.controlled": "Controlled",
  "plan.day.tempo.match_70": "Match pace 70%",
  "plan.day.fallback": "Start with this step first, then use the library only as needed.",
  "plan.day.expand": "Expand",
  "plan.day.collapse": "Collapse",
  "plan.day.drills": "Drills",
  "diagnose.result.badge": "Diagnosis",
  "diagnose.result.today": "Try this first",
  "diagnose.result.expand1": "See why and what to watch",
  "diagnose.result.why": "Why this is happening",
  "diagnose.result.featured": "Featured content",
  "diagnose.result.plan": "Build a plan",
  "diagnose.result.library": "Browse more content",
  "diagnose.result.rankings": "Find creators",
  "home.hotContent.title": "Hot content",
  "home.more": "See more",
  "library.title": "Find content",
  "library.subtitle": "Search by skill, creator, or situation.",
  "library.more": "See more",
  "library.empty": "No matching content yet.",
  "library.clear": "Clear filters",
  "library.loading": "Loading library...",
  "library.bookmarkLogin": "Sign in to bookmark content",
  "library.searchPlaceholder": "Search by skill, creator, or situation",
  "library.searchAction": "Search",
  "library.emptySearch": "No strong content match for \"{query}\". Try a skill, creator, or problem phrase.",
  "library.filter.languageAll": "All languages",
  "library.filter.languageZh": "Chinese content",
  "library.filter.languageEn": "English content",
  "library.filter.subtitleAll": "All subtitle states",
  "library.filter.subtitleYes": "Has English subtitles",
  "library.filter.subtitleNo": "No English subtitles",
  "library.bookmarks": "My bookmarks"
} as const;

function translate(key: string, replacements?: Record<string, string | number>) {
  const template = translationMap[key as keyof typeof translationMap] ?? key;

  if (!replacements) {
    return template;
  }

  return Object.entries(replacements).reduce((current, [token, value]) => {
    return current.replace(new RegExp(`\\{${token}\\}`, "g"), String(value));
  }, template);
}

vi.mock("@/lib/i18n/config", () => ({
  useI18n: () => ({
    language: "en",
    t: translate
  })
}));

vi.mock("@/components/app/AppShellProvider", () => ({
  useAppShell: () => ({
    environment: "production",
    loading: false,
    language: "en",
    canChangeLanguage: true,
    setLanguage: vi.fn()
  })
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null)
  }),
  usePathname: () => "/library"
}));

vi.mock("@/lib/assessmentStorage", () => ({
  readAssessmentResultFromStorage: () => ({ answeredCount: 1, level: "3.0" }),
  hasCompletedAssessmentResult: () => true,
  hasStoredCompletedAssessmentResult: () => true,
  writeAssessmentResultToStorage: vi.fn()
}));

vi.mock("@/components/auth/AuthProvider", () => ({
  useAuth: () => ({
    user: null,
    configured: false,
    loading: false,
    sendMagicLink: vi.fn(),
    signOut: vi.fn()
  })
}));

vi.mock("@/components/auth/AuthModalProvider", () => ({
  useAuthModal: () => ({
    openLoginModal,
    closeLoginModal: vi.fn()
  })
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

describe("bilingual rendering", () => {
  it("renders ContentCard in English with English primary title and Chinese secondary title", () => {
    const item = contents.find((entry) => entry.id === "content_gaiao_02");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_gaiao_02");
    }

    render(<ContentCard item={item} />);

    expect(screen.getByText("Serve fundamentals: build rhythm before power")).toBeInTheDocument();
    expect(screen.getByText("ZH")).toBeInTheDocument();
    expect(screen.getByText("No subtitles")).toBeInTheDocument();
    expect(screen.getByText("Original title")).toBeInTheDocument();
    expect(screen.getByText(/网球发球/)).toBeInTheDocument();
    expect(screen.getByText("Focus: For players who rush the serve and lose trust in the second serve.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open video: Serve fundamentals: build rhythm before power" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Why recommended" }));

    expect(screen.getByText("Why selected")).toBeInTheDocument();
    expect(screen.getByText("Technical point")).toBeInTheDocument();
    expect(screen.getByText("Trust signals")).toBeInTheDocument();
    expect(screen.getByText("Direct source")).toBeInTheDocument();
    expect(screen.getByText("Teaching video")).toBeInTheDocument();
  });

  it("renders CreatorDetailModal in English with translated creator copy and featured video text", () => {
    const creator = creators.find((entry) => entry.id === "creator_gaiao");

    expect(creator).toBeTruthy();
    if (!creator) {
      throw new Error("Missing creator_gaiao");
    }

    render(<CreatorDetailModal creator={creator} open onClose={() => {}} />);

    expect(screen.getByText("Clear, wide-ranging instruction for beginners who want a solid base and a reliable self-study path.")).toBeInTheDocument();
    expect(screen.getByText("Complete beginners / Building a forehand foundation / Serve basics")).toBeInTheDocument();
    expect(screen.getByText("Detailed beginner forehand lesson")).toBeInTheDocument();
    expect(screen.getByText("详细版 网球正手零基础教学")).toBeInTheDocument();
    expect(screen.getByText("Focus: When your forehand foundation never feels stable")).toBeInTheDocument();
  });

  it("renders creator cards with the newer English tag labels", () => {
    const creator = creators.find((entry) => entry.id === "creator_gaiao");

    expect(creator).toBeTruthy();
    if (!creator) {
      throw new Error("Missing creator_gaiao");
    }

    render(<CreatorCard creator={creator} onDetail={() => {}} />);

    expect(screen.getByText("Beginner-ready")).toBeInTheDocument();
    expect(screen.getByText("Form building")).toBeInTheDocument();
    expect(screen.getByText("Clear breakdowns")).toBeInTheDocument();
  });

  it("keeps creator tag order and one-to-one mapping with the newer, more varied labels", () => {
    const creator = creators.find((entry) => entry.id === "creator_gaiao");

    expect(creator).toBeTruthy();
    if (!creator) {
      throw new Error("Missing creator_gaiao");
    }

    expect(getCreatorTags(creator.tags, "zh")).toEqual(["入门友好", "基础筑形", "讲解透彻"]);
    expect(getCreatorTags(creator.tags, "en")).toEqual(["Beginner-ready", "Form building", "Clear breakdowns"]);
  });

  it("migrates obvious net-play and tactical creators onto the newer raw tag taxonomy", () => {
    const racketBrothers = creators.find((entry) => entry.id === "creator_racketbrothers");
    const fuzzyYellowBalls = creators.find((entry) => entry.id === "creator_fuzzy_yellow_balls");
    const edgar = creators.find((entry) => entry.id === "creator_edgar_giffenig_tennis");

    expect(racketBrothers?.tags).toEqual(["网前专修", "实战拆解", "讲解透彻"]);
    expect(fuzzyYellowBalls?.tags).toEqual(["战术拆局", "实战拆解", "进阶突破"]);
    expect(edgar?.tags).toEqual(["战术拆局", "讲解透彻", "基础筑形"]);
  });

  it("renders CreatorDetailModal content cards with language cues and original-title label", () => {
    const creator = creators.find((entry) => entry.id === "creator_topspinpro_hidden");

    expect(creator).toBeTruthy();
    if (!creator) {
      throw new Error("Missing creator_topspinpro_hidden");
    }

    render(<CreatorDetailModal creator={creator} open onClose={() => {}} />);

    expect(screen.getByText("ZH")).toBeInTheDocument();
    expect(screen.getByText("Original title")).toBeInTheDocument();
    expect(screen.getByText(/盖奥教练教你上旋球/)).toBeInTheDocument();
  });

  it("renders an English plan day card with the full prescription blocks", () => {
    render(
      <DayPlanCard
        day={{
          day: 2,
          focus: "Stabilize the toss",
          contentIds: ["content_gaiao_02", "content_rb_02", "content_rb_03"],
          drills: ["30 toss reps"],
          drill: "30 toss reps",
          load: "3 sets x 10 reps",
          executionFocus: "Keep the toss shape and timing the same on every rep.",
          linkedContentReason: "Use this content today because it reinforces the exact pattern this step is trying to stabilize.",
          duration: "20 min",
          goal: "Build a steadier serve rhythm",
          warmupBlock: { title: "Warm-up prep", items: ["30 toss reps"] },
          mainBlock: { title: "Serve reps", items: ["20 first serves"] },
          pressureBlock: { title: "Pressure rule", items: ["Land 6 in a row before moving on"] },
          successCriteria: ["Finish with stable mechanics"],
          failureCue: "If the toss drifts, reset before adding pace",
          progressionNote: "Carry the same toss shape into tomorrow's live serves",
          transferCue: "Use the same toss cue on the first serve of each point",
          intensity: "medium",
          tempo: "controlled"
        }}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand" }));

    expect(screen.getByText("Goal")).toBeInTheDocument();
    expect(screen.getByText("Build a steadier serve rhythm")).toBeInTheDocument();
    expect(screen.getByText("Setup")).toBeInTheDocument();
    expect(screen.getByText("30 toss reps")).toBeInTheDocument();
    expect(screen.getByText("Dosage")).toBeInTheDocument();
    expect(screen.getByText("3 sets x 10 reps · 20 min")).toBeInTheDocument();
    expect(screen.getByText("Focus cues")).toBeInTheDocument();
    expect(screen.getByText("Keep the toss shape and timing the same on every rep.")).toBeInTheDocument();
    expect(screen.getByText("Success criteria")).toBeInTheDocument();
    expect(screen.getByText("Finish with stable mechanics")).toBeInTheDocument();
    expect(screen.getByText("Common mistakes")).toBeInTheDocument();
    expect(screen.getByText("If the toss drifts, reset before adding pace")).toBeInTheDocument();
    expect(screen.getByText("Primary video")).toBeInTheDocument();
    expect(screen.getByText("Backup video")).toBeInTheDocument();
    expect(screen.getAllByText("ZH").length).toBeGreaterThan(0);
    expect(screen.getAllByText("No subtitles").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Original title").length).toBeGreaterThan(0);
    expect(screen.getByText(/网球发球/)).toBeInTheDocument();
    expect(screen.queryByText("Match execution in doubles: stabilize first, then press")).not.toBeInTheDocument();
    expect(screen.getAllByText("Direct source").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Teaching video").length).toBeGreaterThan(0);
    expect(screen.getByText("Why watch this today")).toBeInTheDocument();
    expect(screen.getByText("Use this content today because it reinforces the exact pattern this step is trying to stabilize.")).toBeInTheDocument();
  });

  it("keeps the prescription sections ahead of featured content on today cards", () => {
    render(
      <DayPlanCard
        isToday
        day={{
          day: 1,
          focus: "固定高压准备点",
          contentIds: ["content_gaiao_02", "content_rb_02"],
          drills: ["原地高压引拍 15 次", "高压落点控制 12 球"],
          drill: "高压落点控制 12 球",
          load: "3 组 x 4 球",
          executionFocus: "先转身找球，再把击球点放到身体前上方。",
          linkedContentReason: "今天挂这条内容，是为了让你看到这一步正在练的动作主线到底该长什么样。",
          duration: "20 分钟",
          goal: "先把高压准备点固定住",
          warmupBlock: { title: "高压热身", items: ["原地高压引拍 15 次"] },
          mainBlock: { title: "高压主练", items: ["高压落点控制 12 球"] },
          pressureBlock: { title: "高压压力", items: ["连续 5 球都要主动上步"] },
          successCriteria: ["动作不慌，击球点稳定"],
          failureCue: "一旦脚下停住，高压又会重新只剩手打",
          progressionNote: "明天继续带着同一准备点去处理更高的来球",
          transferCue: "把同一准备点带进下一次真实高压球",
          intensity: "low",
          tempo: "slow"
        }}
      />
    );

    const goalLabel = screen.getByText("Goal");
    const watchLabel = screen.getByText("Primary video");
    const featuredTitle = screen.getByText("Serve fundamentals: build rhythm before power");

    expect(goalLabel).toBeInTheDocument();
    expect(watchLabel).toBeInTheDocument();
    expect(featuredTitle).toBeInTheDocument();
    expect(goalLabel.compareDocumentPosition(watchLabel)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(watchLabel.compareDocumentPosition(featuredTitle)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.queryByText("Backup video")).not.toBeInTheDocument();
  });

  it("renders diagnose recommendation cards with language cues and original-title label", () => {
    const item = contents.find((entry) => entry.id === "content_gaiao_02");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_gaiao_02");
    }

    render(
      <DiagnoseResult
        result={{
          input: "my serve feels rushed",
          normalizedInput: "my serve feels rushed",
          matchedRuleId: "serve-basics",
          matchedKeywords: ["serve"],
          matchedSynonyms: [],
          matchScore: 0.8,
          confidence: "中等",
          effortMode: "standard",
          evidenceLevel: "medium",
          needsNarrowing: false,
          narrowingPrompts: [],
          narrowingSuggestions: [],
          primaryNextStep: "Slow the tempo and rebuild the toss.",
          problemTag: "serve-basics",
          category: ["serve"],
          title: "Serve diagnosis",
          summary: "Build a cleaner serve rhythm first.",
          causes: ["You rush the motion before the toss settles."],
          fixes: ["Slow the tempo and rebuild the toss."],
          drills: ["30 toss reps"],
          recommendedContents: [item],
          searchQueries: null,
          fallbackUsed: false,
          fallbackMode: null,
          level: "3.0"
        }}
      />
    );

    fireEvent.click(screen.getByText("See why and what to watch"));

    const planLink = screen.getByRole("link", { name: "Build a plan" });
    const planHref = planLink.getAttribute("href");

    expect(screen.getByText("Evidence: medium")).toBeInTheDocument();
    expect(screen.queryByText(/Confidence: Medium\./)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByText(/Confidence: Medium\./)).toBeInTheDocument();
    expect(screen.getByText("ZH")).toBeInTheDocument();
    expect(screen.getByText("No subtitles")).toBeInTheDocument();
    expect(screen.getByText("Original title")).toBeInTheDocument();
    expect(screen.getByText(/网球发球/)).toBeInTheDocument();
    expect(screen.getByText("Why selected")).toBeInTheDocument();
    expect(screen.getByText("Trust signals")).toBeInTheDocument();
    expect(screen.getByText("Direct source")).toBeInTheDocument();
    expect(screen.getByText("Teaching video")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Upload a video for a more precise diagnosis" })).not.toBeInTheDocument();
    expect(planHref).toBeTruthy();

    const planUrl = new URL(planHref ?? "", "https://example.com");
    expect(planUrl.searchParams.get("primaryNextStep")).toBe("Slow the tempo and rebuild the toss.");
  });

  it("uses the translated library bookmark login prompt in English mode", async () => {
    const item = contents.find((entry) => entry.id === "content_gaiao_02");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_gaiao_02");
    }

    render(<LibraryPage />);

    const bookmarkButtons = await screen.findAllByRole("button", { name: "Add bookmark" });
    bookmarkButtons[0]?.click();

    expect(openLoginModal).toHaveBeenCalledWith("Sign in to bookmark content", "bookmark");
  });

  it("renders the content-language filter in the English library flow", () => {
    render(<LibraryPage />);

    expect(screen.getByText("Chinese content")).toBeInTheDocument();
    expect(screen.getByText("English content")).toBeInTheDocument();
  });

  it("uses an explicit library search action and shows mismatch feedback after submission", async () => {
    render(<LibraryPage />);

    expect(await screen.findAllByRole("link", { name: /Open video:/ })).not.toHaveLength(0);

    fireEvent.change(screen.getByPlaceholderText("Search by skill, creator, or situation"), {
      target: { value: "nonexistent mismatch phrase" }
    });

    expect(screen.getAllByRole("link", { name: /Open video:/ }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    expect(
      screen.getByText('No strong content match for "nonexistent mismatch phrase". Try a skill, creator, or problem phrase.')
    ).toBeInTheDocument();
  });

  it("renders home hot content cards with bilingual metadata cues", () => {
    render(<HotContentSection />);

    expect(screen.getByText("ZH")).toBeInTheDocument();
    expect(screen.getByText("No subtitles")).toBeInTheDocument();
    expect(screen.getByText("Original title")).toBeInTheDocument();
    expect(screen.getByText(/反手总下网/)).toBeInTheDocument();
  });
});
