"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { creators } from "@/data/creators";
import {
  getContentFocusLine,
  getContentLanguageTag,
  getContentPrimaryTitle,
  getSubtitleAvailability
} from "@/lib/content/display";
import {
  hasCompletedAssessmentResult,
  hasStoredCompletedAssessmentResult,
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { shouldUseMobileXiaohongshuMasonry } from "@/lib/library/layout";
import { buildLibraryItems, sortLibraryItems } from "@/lib/library/order";
import { addBookmark, getBookmarkedContentIds, getLatestAssessmentResult, removeBookmark } from "@/lib/userData";
import { getThumbnail } from "@/lib/thumbnail";
import { cn, toChineseSkill } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import {
  LibraryContentLanguageFilter,
  LibraryFilters,
  LibraryPlatformFilter,
  LibrarySubtitleFilter
} from "@/components/library/LibraryFilters";
import { ContentCard } from "@/components/library/ContentCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const PAGE_SIZE = 20;
type LibraryGateState = "checking" | "assessment_required" | "ready";

function inferQueryLanguage(query: string) {
  const hasChinese = /[\u3400-\u9fff]/.test(query);
  const hasEnglish = /[A-Za-z]/.test(query);

  if (hasChinese && hasEnglish) return "mixed";
  if (hasChinese) return "zh";
  if (hasEnglish) return "en";
  return "unknown";
}

function LibraryPageContent() {
  const router = useRouter();
  const { user, configured, loading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { t } = useI18n();
  const [gateState, setGateState] = useState<LibraryGateState>("checking");
  const [keywordDraft, setKeywordDraft] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<LibraryPlatformFilter>("all");
  const [selectedContentLanguage, setSelectedContentLanguage] = useState<LibraryContentLanguageFilter>("all");
  const [selectedSubtitleAvailability, setSelectedSubtitleAvailability] = useState<LibrarySubtitleFilter>("all");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [bookmarkPendingId, setBookmarkPendingId] = useState<string | null>(null);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);
  const previousFiltersRef = useRef<Record<string, string | boolean> | null>(null);
  const previousKeywordRef = useRef("");
  // Use a deterministic product seed to avoid server/client ordering differences
  // (date-based seeds can differ between server and client timezones and cause
  // hydration mismatches). If needed, this can be changed to a server-provided
  // daily seed later.
  const productSeed = useMemo(() => "stable", []);
  const creatorNameById = useMemo(
    () => new Map(creators.map((creator) => [creator.id, creator.name])),
    []
  );
  const libraryItems = useMemo(
    () => buildLibraryItems(),
    []
  );

  useEffect(() => {
    if (loading) {
      return;
    }

    let active = true;

    async function resolveGate() {
      const localResult = readAssessmentResultFromStorage();
      let hasCompletedAssessment = hasCompletedAssessmentResult(localResult);

      if (!hasCompletedAssessment && user?.id && configured) {
        const remoteResult = await getLatestAssessmentResult(user.id);

        if (!active) {
          return;
        }

        const remoteAssessment = remoteResult.data;
        if (hasCompletedAssessmentResult(remoteAssessment)) {
          hasCompletedAssessment = true;
          writeAssessmentResultToStorage(remoteAssessment);
        }
      }

      if (!active) {
        return;
      }

      setGateState(hasCompletedAssessment ? "ready" : "assessment_required");
    }

    void resolveGate();

    return () => {
      active = false;
    };
  }, [configured, loading, router, user?.id]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    if (loading) {
      return;
    }

    let active = true;

    async function loadBookmarks() {
      if (!user?.id || !configured) {
        setBookmarkedIds([]);
        return;
      }

      const response = await getBookmarkedContentIds(user.id);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[library] failed to load bookmarks", response.error);
        return;
      }

      setBookmarkedIds(response.data);
    }

    void loadBookmarks();

    return () => {
      active = false;
    };
  }, [configured, gateState, loading, user?.id]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    logEvent("library.viewed", {
      sourceRoute: null,
      prefilledProblemTag: null,
      prefilledLevelBand: null
    }, { page: "/library" });
  }, [gateState]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    const currentFilters: Record<string, string | boolean> = {
      platform: selectedPlatform,
      contentLanguage: selectedContentLanguage,
      subtitleAvailability: selectedSubtitleAvailability,
      bookmarked: showBookmarkedOnly
    };

    if (!previousFiltersRef.current) {
      previousFiltersRef.current = currentFilters;
      return;
    }

    for (const [filterType, filterValue] of Object.entries(currentFilters)) {
      if (previousFiltersRef.current[filterType] !== filterValue) {
        const filterName = filterType === "contentLanguage"
          ? "content_language"
          : filterType === "subtitleAvailability"
            ? "subtitle_availability"
            : filterType;
        logEvent("library.filter_changed", {
          filterName,
          filterValue
        }, { page: "/library" });
      }
    }

    previousFiltersRef.current = currentFilters;
  }, [gateState, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, showBookmarkedOnly]);

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    const trimmed = keyword.trim();
    if (!trimmed || previousKeywordRef.current === trimmed) {
      previousKeywordRef.current = trimmed;
      return;
    }

    previousKeywordRef.current = trimmed;
    logEvent("library.search_used", {
      queryLength: trimmed.length,
      queryLanguage: inferQueryLanguage(trimmed)
    }, { page: "/library" });
  }, [gateState, keyword]);

  useEffect(() => {
    const syncViewportWidth = () => {
      setViewportWidth(window.innerWidth);
    };

    syncViewportWidth();
    window.addEventListener("resize", syncViewportWidth);

    return () => {
      window.removeEventListener("resize", syncViewportWidth);
    };
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [keyword, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, showBookmarkedOnly]);

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();

    const matchedItems = libraryItems.filter((item) => {
      const searchableFields = [
        item.title,
        item.sourceTitle ?? "",
        getContentPrimaryTitle(item, "en"),
        getContentFocusLine(item, "en"),
        getContentFocusLine(item, "zh"),
        creatorNameById.get(item.creatorId) ?? "",
        item.coachReason ?? "",
        item.reason,
        ...item.skills,
        ...item.skills.map((skill) => toChineseSkill(skill)),
        ...item.useCases
      ].join(" ").toLowerCase();

      const hitKeyword = query ? searchableFields.includes(query) : true;
      const hitPlatform = selectedPlatform === "all" ? true : item.platform === selectedPlatform;
      const itemLanguage = getContentLanguageTag(item);
      const itemSubtitleAvailability = getSubtitleAvailability(item);
      const hitContentLanguage = selectedContentLanguage === "all" ? true : itemLanguage === selectedContentLanguage;
      const hitSubtitle = selectedSubtitleAvailability === "all"
        ? true
        : selectedSubtitleAvailability === "english"
          ? itemSubtitleAvailability === "english" || itemSubtitleAvailability === "zh_en" || itemSubtitleAvailability === "not_needed"
          : itemSubtitleAvailability === "none";
      const hitBookmark = showBookmarkedOnly ? bookmarkedIds.includes(item.id) : true;
      return hitKeyword && hitPlatform && hitContentLanguage && hitSubtitle && hitBookmark;
    });

    const withThumbnail = sortLibraryItems(
      matchedItems.filter((item) => Boolean(getThumbnail(item))),
      `${productSeed}:with-thumb`
    );
    const withoutThumbnail = sortLibraryItems(
      matchedItems.filter((item) => !getThumbnail(item)),
      `${productSeed}:no-thumb`
    );
    return [...withThumbnail, ...withoutThumbnail];
  }, [bookmarkedIds, creatorNameById, keyword, productSeed, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, showBookmarkedOnly]);
  const visibleItems = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount]
  );
  const hasMore = visibleItems.length < filtered.length;
  const useCompactMobileLibraryLayout = viewportWidth !== null && viewportWidth <= 480;
  const useXiaohongshuMobileMasonry = shouldUseMobileXiaohongshuMasonry({
    selectedPlatform,
    viewportWidth
  });

  useEffect(() => {
    if (gateState !== "ready") {
      return;
    }

    if (visibleItems.length === 0) {
      return;
    }

    logEvent("library.batch_loaded", {
      visibleCount: visibleItems.length,
      batchIndex: Math.ceil(visibleItems.length / PAGE_SIZE)
    }, { page: "/library" });
  }, [gateState, visibleItems.length]);

  const clearAll = () => {
    setKeywordDraft("");
    setKeyword("");
    setSelectedPlatform("all");
    setSelectedContentLanguage("all");
    setSelectedSubtitleAvailability("all");
    setShowBookmarkedOnly(false);
  };

  const applySearch = () => {
    setKeyword(keywordDraft.trim());
  };

  const handleToggleBookmark = async (contentId: string) => {
    if (!user?.id || !configured) {
      openLoginModal(t("library.bookmarkLogin"), "bookmark");
      return;
    }

    const isBookmarked = bookmarkedIds.includes(contentId);
    setBookmarkPendingId(contentId);

    const response = isBookmarked
      ? await removeBookmark(user.id, contentId)
      : await addBookmark(user.id, contentId);

    if (response.error) {
      console.error("[library] failed to toggle bookmark", response.error);
      setBookmarkPendingId(null);
      return;
    }

    setBookmarkedIds((prev) =>
      isBookmarked ? prev.filter((id) => id !== contentId) : [...prev, contentId]
    );
    logEvent("content.bookmark_toggled", {
      contentId,
      bookmarked: !isBookmarked
    }, { page: "/library" });
    setBookmarkPendingId(null);
  };

  if (gateState === "checking") {
    return (
      <PageContainer>
        <Card className="text-sm text-slate-600">{t("assessment.loading")}</Card>
      </PageContainer>
    );
  }

  if (gateState === "assessment_required") {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4">
          <h1 className="text-2xl font-black text-slate-900">{t("assessment.empty.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("assessment.empty.subtitle")}</p>
          <Link href="/assessment">
            <Button>{t("assessment.result.ctaStart")}</Button>
          </Link>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={cn("space-y-5", useCompactMobileLibraryLayout && "space-y-3")}>
        {useCompactMobileLibraryLayout ? (
          <div data-testid="library-mobile-header" className="-mx-4 px-4 pt-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700/75">Library</p>
                <h1 className="mt-1 text-[1.75rem] font-black leading-none text-slate-900">{t("library.title")}</h1>
              </div>
              <Link
                href="/profile"
                className="inline-flex min-h-9 shrink-0 items-center rounded-full border border-[var(--line)] bg-white px-3 text-xs font-semibold text-slate-600"
              >
                {t("nav.profile")}
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-black text-slate-900">{t("library.title")}</h1>
            <p className="mt-2 text-slate-600">{t("library.subtitle")}</p>
          </div>
        )}

        <LibraryFilters
          keywordDraft={keywordDraft}
          setKeywordDraft={setKeywordDraft}
          onSearch={applySearch}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selectedContentLanguage={selectedContentLanguage}
          setSelectedContentLanguage={setSelectedContentLanguage}
          selectedSubtitleAvailability={selectedSubtitleAvailability}
          setSelectedSubtitleAvailability={setSelectedSubtitleAvailability}
          showBookmarkedOnly={showBookmarkedOnly}
          setShowBookmarkedOnly={setShowBookmarkedOnly}
          bookmarkFilterEnabled={Boolean(user?.id && configured)}
          compactMobile={useCompactMobileLibraryLayout}
        />

        {filtered.length > 0 ? (
          <div className="space-y-6">
            <div
              data-testid="library-results"
              data-layout={useXiaohongshuMobileMasonry ? "xhs-mobile-masonry" : "default"}
              className={cn(
                useXiaohongshuMobileMasonry
                  ? "columns-2 [column-gap:10px]"
                  : "grid items-stretch gap-3 md:grid-cols-2 md:gap-4"
              )}
            >
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className={cn(useXiaohongshuMobileMasonry ? "mb-3 break-inside-avoid" : "h-full")}
                >
                  <ContentCard
                    item={item}
                    source="library"
                    bookmarked={bookmarkedIds.includes(item.id)}
                    bookmarkLoading={bookmarkPendingId === item.id}
                    onToggleBookmark={() => void handleToggleBookmark(item.id)}
                    layoutVariant={useXiaohongshuMobileMasonry && item.platform === "Xiaohongshu" ? "xhs-mobile-note" : "default"}
                  />
                </div>
              ))}
            </div>

            {hasMore ? (
              <div className="flex justify-center">
                <Button
                  variant="secondary"
                  className="min-w-32 rounded-xl border border-slate-200 px-5 text-slate-700 shadow-sm"
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                >
                  {t("library.more")}
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center text-slate-500 shadow-soft">
            {keyword
              ? t("library.emptySearch", { query: keyword })
              : t("library.empty")}
            <div className="mt-4">
              <Button variant="secondary" onClick={clearAll}>{t("library.clear")}</Button>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<LibraryLoadingFallback />}>
      <LibraryPageContent />
    </Suspense>
  );
}

function LibraryLoadingFallback() {
  const { t } = useI18n();

  return <PageContainer>{t("library.loading")}</PageContainer>;
}
