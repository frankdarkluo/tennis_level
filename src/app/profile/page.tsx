"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contents } from "@/data/contents";
import {
  hasCompletedAssessmentResult,
  readAssessmentDraftFromStorage,
  readAssessmentResultFromStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { formatLocalizedDateTime } from "@/lib/i18n/format";
import { readLocalStudyArtifacts, readLocalStudyBookmarks, readLocalStudyProgress } from "@/lib/study/localData";
import { VIDEO_DIAGNOSE_VISIBLE } from "@/lib/videoDiagnose";
import {
  getBookmarkedContentIds,
  getDiagnosisHistory,
  getLatestAssessmentResult,
  getSavedPlans,
  getVideoDiagnosisHistory,
  removeBookmark
} from "@/lib/userData";
import { AssessmentResult } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import { DiagnosisHistoryRow, SavedPlanRow, VideoDiagnosisHistoryRow } from "@/types/userData";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useStudy } from "@/components/study/StudyProvider";
import { ContentCard } from "@/components/library/ContentCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StudyArtifactRecord, StudyProgressState } from "@/types/study";

const studyLanguageLabelKey = {
  zh: "profile.studyLanguageValue.zh",
  en: "profile.studyLanguageValue.en"
} as const;

const studyArtifactLabelKey = {
  study_background: "profile.studyArtifact.study_background",
  assessment: "profile.studyArtifact.assessment",
  diagnosis: "profile.studyArtifact.diagnosis",
  video_diagnosis: "profile.studyArtifact.video_diagnosis",
  plan: "profile.studyArtifact.plan",
  survey: "profile.studyArtifact.survey",
  study_resume: "profile.studyArtifact.study_resume"
} as const;

function deriveStudyResumeAction(studyProgress: StudyProgressState | null) {
  const path = studyProgress?.lastVisitedPath;

  if (!path) {
    return null;
  }

  if (path.startsWith("/diagnose")) {
    return {
      href: path,
      itemType: "diagnosis",
      labelKey: "profile.studyResumeDiagnosis" as const
    };
  }

  if (path.startsWith("/plan")) {
    return {
      href: path,
      itemType: "plan",
      labelKey: "profile.studyResumePlan" as const
    };
  }

  if (path.startsWith("/assessment/result")) {
    return {
      href: path,
      itemType: "assessment",
      labelKey: "profile.studyContinueAssessment" as const
    };
  }

  if (path.startsWith("/assessment")) {
    return {
      href: path,
      itemType: "assessment_draft",
      labelKey: "profile.studyContinueAssessmentDraft" as const
    };
  }

  return {
    href: path,
    itemType: "study_resume",
    labelKey: "profile.studyResume" as const
  };
}

function deriveStudyDiagnosisAction(studyProgress: StudyProgressState | null) {
  const diagnosisPath = studyProgress?.lastDiagnosisPath;

  if (diagnosisPath) {
    return {
      href: diagnosisPath,
      itemType: "diagnosis",
      labelKey: "profile.studyResumeDiagnosis" as const,
      title: studyProgress?.lastDiagnosisTitle ?? diagnosisPath
    };
  }

  if (studyProgress?.lastVisitedPath?.startsWith("/diagnose")) {
    return {
      href: studyProgress.lastVisitedPath,
      itemType: "diagnosis",
      labelKey: "profile.studyResumeDiagnosis" as const,
      title: studyProgress?.lastDiagnosisTitle ?? studyProgress.lastVisitedPath
    };
  }

  return null;
}

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
    <Card className="space-y-3">
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

function QuickContinueCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="space-y-3 border-slate-200 bg-slate-50/60 shadow-none">
      <div>
        <h2 className="text-base font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </Card>
  );
}

export default function ProfilePage() {
  const { user, loading, configured } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { session, studyMode } = useStudy();
  const { language, t } = useI18n();

  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [videoHistoryLoading, setVideoHistoryLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);

  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistoryRow[]>([]);
  const [videoDiagnosisHistory, setVideoDiagnosisHistory] = useState<VideoDiagnosisHistoryRow[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<ContentItem[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlanRow[]>([]);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [bookmarkPendingId, setBookmarkPendingId] = useState<string | null>(null);
  const [studyArtifacts, setStudyArtifacts] = useState<StudyArtifactRecord[]>([]);
  const [studyBookmarkIds, setStudyBookmarkIds] = useState<string[]>([]);
  const [studyProgress, setStudyProgress] = useState<StudyProgressState | null>(null);
  const [studyAssessmentDraftStep, setStudyAssessmentDraftStep] = useState<number | null>(null);

  useEffect(() => {
    logEvent("profile.viewed", {}, { page: "/profile" });
  }, []);

  useEffect(() => {
    if (!studyMode) {
      return;
    }

    setStudyArtifacts(readLocalStudyArtifacts());
    setStudyBookmarkIds(readLocalStudyBookmarks().contentIds);
    setStudyProgress(readLocalStudyProgress());
    setStudyAssessmentDraftStep(readAssessmentDraftFromStorage()?.stepIndex ?? null);
  }, [studyMode, session?.sessionId]);

  useEffect(() => {
    if (loading || !user?.id || !configured) {
      setAssessmentLoading(false);
      setHistoryLoading(false);
      setVideoHistoryLoading(false);
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
      const response = await getDiagnosisHistory(userId, 5);

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

    async function loadVideoHistory() {
      if (!VIDEO_DIAGNOSE_VISIBLE) {
        setVideoDiagnosisHistory([]);
        setVideoHistoryLoading(false);
        return;
      }

      setVideoHistoryLoading(true);
      const response = await getVideoDiagnosisHistory(userId, 5);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load video diagnosis history", response.error);
      }

      setVideoDiagnosisHistory(response.data);
      setVideoHistoryLoading(false);
    }

    async function loadPlans() {
      setPlansLoading(true);
      const response = await getSavedPlans(userId, 10);

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
    void loadVideoHistory();
    void loadBookmarks();
    void loadPlans();

    return () => {
      active = false;
    };
  }, [configured, loading, user?.id]);

  const weakestSummary = useMemo(() => {
    if (!assessmentResult?.dimensions.length) {
      return [];
    }

    return [...assessmentResult.dimensions]
      .filter((dimension) => dimension.answeredCount > 0)
      .sort((a, b) => a.average - b.average)
      .slice(0, 3);
  }, [assessmentResult]);

  const latestSavedPlan = savedPlans[0] ?? null;
  const latestDiagnosis = diagnosisHistory[0] ?? null;

  const formatDateTime = (value: string) => formatLocalizedDateTime(value, language);

  const toPlanSourceLabel = (sourceType: SavedPlanRow["source_type"]) => {
    if (sourceType === "diagnosis") return t("profile.planSource.diagnosis");
    if (sourceType === "assessment") return t("profile.planSource.assessment");
    return t("profile.planSource.default");
  };

  const handleRemoveBookmark = async (contentId: string) => {
    if (!user?.id || !configured) {
      openLoginModal(t("profile.bookmarkManageLogin"), "bookmark");
      return;
    }

    setBookmarkPendingId(contentId);
    const response = await removeBookmark(user.id, contentId);

    if (response.error) {
      console.error("[profile] failed to remove bookmark", response.error);
      setBookmarkPendingId(null);
      return;
    }

    setBookmarkedItems((prev) => prev.filter((item) => item.id !== contentId));
    logEvent("content.bookmark_toggled", { contentId, bookmarked: false }, { page: "/profile" });
    setBookmarkPendingId(null);
  };

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

  if (studyMode && session) {
    const hasCompletedLocalAssessment = hasCompletedAssessmentResult(readAssessmentResultFromStorage());
    const artifactSummary = studyArtifacts.reduce<Record<string, number>>((acc, artifact) => {
      acc[artifact.artifactType] = (acc[artifact.artifactType] ?? 0) + 1;
      return acc;
    }, {});
    const activeAssessmentDraftStep = studyProgress?.assessmentDraftInProgress
      ? (studyProgress.assessmentDraftStepIndex ?? studyAssessmentDraftStep ?? 0)
      : null;
    const hasActiveAssessmentDraft = activeAssessmentDraftStep !== null && !hasCompletedLocalAssessment;
    const resumeAction = deriveStudyResumeAction(studyProgress);
    const diagnosisAction = deriveStudyDiagnosisAction(studyProgress);
    const planAlreadyCoveredByResume = Boolean(
      resumeAction?.itemType === "plan" && studyProgress?.lastPlanHref && resumeAction.href === studyProgress.lastPlanHref
    );
    const assessmentAlreadyCoveredByResume = Boolean(
      (resumeAction?.itemType === "assessment" || resumeAction?.itemType === "assessment_draft")
      && studyProgress?.lastAssessmentPath
      && resumeAction.href === studyProgress.lastAssessmentPath
    );

    return (
      <PageContainer>
        <div className="space-y-5">
          <PageBreadcrumbs items={[{ href: "/", label: t("profile.backHome") }]} />
          <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <p className="text-sm font-semibold text-brand-700">{t("profile.studyBadge")}</p>
                <h1 className="mt-1 text-2xl font-black text-slate-900">{t("profile.studySession")}</h1>
              </div>
              <Badge className="h-fit">{t(studyLanguageLabelKey[session.language])}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600">{t("profile.studySubtitle")}</p>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("profile.studyParticipant")}</p>
                  <p className="mt-1 text-sm text-slate-600">{session.participantId}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("profile.studySessionId")}</p>
                  <p className="mt-1 break-all text-sm text-slate-600">{session.sessionId}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("profile.studySnapshot")}</p>
                  <p className="mt-1 text-sm text-slate-600">{session.snapshotId}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("profile.studyBuild")}</p>
                  <p className="mt-1 text-sm text-slate-600">{session.buildVersion}</p>
                </div>
              </div>
            </Card>

            <Card className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">{t("profile.studyArtifacts")}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{studyArtifacts.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">{t("profile.studyBookmarks")}</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{studyBookmarkIds.length}</p>
                </div>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-500">{t("profile.studyLast")}</p>
                  <p className="mt-1 truncate text-sm font-medium text-slate-900">{studyProgress?.lastVisitedPath ?? "/"}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Card className="space-y-3 border-slate-200 bg-slate-50/60 shadow-none">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{t("profile.studyQuickContinue")}</h2>
                    <p className="mt-1 text-sm text-slate-600">{t("profile.studyQuickContinueHint")}</p>
                  </div>
                  {hasCompletedLocalAssessment && studyProgress?.lastAssessmentPath ? (
                    <Link
                      href={studyProgress.lastAssessmentPath}
                      onClick={() => logEvent("profile.history_item_opened", { itemType: "assessment", itemId: studyProgress.lastAssessmentPath }, { page: "/profile" })}
                    >
                      <Button>{t("profile.studyContinueAssessment")}</Button>
                    </Link>
                  ) : hasActiveAssessmentDraft ? (
                    <Link
                      href="/assessment"
                      onClick={() => logEvent("profile.history_item_opened", { itemType: "assessment_draft", itemId: "/assessment" }, { page: "/profile" })}
                    >
                      <Button>{t("profile.studyContinueAssessmentDraft")}</Button>
                    </Link>
                  ) : resumeAction ? (
                    <Link
                      href={resumeAction.href}
                      onClick={() => logEvent("profile.history_item_opened", { itemType: resumeAction.itemType, itemId: resumeAction.href }, { page: "/profile" })}
                    >
                      <Button>{t(resumeAction.labelKey)}</Button>
                    </Link>
                  ) : (
                    <p className="text-sm text-slate-500">{t("profile.studyQuickEmpty")}</p>
                  )}
                </Card>

                <Card className="space-y-3 border-slate-200 bg-slate-50/60 shadow-none">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{t("profile.studyQuickPlan")}</h2>
                    <p className="mt-1 text-sm text-slate-600">{t("profile.studyQuickPlanHint")}</p>
                  </div>
                  {studyProgress?.lastPlanHref && !planAlreadyCoveredByResume ? (
                    <Link
                      href={studyProgress.lastPlanHref}
                      onClick={() => logEvent("profile.history_item_opened", { itemType: "plan", itemId: studyProgress.lastPlanHref }, { page: "/profile" })}
                    >
                      <Button variant="secondary">{t("profile.studyContinuePlan")}</Button>
                    </Link>
                  ) : studyProgress?.lastPlanHref ? (
                    <Link
                      href={studyProgress.lastPlanHref}
                      onClick={() => logEvent("profile.history_item_opened", { itemType: "plan", itemId: studyProgress.lastPlanHref }, { page: "/profile" })}
                    >
                      <Button variant="secondary">{t("profile.studyContinuePlan")}</Button>
                    </Link>
                  ) : (
                    <p className="text-sm text-slate-500">{t("profile.studyQuickEmpty")}</p>
                  )}
                </Card>

                <Card className="space-y-3 border-slate-200 bg-slate-50/60 shadow-none">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{t("profile.studyQuickDiagnosis")}</h2>
                    <p className="mt-1 text-sm text-slate-600">{t("profile.studyQuickDiagnosisHint")}</p>
                  </div>
                  {diagnosisAction ? (
                    <Link
                      href={diagnosisAction.href}
                      onClick={() => logEvent("profile.history_item_opened", { itemType: diagnosisAction.itemType, itemId: diagnosisAction.href }, { page: "/profile" })}
                    >
                      <Button variant="secondary">{t(diagnosisAction.labelKey)}</Button>
                    </Link>
                  ) : (
                    <p className="text-sm text-slate-500">{t("profile.studyQuickEmpty")}</p>
                  )}
                </Card>
              </div>

              <div className="flex flex-wrap gap-2">
                {!hasActiveAssessmentDraft && studyProgress?.lastAssessmentPath && !assessmentAlreadyCoveredByResume ? (
                  <Link
                    href={studyProgress.lastAssessmentPath}
                    onClick={() => logEvent("profile.history_item_opened", { itemType: "assessment", itemId: studyProgress.lastAssessmentPath }, { page: "/profile" })}
                  >
                    <Button variant="secondary">{t("profile.studyContinueAssessment")}</Button>
                  </Link>
                ) : null}
                <Link href="/study/end">
                  <Button variant="ghost">{t("profile.studyEnd")}</Button>
                </Link>
              </div>
            </Card>

            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("profile.studyArtifacts")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("profile.studySubtitle")}</p>
              </div>
              <div className="space-y-2">
                {(["study_background", "assessment", "diagnosis", "video_diagnosis", "plan", "survey", "study_resume"] as const).map((type) => (
                  <div key={type} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-sm font-medium text-slate-700">{t(studyArtifactLabelKey[type])}</span>
                    <span className="text-sm font-semibold text-slate-900">{artifactSummary[type] ?? 0}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("profile.studyContinuePlan")}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  {studyProgress?.lastPlanTitle ?? t("profile.studyNoPlan")}
                </p>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                {hasActiveAssessmentDraft ? (
                  <p>{t("profile.studyAssessmentDraftStatus", { value: (activeAssessmentDraftStep ?? 0) + 1 })}</p>
                ) : (
                  <p>{studyProgress?.lastAssessmentLevel ? `${t("assessment.result.headline")} ${studyProgress.lastAssessmentLevel}` : t("profile.studyNoAssessment")}</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4 text-center">
          <PageBreadcrumbs items={[{ href: "/", label: t("profile.backHome") }]} />
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
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[{ href: "/", label: t("profile.backHome") }]} />
        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-brand-700">{t("profile.title")}</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">{user.email}</h1>
            </div>
            {assessmentResult?.level ? (
              <Badge className="h-fit">{t("profile.levelBadge", { value: assessmentResult.level })}</Badge>
            ) : (
              <Badge className="h-fit bg-slate-100 text-slate-700">{t("profile.notAssessed")}</Badge>
            )}
          </div>
          <p className="mt-3 text-sm text-slate-600">{t("profile.headerSubtitle")}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <QuickContinueCard
            title={t("profile.studyQuickContinue")}
            description={t("profile.studyQuickContinueHint")}
          >
            {assessmentResult?.level ? (
              <Link href={`/library?level=${assessmentResult.level}`}>
                <Button>{t("profile.assessment.openLibrary")}</Button>
              </Link>
            ) : (
              <p className="text-sm text-slate-500">{t("profile.studyQuickEmpty")}</p>
            )}
          </QuickContinueCard>

          <QuickContinueCard
            title={t("profile.studyQuickPlan")}
            description={t("profile.studyQuickPlanHint")}
          >
            {latestSavedPlan ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  logEvent("profile.section_opened", { section: "saved_plans" }, { page: "/profile" });
                  logEvent("profile.history_item_opened", { itemType: "plan", itemId: latestSavedPlan.id }, { page: "/profile" });
                  setExpandedPlanId((current) => current === latestSavedPlan.id ? null : latestSavedPlan.id);
                }}
              >
                {t("profile.plans.toggleExpand")}
              </Button>
            ) : (
              <p className="text-sm text-slate-500">{t("profile.studyQuickEmpty")}</p>
            )}
          </QuickContinueCard>

          <QuickContinueCard
            title={t("profile.studyQuickDiagnosis")}
            description={t("profile.studyQuickDiagnosisHint")}
          >
            {latestDiagnosis ? (
              <Link
                href={`/diagnose?q=${encodeURIComponent(latestDiagnosis.input_text)}`}
                onClick={() => logEvent("profile.history_item_opened", { itemType: "diagnosis", itemId: latestDiagnosis.id }, { page: "/profile" })}
              >
                <Button variant="secondary">{latestDiagnosis.input_text}</Button>
              </Link>
            ) : (
              <p className="text-sm text-slate-500">{t("profile.studyQuickEmpty")}</p>
            )}
          </QuickContinueCard>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {assessmentLoading ? (
            <SectionSkeleton lines={4} />
          ) : assessmentResult ? (
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t("profile.assessment.title")}</h2>
                  <p className="mt-1 text-sm text-slate-600">{assessmentResult.summary}</p>
                </div>
                <Badge>{t("profile.levelBadge", { value: assessmentResult.level })}</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("profile.assessment.strong")}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {assessmentResult.strengths.length > 0 ? assessmentResult.strengths.join(" / ") : t("profile.none")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t("profile.assessment.weak")}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {assessmentResult.weaknesses.length > 0 ? assessmentResult.weaknesses.join(" / ") : t("profile.none")}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {weakestSummary.map((dimension) => (
                  <div key={dimension.key} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs font-medium text-slate-500">{dimension.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {dimension.score} / {dimension.maxScore}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/assessment"><Button variant="secondary">{t("assessment.result.retry")}</Button></Link>
                <Link href={`/library?level=${assessmentResult.level}`}><Button variant="ghost">{t("profile.assessment.openLibrary")}</Button></Link>
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

          {historyLoading ? (
            <SectionSkeleton lines={5} />
          ) : diagnosisHistory.length > 0 ? (
            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("profile.diagnosis.title")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("profile.diagnosis.subtitle")}</p>
              </div>
              <div className="space-y-3">
                {diagnosisHistory.map((item) => (
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
            </Card>
          ) : (
            <EmptyState
              title={t("profile.diagnosis.title")}
              description={t("profile.diagnosis.emptyDescription")}
              href="/diagnose"
              actionLabel={t("plan.diagnose")}
            />
          )}

          {VIDEO_DIAGNOSE_VISIBLE ? (
            videoHistoryLoading ? (
              <SectionSkeleton lines={5} />
            ) : videoDiagnosisHistory.length > 0 ? (
              <Card className="space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t("profile.videoHistory.title")}</h2>
                  <p className="mt-1 text-sm text-slate-600">{t("profile.videoHistory.subtitle")}</p>
                </div>
                <div className="space-y-3">
                  {videoDiagnosisHistory.map((item) => (
                    <Link
                      key={item.id}
                      href="/video-diagnose"
                      className="block rounded-xl border border-[var(--line)] px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{item.result.primaryProblem.label}</p>
                        <Badge className="bg-slate-100 text-slate-700">
                          {t("profile.videoHistory.confidence", { value: item.result.confidenceBand })}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.user_description || t("profile.videoHistory.noDescription")}</p>
                      <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                    </Link>
                  ))}
                </div>
              </Card>
            ) : (
              <EmptyState
                title={t("profile.videoHistory.title")}
                description={t("profile.videoHistory.emptyDescription")}
                href="/video-diagnose"
                actionLabel={t("profile.videoHistory.try")}
              />
            )
          ) : null}

          {bookmarksLoading ? (
            <SectionSkeleton lines={5} />
          ) : bookmarkedItems.length > 0 ? (
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{t("profile.bookmarks.title")}</h2>
                  <p className="mt-1 text-sm text-slate-600">{t("profile.bookmarks.subtitle")}</p>
                </div>
                <Link href="/library" className="text-sm font-medium text-slate-500 transition hover:text-slate-700">
                  {t("profile.bookmarks.link")} →
                </Link>
              </div>
              <div className="space-y-4">
                {bookmarkedItems.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    source="profile"
                    bookmarked
                    bookmarkLoading={bookmarkPendingId === item.id}
                    onToggleBookmark={() => void handleRemoveBookmark(item.id)}
                  />
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState
              title={t("profile.bookmarks.title")}
              description={t("profile.bookmarks.emptyDescription")}
              href="/library"
              actionLabel={t("profile.bookmarks.link")}
            />
          )}

          {plansLoading ? (
            <SectionSkeleton lines={5} />
          ) : savedPlans.length > 0 ? (
            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{t("profile.plans.title")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("profile.plans.subtitle")}</p>
              </div>
              <div className="space-y-3">
                {savedPlans.map((item) => {
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
                          {item.plan_data.days.map((day) => (
                            <div key={day.day} className="rounded-xl bg-slate-50 px-3 py-3">
                              <p className="text-sm font-semibold text-slate-900">{t("plan.day.label", { day: day.day })} · {day.focus}</p>
                              <p className="mt-1 text-sm text-slate-600">
                                <span className="font-medium text-slate-700">{t("plan.day.duration")}</span> {day.duration}
                              </p>
                              <p className="mt-1 text-sm text-slate-600">
                                <span className="font-medium text-slate-700">{t("profile.planDrills")}</span> {day.drills.join(" / ")}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
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
    </PageContainer>
  );
}
