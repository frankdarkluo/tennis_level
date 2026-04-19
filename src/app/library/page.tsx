"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { shouldUseCompactMobileLibraryLayout, shouldUseMobileXiaohongshuMasonry } from "@/lib/library/layout";
import { buildLibraryItems, sortLibraryItems } from "@/lib/library/order";
import {
  isXiaohongshuCandidateReviewItem,
  isXiaohongshuCandidateReviewRequested,
  type XiaohongshuCandidateReviewData
} from "@/lib/library/xiaohongshuReviewItems";
import {
  readLocalXiaohongshuReviewBookmarkIds,
  toggleLocalXiaohongshuReviewBookmark
} from "@/lib/library/xiaohongshuReviewBookmarks";
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

function normalizeLibraryPlatformParam(value: string | null): LibraryPlatformFilter {
  return value === "Bilibili" || value === "YouTube" || value === "Xiaohongshu" ? value : "all";
}

function LibraryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [mergedXiaohongshuItems, setMergedXiaohongshuItems] = useState<(ReturnType<typeof buildLibraryItems>)>([]);
  const [, setMergedXiaohongshuSummary] = useState<XiaohongshuCandidateReviewData["summary"] | null>(null);
  const [reviewBookmarkedIds, setReviewBookmarkedIds] = useState<string[]>([]);
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
  const platformParam = searchParams.get("platform");
  const requestedXiaohongshuCandidateReview = isXiaohongshuCandidateReviewRequested(searchParams);
  const requestedXiaohongshuReviewMode = requestedXiaohongshuCandidateReview
    && normalizeLibraryPlatformParam(platformParam) === "Xiaohongshu";
  const showMergedXiaohongshuLibrary = selectedPlatform === "Xiaohongshu";

  useEffect(() => {
    setSelectedPlatform(normalizeLibraryPlatformParam(platformParam));
  }, [platformParam]);

  useEffect(() => {
    let active = true;

    async function loadReviewItems() {
      if (!showMergedXiaohongshuLibrary) {
        setMergedXiaohongshuItems([]);
        setMergedXiaohongshuSummary(null);
        return;
      }

      const module = await import("@/lib/library/xiaohongshuReviewItems");

      if (!active) {
        return;
      }

      const mergedData = module.loadMergedXiaohongshuLibraryData();
      setMergedXiaohongshuItems(mergedData.items);
      setMergedXiaohongshuSummary(mergedData.summary);
    }

    void loadReviewItems();

    return () => {
      active = false;
    };
  }, [showMergedXiaohongshuLibrary]);

  useEffect(() => {
    if (!showMergedXiaohongshuLibrary) {
      setReviewBookmarkedIds([]);
      return;
    }

    setReviewBookmarkedIds(readLocalXiaohongshuReviewBookmarkIds());
  }, [showMergedXiaohongshuLibrary]);

  useEffect(() => {
    if (requestedXiaohongshuReviewMode) {
      setGateState("ready");
      return;
    }

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
  }, [configured, loading, requestedXiaohongshuReviewMode, router, user?.id]);

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
  }, [keyword, mergedXiaohongshuItems.length, selectedContentLanguage, selectedPlatform, selectedSubtitleAvailability, showBookmarkedOnly]);
  const effectiveBookmarkedIds = useMemo(
    () => showMergedXiaohongshuLibrary
      ? Array.from(new Set([...bookmarkedIds, ...reviewBookmarkedIds]))
      : bookmarkedIds,
    [bookmarkedIds, reviewBookmarkedIds, showMergedXiaohongshuLibrary]
  );

  const filtered = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    const sourceItems = showMergedXiaohongshuLibrary
      ? mergedXiaohongshuItems
      : libraryItems;

    const matchedItems = sourceItems.filter((item) => {
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
      const hitBookmark = showBookmarkedOnly ? effectiveBookmarkedIds.includes(item.id) : true;
      return hitKeyword && hitPlatform && hitContentLanguage && hitSubtitle && hitBookmark;
    });

    const runtimeMatched = matchedItems.filter((item) => !isXiaohongshuCandidateReviewItem(item));
    const reviewMatched = matchedItems.filter((item) => isXiaohongshuCandidateReviewItem(item));
    const runtimeWithThumbnail = sortLibraryItems(
      runtimeMatched.filter((item) => Boolean(getThumbnail(item))),
      `${productSeed}:with-thumb`
    );
    const runtimeWithoutThumbnail = sortLibraryItems(
      runtimeMatched.filter((item) => !getThumbnail(item)),
      `${productSeed}:no-thumb`
    );
    const reviewWithThumbnail = reviewMatched.filter((item) => Boolean(getThumbnail(item)));
    const reviewWithoutThumbnail = reviewMatched.filter((item) => !getThumbnail(item));

    return [...runtimeWithThumbnail, ...runtimeWithoutThumbnail, ...reviewWithThumbnail, ...reviewWithoutThumbnail];
  }, [
    effectiveBookmarkedIds,
    creatorNameById,
    keyword,
    libraryItems,
    mergedXiaohongshuItems,
    productSeed,
    selectedContentLanguage,
    selectedPlatform,
    selectedSubtitleAvailability,
    showBookmarkedOnly,
    showMergedXiaohongshuLibrary
  ]);
  const visibleItems = useMemo(
    () => (showMergedXiaohongshuLibrary ? filtered : filtered.slice(0, visibleCount)),
    [filtered, showMergedXiaohongshuLibrary, visibleCount]
  );
  const xiaohongshuColumns = useMemo(() => {
    const leftColumn: typeof visibleItems = [];
    const rightColumn: typeof visibleItems = [];

    visibleItems.forEach((item, index) => {
      (index % 2 === 0 ? leftColumn : rightColumn).push(item);
    });

    return [leftColumn, rightColumn] as const;
  }, [visibleItems]);
  const hasMore = !showMergedXiaohongshuLibrary && visibleItems.length < filtered.length;
  const isMobilePreview = searchParams.get("mobilePreview") === "1";
  const useCompactMobileLibraryLayout = shouldUseCompactMobileLibraryLayout({
    viewportWidth,
    forceMobilePreview: isMobilePreview
  });
  const useXiaohongshuMobileMasonry = shouldUseMobileXiaohongshuMasonry({
    selectedPlatform,
    viewportWidth,
    forceMobilePreview: isMobilePreview
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
    if (contentId.startsWith("review_xhs_candidate_")) {
      const next = toggleLocalXiaohongshuReviewBookmark(contentId);
      setReviewBookmarkedIds(next);
      logEvent("content.bookmark_toggled", {
        contentId,
        bookmarked: next.includes(contentId)
      }, { page: "/library" });
      return;
    }

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

  function renderLibraryCard(item: (typeof visibleItems)[number]) {
    return (
      <ContentCard
        key={item.id}
        item={item}
        source="library"
        bookmarked={effectiveBookmarkedIds.includes(item.id)}
        bookmarkLoading={!isXiaohongshuCandidateReviewItem(item) && bookmarkPendingId === item.id}
        onToggleBookmark={() => void handleToggleBookmark(item.id)}
        layoutVariant={useXiaohongshuMobileMasonry && item.platform === "Xiaohongshu" ? "xhs-mobile-note" : "default"}
      />
    );
  }

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
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700/75">Library</p>
              <h1 className="mt-1 text-[1.75rem] font-black leading-none text-slate-900">{t("library.title")}</h1>
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
          bookmarkFilterEnabled={Boolean((user?.id && configured) || showMergedXiaohongshuLibrary)}
          compactMobile={useCompactMobileLibraryLayout}
        />

        {filtered.length > 0 ? (
          <div className="space-y-6">
            {useXiaohongshuMobileMasonry ? (
              <div
                data-testid="library-results"
                data-layout="xhs-mobile-masonry"
                className="grid grid-cols-2 items-start gap-[10px]"
              >
                {xiaohongshuColumns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col gap-3">
                    {column.map((item) => renderLibraryCard(item))}
                  </div>
                ))}
              </div>
            ) : (
              <div
                data-testid="library-results"
                data-layout="default"
                className="grid items-stretch gap-3 md:grid-cols-2 md:gap-4"
              >
                {visibleItems.map((item) => (
                  <div key={item.id} className="h-full">
                    {renderLibraryCard(item)}
                  </div>
                ))}
              </div>
            )}

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
