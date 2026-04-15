"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contents } from "@/data/contents";
import { getAssessmentLevelBand, getDimensionLabel, getLocalizedAssessmentResult } from "@/lib/assessment";
import { readLocalPlanDraft } from "@/lib/appShell/localRouteState";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { formatLocalizedDateTime } from "@/lib/i18n/format";
import { getProfileMobilePreviewFixture } from "@/lib/mobilePreview/fixtures";
import { resolvePlanDayContract } from "@/lib/plan-core/dayContract";
import { buildPlanHref, normalizePlanDraftSnapshot, resolveSavedPlanHref } from "@/lib/plans";
import {
  getBookmarkedContentIds,
  getDiagnosisHistory,
  getLatestAssessmentResult,
  getSavedPlans,
  removeBookmark
} from "@/lib/userData";
import type { AssessmentResult } from "@/types/assessment";
import type { ContentItem } from "@/types/content";
import type { DiagnosisHistoryRow, SavedPlanRow, SavedPlanSource } from "@/types/userData";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { ProfileBookmarkShelf } from "@/components/profile/ProfileBookmarkShelf";
import { ProfileMetricStrip } from "@/components/profile/ProfileMetricStrip";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card className="space-y-3">
      <div className="h-5 w-28 animate-pulse rounded-full bg-slate-100" />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 animate-pulse rounded-full bg-slate-100" />
      ))}
    </Card>
  );
}

function EmptyState({
  title,
  description,
  href,
  actionLabel
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <Card className="space-y-3 px-5 py-4 sm:px-6 sm:py-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <Link href={href} className="pt-1">
        <Button variant="secondary">{actionLabel}</Button>
      </Link>
    </Card>
  );
}

function HistoryCard({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

export default function ProfilePage() {
  const { user, loading, configured } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { language, t } = useI18n();
  const [profilePreviewPreset, setProfilePreviewPreset] = useState<string | null>(null);
  const isProfilePreview = profilePreviewPreset === "profile-with-bookmarks";
  const previewFixture = useMemo(
    () => isProfilePreview ? getProfileMobilePreviewFixture(language) : null,
    [isProfilePreview, language]
  );
  const effectiveUser = previewFixture?.user ?? user;

  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);

  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistoryRow[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<ContentItem[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlanRow[]>([]);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [bookmarkPendingIds, setBookmarkPendingIds] = useState<string[]>([]);

  useEffect(() => {
    logEvent("profile.viewed", {}, { page: "/profile" });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const isMobilePreview = params.get("mobilePreview") === "1";
    setProfilePreviewPreset(isMobilePreview ? params.get("mobilePreviewPreset") : null);
  }, []);

  useEffect(() => {
    if (isProfilePreview && previewFixture) {
      setAssessmentResult(null);
      setDiagnosisHistory(previewFixture.diagnosisHistory);
      setBookmarkedItems(previewFixture.bookmarkedItems);
      setSavedPlans(previewFixture.savedPlans);
      setAssessmentLoading(false);
      setHistoryLoading(false);
      setBookmarksLoading(false);
      setPlansLoading(false);
      return;
    }

    if (loading || !user?.id || !configured) {
      setAssessmentLoading(false);
      setHistoryLoading(false);
      setBookmarksLoading(false);
      setPlansLoading(false);
      return;
    }

    let active = true;
    const userId = user.id;

    async function loadAssessment() {
      setAssessmentLoading(true);
      const response = await getLatestAssessmentResult(userId);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load assessment result", response.error);
      }

      setAssessmentResult(response.data);
      setAssessmentLoading(false);
    }

    async function loadHistory() {
      setHistoryLoading(true);
      const response = await getDiagnosisHistory(userId, 8);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load diagnosis history", response.error);
      }

      setDiagnosisHistory(response.data);
      setHistoryLoading(false);
    }

    async function loadBookmarks() {
      setBookmarksLoading(true);
      const response = await getBookmarkedContentIds(userId);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load bookmarks", response.error);
      }

      const items = response.data
        .map((id) => contents.find((item) => item.id === id))
        .filter((item): item is ContentItem => Boolean(item));

      setBookmarkedItems(items);
      setBookmarksLoading(false);
    }

    async function loadPlans() {
      setPlansLoading(true);
      const response = await getSavedPlans(userId, 8);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load saved plans", response.error);
      }

      setSavedPlans(response.data);
      setPlansLoading(false);
    }

    void loadAssessment();
    void loadHistory();
    void loadBookmarks();
    void loadPlans();

    return () => {
      active = false;
    };
  }, [configured, isProfilePreview, loading, previewFixture, user?.id]);

  const localizedAssessmentResult = useMemo(
    () => assessmentResult ? getLocalizedAssessmentResult(assessmentResult, language) : null,
    [assessmentResult, language]
  );

  const assessmentLevelBand = getAssessmentLevelBand(localizedAssessmentResult);
  const weakestSummary = useMemo(() => localizedAssessmentResult?.dimensionSummaries.slice(0, 3) ?? [], [localizedAssessmentResult]);
  const activePlan = savedPlans[0] ?? null;
  const olderPlans = savedPlans.slice(1);
  const latestDiagnosis = diagnosisHistory[0] ?? null;
  const olderDiagnoses = diagnosisHistory.slice(1);
  const localPlanDraft = useMemo(() => normalizePlanDraftSnapshot(readLocalPlanDraft()), []);
  const activePlanFirstDay = activePlan?.plan_data.days[0]
    ? resolvePlanDayContract(activePlan.plan_data.days[0], language)
    : null;

  const formatDateTime = (value: string) => formatLocalizedDateTime(value, language);

  const toPlanSourceLabel = (sourceType: SavedPlanSource) => {
    if (sourceType === "diagnosis") return t("profile.planSource.diagnosis");
    if (sourceType === "assessment") return t("profile.planSource.assessment");
    return t("profile.planSource.default");
  };

  const activePlanHref = activePlan
    ? resolveSavedPlanHref(activePlan)
    : localPlanDraft
      ? buildPlanHref({
          problemTag: localPlanDraft.problemTag,
          level: localPlanDraft.level,
          sourceType: localPlanDraft.sourceType,
          preferredContentIds: localPlanDraft.preferredContentIds,
          primaryNextStep: localPlanDraft.primaryNextStep,
          planContext: localPlanDraft.planContext,
          guidanceContext: localPlanDraft.guidanceContext,
          deepContext: localPlanDraft.deepContext
        })
      : latestDiagnosis
        ? `/diagnose?q=${encodeURIComponent(latestDiagnosis.input_text)}`
        : "/assessment";

  const continuePracticeHref = activePlanHref;

  const handleRemoveBookmarks = async (contentIds: string[]) => {
    if (isProfilePreview) {
      const uniqueIds = Array.from(new Set(contentIds));
      setBookmarkedItems((current) => current.filter((item) => !uniqueIds.includes(item.id)));
      setBookmarkPendingIds((current) => current.filter((id) => !uniqueIds.includes(id)));
      return;
    }

    if (!user?.id || !configured) {
      openLoginModal(t("profile.bookmarkManageLogin"), "bookmark");
      return;
    }

    const uniqueIds = Array.from(new Set(contentIds));
    setBookmarkPendingIds((current) => Array.from(new Set([...current, ...uniqueIds])));

    const failedIds = new Set<string>();

    for (const contentId of uniqueIds) {
      const response = await removeBookmark(user.id, contentId);

      if (response.error) {
        console.error("[profile] failed to remove bookmark", response.error);
        failedIds.add(contentId);
        continue;
      }

      logEvent("content.bookmark_toggled", { contentId, bookmarked: false }, { page: "/profile" });
    }

    setBookmarkedItems((current) => current.filter((item) => failedIds.has(item.id) || !uniqueIds.includes(item.id)));
    setBookmarkPendingIds((current) => current.filter((id) => !uniqueIds.includes(id)));
  };

  const metricItems = [
    {
      label: t("profile.metrics.activePlan"),
      value: activePlan ? activePlan.plan_data.title : t("profile.none"),
      hint: activePlan ? toPlanSourceLabel(activePlan.source_type) : undefined
    },
    {
      label: t("profile.metrics.latestDiagnosis"),
      value: latestDiagnosis?.problem_label ?? t("profile.none"),
      hint: latestDiagnosis ? formatDateTime(latestDiagnosis.created_at) : undefined
    },
    {
      label: t("profile.metrics.bookmarks"),
      value: String(bookmarkedItems.length),
      hint: t("profile.bookmarks.title")
    },
    {
      label: t("profile.metrics.savedPlans"),
      value: String(savedPlans.length),
      hint: assessmentLevelBand ? t("profile.levelBadge", { value: assessmentLevelBand }) : undefined
    }
  ];

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <SectionSkeleton lines={2} />
          <SectionSkeleton lines={4} />
          <SectionSkeleton lines={4} />
        </div>
      </PageContainer>
    );
  }

  if (!effectiveUser) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-2xl space-y-4">
          <PageBreadcrumbs items={[{ href: "/", label: t("profile.backHome") }]} />
          <Card className="space-y-4 px-5 py-5 text-center sm:px-6 sm:py-6">
            <div>
              <p className="text-sm font-semibold text-brand-700">{t("profile.title")}</p>
              <h1 className="mt-2 text-2xl font-black text-slate-900">{t("profile.loginTitle")}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {t("profile.loginSubtitle")}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={() => openLoginModal(t("profile.loginTitle"), "profile")}>{t("profile.loginButton")}</Button>
              <Link href="/"><Button variant="secondary">{t("plan.backHome")}</Button></Link>
            </div>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageBreadcrumbs items={[{ href: "/", label: t("profile.backHome") }]} />

        <div className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_45%,#eef6ff_100%)] p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-brand-700">{t("profile.title")}</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">{effectiveUser.email}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">{t("profile.headerSubtitle")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {assessmentLevelBand ? (
                <Badge className="h-fit">{t("profile.levelBadge", { value: assessmentLevelBand })}</Badge>
              ) : (
                <Badge className="h-fit bg-slate-100 text-slate-700">{t("profile.notAssessed")}</Badge>
              )}
              <Link href={continuePracticeHref}>
                <Button>{t("profile.cta.continuePractice")}</Button>
              </Link>
            </div>
          </div>
        </div>

        <ProfileMetricStrip items={metricItems} />

        <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("profile.activePlan.title")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("profile.activePlan.subtitle")}</p>
              </div>
              {activePlan ? (
                <Badge className="bg-slate-100 text-slate-700">{toPlanSourceLabel(activePlan.source_type)}</Badge>
              ) : null}
            </div>

            {plansLoading ? (
              <SectionSkeleton lines={3} />
            ) : activePlan ? (
              <div className="space-y-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{activePlan.plan_data.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{activePlan.plan_data.target}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(activePlan.created_at)}</p>
                </div>
                {activePlanFirstDay ? (
                  <div className="rounded-2xl border border-[var(--line)] bg-slate-50 px-4 py-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {t("plan.day.label", { day: activePlanFirstDay.day })} · {activePlanFirstDay.focus}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">{activePlanFirstDay.details?.goal ?? activePlanFirstDay.goal}</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{t("plan.day.dosage")}</p>
                        <p className="mt-1 text-sm text-slate-700">{activePlanFirstDay.details?.dosage ?? activePlanFirstDay.duration}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{t("plan.day.focusCues")}</p>
                        <p className="mt-1 text-sm text-slate-700">{activePlanFirstDay.details?.focusCues[0] ?? activePlanFirstDay.executionFocus ?? activePlanFirstDay.focus}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Link href={continuePracticeHref}><Button>{t("profile.cta.continuePractice")}</Button></Link>
                  <Link href="/plan"><Button variant="secondary">{t("profile.plans.toggleExpand")}</Button></Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">{t("profile.activePlan.emptyDescription")}</p>
                <Link href={continuePracticeHref}><Button>{t("profile.cta.continuePractice")}</Button></Link>
              </div>
            )}
          </Card>

          <Card className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t("profile.latestDiagnosis.title")}</h2>
              <p className="mt-1 text-sm text-slate-600">{t("profile.latestDiagnosis.subtitle")}</p>
            </div>

            {historyLoading ? (
              <SectionSkeleton lines={3} />
            ) : latestDiagnosis ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[var(--line)] bg-slate-50 px-4 py-4">
                  <p className="text-sm font-semibold text-slate-900">{latestDiagnosis.problem_label ?? t("profile.diagnosis.unmatched")}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{latestDiagnosis.input_text}</p>
                  <p className="mt-3 text-xs text-slate-500">{formatDateTime(latestDiagnosis.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/diagnose?q=${encodeURIComponent(latestDiagnosis.input_text)}`}>
                    <Button variant="secondary">{t("profile.latestDiagnosis.open")}</Button>
                  </Link>
                  <Link href="/diagnose"><Button>{t("profile.cta.continuePractice")}</Button></Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">{t("profile.latestDiagnosis.emptyDescription")}</p>
                <Link href="/diagnose"><Button>{t("profile.cta.continuePractice")}</Button></Link>
              </div>
            )}
          </Card>
        </div>

        {assessmentLoading ? (
          <SectionSkeleton lines={4} />
        ) : localizedAssessmentResult ? (
          <Card className="space-y-5 px-5 py-4 sm:px-6 sm:py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("profile.assessment.title")}</h2>
                <p className="mt-1 text-sm text-slate-600">{localizedAssessmentResult.profileVector?.summary.headline}</p>
              </div>
              <Badge>{t("profile.levelBadge", { value: assessmentLevelBand ?? "-" })}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {weakestSummary.map((dimension) => (
                <div key={dimension.key} className="rounded-2xl border border-[var(--line)] bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {getDimensionLabel(dimension.key, language)}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {dimension.score} / {dimension.maxScore}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/assessment"><Button variant="secondary">{t("assessment.result.retry")}</Button></Link>
              <Link href={`/library?level=${assessmentLevelBand ?? "3.5"}`}><Button variant="ghost">{t("profile.assessment.openLibrary")}</Button></Link>
            </div>
          </Card>
        ) : (
          <EmptyState
            title={t("profile.assessment.title")}
            description={t("profile.assessment.emptyDescription")}
            href="/assessment"
            actionLabel={t("plan.assessment")}
          />
        )}

        {bookmarksLoading ? (
          <SectionSkeleton lines={5} />
        ) : bookmarkedItems.length > 0 ? (
          <ProfileBookmarkShelf
            items={bookmarkedItems}
            pendingIds={bookmarkPendingIds}
            onRemoveOne={(contentId) => handleRemoveBookmarks([contentId])}
            onRemoveMany={handleRemoveBookmarks}
          />
        ) : (
          <EmptyState
            title={t("profile.bookmarks.title")}
            description={t("profile.bookmarks.emptyDescription")}
            href="/library"
            actionLabel={t("profile.bookmarks.link")}
          />
        )}

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{t("profile.records.title")}</h2>
            <p className="mt-1 text-sm text-slate-600">{t("profile.records.subtitle")}</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {historyLoading ? (
              <SectionSkeleton lines={4} />
            ) : olderDiagnoses.length > 0 ? (
              <HistoryCard title={t("profile.diagnosis.title")} subtitle={t("profile.diagnosis.subtitle")}>
                <div className="space-y-3">
                  {olderDiagnoses.map((item) => (
                    <Link
                      key={item.id}
                      href={`/diagnose?q=${encodeURIComponent(item.input_text)}`}
                      className="block rounded-xl border border-[var(--line)] px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                      onClick={() => logEvent("profile.history_item_opened", { itemType: "diagnosis", itemId: item.id }, { page: "/profile" })}
                    >
                      <p className="font-semibold text-slate-900">{item.input_text}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.problem_label ?? t("profile.diagnosis.unmatched")}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                    </Link>
                  ))}
                </div>
              </HistoryCard>
            ) : (
              <EmptyState
                title={t("profile.diagnosis.title")}
                description={t("profile.diagnosis.emptyDescription")}
                href="/diagnose"
                actionLabel={t("plan.diagnose")}
              />
            )}

            {plansLoading ? (
              <SectionSkeleton lines={4} />
            ) : olderPlans.length > 0 ? (
              <HistoryCard title={t("profile.plans.title")} subtitle={t("profile.plans.subtitle")}>
                <div className="space-y-3">
                  {olderPlans.map((item) => {
                    const expanded = expandedPlanId === item.id;

                    return (
                      <div key={item.id} className="rounded-xl border border-[var(--line)] p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">{item.plan_data.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{toPlanSourceLabel(item.source_type)}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                          </div>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              if (!expanded) {
                                logEvent("profile.section_opened", { section: "saved_plans" }, { page: "/profile" });
                                logEvent("profile.history_item_opened", { itemType: "plan", itemId: item.id }, { page: "/profile" });
                              }

                              setExpandedPlanId(expanded ? null : item.id);
                            }}
                          >
                            {expanded ? t("profile.plans.toggleCollapse") : t("profile.plans.toggleExpand")}
                          </Button>
                        </div>
                        {expanded ? (
                          <div className="mt-4 space-y-3">
                            {item.plan_data.days.map((day) => {
                              const resolvedDay = resolvePlanDayContract(day, language);

                              return (
                                <div key={resolvedDay.day} className="rounded-xl bg-slate-50 px-3 py-3">
                                  <p className="text-sm font-semibold text-slate-900">
                                    {t("plan.day.label", { day: resolvedDay.day })} · {resolvedDay.focus}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">{resolvedDay.details?.goal ?? resolvedDay.goal}</p>
                                  <p className="mt-2 text-xs text-slate-500">{resolvedDay.details?.dosage ?? resolvedDay.duration}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </HistoryCard>
            ) : (
              <EmptyState
                title={t("profile.plans.title")}
                description={t("profile.plans.emptyDescription")}
                href="/diagnose"
                actionLabel={t("profile.plans.generate")}
              />
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
