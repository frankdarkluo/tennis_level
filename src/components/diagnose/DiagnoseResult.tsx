"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RecommendationSummary } from "@/components/content/RecommendationSummary";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getContentFocusLine,
  getContentLanguageTag,
  getContentPrimaryTitle,
  getContentSecondaryTitle,
  getSubtitleAvailability,
  getSubtitleAvailabilityTranslationKey
} from "@/lib/content/display";
import {
  buildDeepDiagnosisEvidenceSummary,
  buildEnrichedSceneRecap,
  buildEnrichedSpecificityReasons
} from "@/lib/diagnose/enrichedContext";
import { getPreferredOutboundUrl } from "@/lib/content/outbound";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getDiagnosisConfidenceLabel } from "@/lib/diagnosis";
import { buildDiagnosisPlanCandidateIds, buildDiagnosisPlanContext, buildPlanHref } from "@/lib/plans";
import { getThumbnail } from "@/lib/thumbnail";
import { VIDEO_DIAGNOSE_VISIBLE } from "@/lib/videoDiagnose";
import { PlanLevel } from "@/types/plan";
import { Badge } from "@/components/ui/Badge";

function getNarrowingSeverityRank(severity: "high" | "medium" | "low"): number {
  if (severity === "high") {
    return 3;
  }

  if (severity === "medium") {
    return 2;
  }

  return 1;
}

function getMissingSlotLabel(slot: "stroke" | "outcome" | "context" | "condition", language: "zh" | "en") {
  if (language === "en") {
    if (slot === "stroke") return "stroke";
    if (slot === "outcome") return "miss outcome";
    if (slot === "context") return "match context";
    return "condition";
  }

  if (slot === "stroke") return "技术环节";
  if (slot === "outcome") return "失误结果";
  if (slot === "context") return "场景";
  return "条件";
}

function getEvidenceToneViewModel(
  result: DiagnosisResultType,
  language: "zh" | "en"
): {
  wrapperClassName: string;
  titleClassName: string;
  title: string;
  description: string;
} {
  const confidenceLabel = getDiagnosisConfidenceLabel(result.confidence, language);

  if (result.evidenceLevel === "low") {
    return {
      wrapperClassName: "rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-slate-700",
      titleClassName: "font-semibold text-amber-900",
      title: language === "en" ? "Evidence: low" : "当前证据：较低",
      description: language === "en"
        ? `Confidence: ${confidenceLabel}. Add one concrete clue first, then we can give a tighter technical direction.`
        : `置信表达：${confidenceLabel}。先补一条关键线索，再进入更明确的技术建议。`
    };
  }

  if (result.evidenceLevel === "medium") {
    return {
      wrapperClassName: "rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-sm text-slate-700",
      titleClassName: "font-semibold text-sky-900",
      title: language === "en" ? "Evidence: medium" : "当前证据：中等",
      description: language === "en"
        ? `Confidence: ${confidenceLabel}. Execute the primary next step first, then refine with feedback.`
        : `置信表达：${confidenceLabel}。先按主动作执行，再根据反馈微调。`
    };
  }

  return {
    wrapperClassName: "rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-sm text-slate-700",
    titleClassName: "font-semibold text-emerald-900",
    title: language === "en" ? "Evidence: high" : "当前证据：较高",
    description: language === "en"
      ? `Confidence: ${confidenceLabel}. Run the primary action now and validate with one measurable result.`
      : `置信表达：${confidenceLabel}。优先完成主动作，并用一个结果指标做验收。`
  };
}

function normalizePlanLevel(level?: string): PlanLevel {
  if (level === "2.5" || level === "3.0" || level === "3.5" || level === "4.0" || level === "4.0+") {
    return level;
  }

  if (level === "4.5") {
    return "4.0+";
  }

  return "3.0";
}

function RecommendationCard({
  item,
  source,
  layer,
  problemTag
}: {
  item: DiagnosisResultType["recommendedContents"][number];
  source: "diagnosis_featured" | "diagnosis_more";
  layer: 2 | 3;
  problemTag: string;
}) {
  const { language, t } = useI18n();
  const thumbnail = getThumbnail(item);
  const primaryTitle = getContentPrimaryTitle(item, language);
  const secondaryTitle = getContentSecondaryTitle(item, language);
  const targetLabel = getContentFocusLine(item, language);
  const contentLanguage = getContentLanguageTag(item);
  const subtitleAvailability = getSubtitleAvailability(item);
  const subtitleLabel = t(getSubtitleAvailabilityTranslationKey(subtitleAvailability));

  return (
    <div className="rounded-xl border border-[var(--line)] p-4 text-sm">
      <div className="flex gap-3">
        <VideoThumbnail thumbnail={thumbnail} title={primaryTitle} platform={item.platform} duration={item.duration} />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge className="bg-slate-100 px-4 py-1.5 text-sm font-semibold leading-none text-slate-700">
              {contentLanguage === "zh" ? t("content.lang.zh") : t("content.lang.en")}
            </Badge>
            <Badge className="bg-slate-100 px-4 py-1.5 text-sm font-semibold leading-none text-slate-700">
              {subtitleLabel}
            </Badge>
          </div>
          <p className="font-semibold text-slate-900">{primaryTitle}</p>
          {secondaryTitle ? (
            <div className="mt-1 space-y-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {t("content.secondaryTitle")}
              </p>
              <p className="text-xs leading-5 text-slate-400">{secondaryTitle}</p>
            </div>
          ) : null}
          {targetLabel && targetLabel !== primaryTitle ? (
            <p className="mt-1 text-sm text-slate-600">{t("content.targetPrefix")} {targetLabel}</p>
          ) : null}
          <RecommendationSummary item={item} className="mt-2" />
        </div>
      </div>
      <div className="mt-3">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            logEvent("diagnose.recommended_content_clicked", {
              problemTag,
              contentId: item.id,
              platform: item.platform,
              layer
            }, { page: "/diagnose" });
            logEvent("content.outbound_clicked", {
              contentId: item.id,
              platform: item.platform,
              sourceContext: source
            }, { page: "/diagnose" });

            const outbound = getPreferredOutboundUrl(item, {
              userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent
            });

            if (outbound.href !== item.url && typeof window !== "undefined") {
              event.preventDefault();
              window.location.assign(outbound.href);
            }
          }}
        >
          <Button variant="secondary">{t("content.open")}</Button>
        </a>
      </div>
    </div>
  );
}

export function DiagnoseResult({
  result,
  onResumeDeepMode
}: {
  result: DiagnosisResultType;
  onResumeDeepMode?: () => void;
}) {
  const { language, t } = useI18n();
  const locale: "zh" | "en" = language === "en" ? "en" : "zh";
  const primaryFix = result.fixes[0] ?? result.summary;
  const primaryNextStep = result.primaryNextStep ?? primaryFix;
  const normalizedPlanLevel = normalizePlanLevel(result.level);
  const deepContext = result.enrichedContext ?? null;
  const candidateIds = buildDiagnosisPlanCandidateIds({
    problemTag: result.problemTag,
    level: normalizedPlanLevel,
    diagnosisInput: result.input,
    recommendedContentIds: result.recommendedContents.map((item) => item.id)
  });
  const planContextSourceInput = deepContext?.sourceInput ?? result.input;
  const planContext = buildDiagnosisPlanContext({
    problemTag: result.problemTag,
    diagnosisInput: planContextSourceInput,
    primaryNextStep
  });
  const planHref = buildPlanHref({
    problemTag: result.problemTag,
    level: normalizedPlanLevel,
    preferredContentIds: candidateIds,
    sourceType: "diagnosis",
    primaryNextStep,
    planContext,
    deepContext: deepContext ?? undefined
  });
  const canGeneratePlan = Boolean(result.input.trim());
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [evidenceExpanded, setEvidenceExpanded] = useState(false);
  const isNarrowingMode = result.needsNarrowing ?? false;
  const isQuickMode = result.effortMode === "quick";
  const isDeepMode = result.effortMode === "deep" || deepContext?.mode === "deep";
  const detailedSummary = result.detailedSummary?.trim() || null;
  const specificityReasons = deepContext ? buildEnrichedSpecificityReasons(deepContext, locale) : [];
  const deepSceneRecap = deepContext?.isDeepModeReady ? buildEnrichedSceneRecap(deepContext, locale) : null;
  const deepEvidenceSummary = deepContext?.isDeepModeReady ? buildDeepDiagnosisEvidenceSummary(deepContext, locale) : null;
  const canExpandLayerTwo = !isNarrowingMode && (!isQuickMode || Boolean(detailedSummary));
  const narrowingPrompts = (result.narrowingPrompts ?? []).slice(0, 2);
  const narrowingSuggestions = (result.narrowingSuggestions ?? [])
    .slice()
    .sort((left, right) => getNarrowingSeverityRank(right.severity) - getNarrowingSeverityRank(left.severity));
  const missingEvidenceSlots = (result.missingEvidenceSlots ?? []).filter(
    (slot): slot is "stroke" | "outcome" | "context" | "condition" =>
      slot === "stroke" || slot === "outcome" || slot === "context" || slot === "condition"
  );
  const refusalSummary = (() => {
    if (!isNarrowingMode) {
      return null;
    }

    if (missingEvidenceSlots.length > 0) {
      const missingLabels = missingEvidenceSlots.map((slot) => getMissingSlotLabel(slot, locale));
      return locale === "en"
        ? `I cannot make a high-confidence diagnosis yet. Missing: ${missingLabels.join(", ")}.`
        : `我现在还不能高置信判断，主要缺：${missingLabels.join("、")}。`;
    }

    return locale === "en"
      ? "I cannot make a high-confidence diagnosis yet because evidence is still limited."
      : "我现在还不能高置信判断，因为当前证据仍不足。";
  })();
  const evidenceTone = getEvidenceToneViewModel(result, locale);
  const featuredContent = result.recommendedContents[0];
  const moreContents = result.recommendedContents.slice(1);
  const planCtaLabel = deepContext?.isDeepModeReady
    ? (locale === "en" ? "Generate a more specific 7-step plan" : "生成更具体的 7 步训练计划")
    : t("diagnose.result.plan");
  const hasCategoryConflict = result.categoryConsistency === "conflict";
  const categoryConflictMessage = hasCategoryConflict
    ? (locale === "en"
      ? "Deep Mode grounded one skill lane, but downstream diagnosis did not stay inside it. Add one more same-lane clue before trusting a technical diagnosis."
      : "Deep Mode 已经把问题收在一个技术类别里，但下游诊断没有稳定留在同一类。先补一条同类线索，再继续相信技术结论。")
    : null;

  useEffect(() => {
    setDetailsOpen(false);
    setEvidenceExpanded(false);
  }, [result.input, result.problemTag]);

  if (!canGeneratePlan) {
    return null;
  }

  return (
    <Card className="space-y-4">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-brand-700">{t("diagnose.result.badge")}</p>
        <h2 className="text-2xl font-black text-slate-900">{result.title}</h2>
        <p className="text-sm leading-6 text-slate-600">{result.summary}</p>
        <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
          <p className="text-sm font-semibold text-slate-700">{t("diagnose.result.today")}</p>
          <p className="mt-2 text-base font-medium text-slate-900">{primaryNextStep}</p>
        </div>
        {!isNarrowingMode ? (
          <div className="flex flex-wrap gap-2">
            <Link
              href={planHref}
              onClick={() => logEvent("diagnose.plan_cta_clicked", {
                problemTag: result.problemTag,
                levelBand: normalizedPlanLevel
              }, { page: "/diagnose" })}
            >
              <Button>{planCtaLabel}</Button>
            </Link>
          </div>
        ) : null}
        {hasCategoryConflict && categoryConflictMessage ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-slate-700">
            <p className="font-semibold text-rose-900">
              {language === "en" ? "Category conflict" : "技术类别冲突"}
            </p>
            <p className="mt-2 leading-6">{categoryConflictMessage}</p>
            {result.categoryConflict?.reason ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {language === "en" ? "Why: " : "原因："}
                {result.categoryConflict.reason}
              </p>
            ) : null}
          </div>
        ) : null}
        {isNarrowingMode ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">
              {language === "en" ? "Before recommendations, clarify these first:" : "在推荐之前，请先补充这两点："}
            </p>
            {refusalSummary ? (
              <p className="mt-2 text-sm leading-6 text-slate-700">{refusalSummary}</p>
            ) : null}
            {narrowingSuggestions.length > 0 ? (
              <div className="mt-3 space-y-2">
                {narrowingSuggestions.map((item) => {
                  const severityLabel = item.severity === "high"
                    ? (language === "en" ? "High priority" : "高优先")
                    : item.severity === "medium"
                      ? (language === "en" ? "Medium priority" : "中优先")
                      : (language === "en" ? "Low priority" : "低优先");

                  return (
                    <div key={item.id} className="rounded-lg border border-amber-200 bg-white/70 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">{severityLabel}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {language === "en" ? "Reason: " : "原因："}
                        {item.reason}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {language === "en" ? "Next action: " : "下一步："}
                        {item.nextAction}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : narrowingPrompts.length > 0 ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {narrowingPrompts.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {isDeepMode && onResumeDeepMode ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    logEvent("diagnose.why_this_viewed", { targetType: "narrowing" }, { page: "/diagnose" });
                    onResumeDeepMode();
                  }}
                >
                  {language === "en" ? "Continue scene reconstruction" : "继续补场景线索"}
                </Button>
              ) : (
                <button
                  type="button"
                  className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
                  onClick={() => {
                    logEvent("diagnose.why_this_viewed", { targetType: "narrowing" }, { page: "/diagnose" });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  {language === "en" ? "I will refine my description" : "我来补充更具体的描述"}
                </button>
              )}
            </div>
          </div>
        ) : null}
        {!isNarrowingMode && result.causes.length > 0 ? (
          <div className="rounded-xl border border-[var(--line)] bg-white/80 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">{t("diagnose.result.why")}</p>
            <p className="mt-2 leading-6">{result.causes[0]}</p>
          </div>
        ) : null}
        {canExpandLayerTwo ? (
          <button
            type="button"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            onClick={() => {
              if (!detailsOpen) {
                logEvent("diagnose.layer_opened", { layer: 2 }, { page: "/diagnose" });
                logEvent("diagnose.why_this_viewed", { targetType: "fix" }, { page: "/diagnose" });
              }
              setDetailsOpen((prev) => !prev);
            }}
          >
            {detailsOpen
              ? (language === "en" ? "Hide details" : "收起细节")
              : t("diagnose.result.expand1")}
          </button>
        ) : null}
      </div>

      {detailsOpen && !isNarrowingMode ? (
        <div className="space-y-4 border-t border-[var(--line)] pt-4">
          <div className={evidenceTone.wrapperClassName}>
            <div className="flex items-center justify-between gap-3">
              <p className={evidenceTone.titleClassName}>{evidenceTone.title}</p>
              <button
                type="button"
                className="text-xs font-semibold text-slate-600 transition hover:text-slate-900"
                onClick={() => {
                  if (!evidenceExpanded) {
                    logEvent("diagnose.why_this_viewed", { targetType: "evidence" }, { page: "/diagnose" });
                  }
                  setEvidenceExpanded((prev) => !prev);
                }}
              >
                {evidenceExpanded
                  ? (language === "en" ? "Hide" : "收起")
                  : (language === "en" ? "View" : "展开")}
              </button>
            </div>
            {evidenceExpanded ? (
              <p className="mt-2">{evidenceTone.description}</p>
            ) : null}
          </div>

          {result.fallbackUsed && result.fallbackMode ? (
            <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-3 text-sm text-slate-700">
              <p>
                {result.fallbackMode === "assessment"
                  ? (language === "en"
                    ? "This first pass uses the weakest area from the assessment. A more specific description will make the diagnosis more precise."
                    : "这次先按你评估里最需要补的环节给你一组方向，后面你再把问题描述得更具体一点，我们会更准。")
                  : (language === "en"
                    ? "This first pass uses a general improvement bundle. After the 1-minute assessment, recommendations will be more precise."
                    : "这次先给你一组通用提升内容。做完 1 分钟评估后，我们能把推荐收得更准。")}
              </p>
              {result.fallbackMode === "no-assessment" ? (
                <div className="mt-3">
                  <Link href="/assessment"><Button variant="secondary">{t("video.assessment.cta")}</Button></Link>
                </div>
              ) : null}
            </div>
          ) : null}

          {detailedSummary ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">
                {language === "en" ? "Expanded reasoning" : "展开说明"}
              </p>
              <p className="text-sm leading-6 text-slate-700">{detailedSummary}</p>
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">{t("diagnose.result.why")}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
              {result.causes.slice(1).map((cause) => (
                <li key={cause}>{cause}</li>
              ))}
            </ul>
          </div>

          {isDeepMode && result.drills.length > 0 ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">
                {language === "en" ? "Training cues" : "训练提示"}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.drills.map((drill) => (
                  <li key={drill}>{drill}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {featuredContent ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">{t("diagnose.result.featured")}</p>
              <RecommendationCard item={featuredContent} source="diagnosis_featured" layer={2} problemTag={result.problemTag} />
            </div>
          ) : null}

          {moreContents.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">{t("diagnose.result.more")}</p>
              {moreContents.map((item) => (
                <RecommendationCard key={item.id} item={item} source="diagnosis_more" layer={3} problemTag={result.problemTag} />
              ))}
            </div>
          ) : null}

          {deepContext?.isDeepModeReady ? (
            <div className="space-y-3 rounded-2xl border border-brand-200 bg-brand-50/70 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-brand-500 px-3 py-1 text-xs font-semibold text-white">深入模式</Badge>
                <p className="text-sm font-semibold text-slate-900">
                  {locale === "en" ? "Scene-backed diagnosis" : "场景证据诊断"}
                </p>
              </div>
              {deepEvidenceSummary ? <p className="text-sm leading-6 text-slate-700">{deepEvidenceSummary}</p> : null}
              {deepSceneRecap ? (
                <div className="rounded-xl bg-white/80 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {locale === "en" ? "Scene recap" : "一句话场景回顾"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{deepSceneRecap}</p>
                </div>
              ) : null}
              {specificityReasons.length > 0 ? (
                <div className="rounded-xl bg-white/80 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {locale === "en" ? "Why this diagnosis is more specific" : "为什么这次判断更具体"}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    {specificityReasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/library"
              onClick={() => logEvent("cta_click", {
                ctaLabel: t("diagnose.result.library"),
                ctaLocation: "diagnosis_result_follow_up",
                targetPage: "/library"
              }, { page: "/diagnose" })}
            >
              <Button variant="secondary">{t("diagnose.result.library")}</Button>
            </Link>
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {t("diagnose.result.continue")}
            </button>
              {VIDEO_DIAGNOSE_VISIBLE ? (
                <Link
                  href="/video-diagnose"
                onClick={() => logEvent("cta_click", { ctaLabel: t("cta.videoUpgrade"), ctaLocation: "diagnosis_result", targetPage: "/video-diagnose" })}
              >
                <Button variant="secondary">{t("diagnose.result.video")}</Button>
              </Link>
                ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
