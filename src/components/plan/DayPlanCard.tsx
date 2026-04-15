"use client";

import { useState } from "react";
import { RecommendationSummary } from "@/components/content/RecommendationSummary";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { MotionPrimitive } from "@/components/plan/MotionPrimitive";
import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import type { GuidanceContext } from "@/lib/guidance-context/types";
import { resolvePlanDayContract } from "@/lib/plan-core/dayContract";
import type { DayPlan } from "@/types/plan";
import type { ContentItem } from "@/types/content";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  getContentFocusLine,
  getContentLanguageTag,
  getContentPrimaryTitle,
  getContentSecondaryTitle,
  getSubtitleAvailability,
  getSubtitleAvailabilityTranslationKey
} from "@/lib/content/display";
import { getPreferredOutboundUrl } from "@/lib/content/outbound";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getThumbnail } from "@/lib/thumbnail";

function compactFocus(value: string, maxLength = 24) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

function compactPrompt(value: string, language: "zh" | "en") {
  const normalized = value
    .replace(/\s+/g, " ")
    .replace(/^[\-\*\d\.\s]+/, "")
    .trim();

  if (language === "zh") {
    const cuePrefix = (() => {
      if (/关键分|压力/.test(normalized)) return "关键分：";
      if (/发球|二发|一发|抛球/.test(normalized)) return "发球：";
      if (/网前|截击|上网/.test(normalized)) return "网前：";
      if (/脚步|移动|跑动|回位/.test(normalized)) return "脚步：";
      return "";
    })();

    const cleaned = normalized
      .replace(/^先(?:把|将)?/, "")
      .replace(/^把/, "")
      .replace(/^在/, "")
      .replace(/^然后/, "")
      .replace(/^再/, "")
      .replace(/^能/, "")
      .replace(/(，|,)?\s*(再|然后|并且|并)\s*.*$/, "")
      .replace(/(，|,)\s*先.*$/, "")
      .replace(/稳定下来/g, "稳住")
      .replace(/建立起来/g, "建立")
      .replace(/保持住/g, "保持")
      .replace(/不要急着/g, "先别")
      .replace(/优先/g, "先")
      .replace(/[。！!]+$/, "")
      .trim();

    const cueText = `${cuePrefix}${cleaned}`.trim();

    if (cueText.length <= 24) {
      return cueText;
    }

    return `${cueText.slice(0, 24)}…`;
  }

  const cleaned = normalized
    .replace(/^first\s+/i, "")
    .replace(/^then\s+/i, "")
    .replace(/^focus on\s+/i, "")
    .replace(/^aim to\s+/i, "")
    .replace(/^try to\s+/i, "")
    .replace(/,\s*then\s+.*$/i, "")
    .replace(/\.+$/, "")
    .trim();

  if (cleaned.length <= 52) {
    return cleaned;
  }

  return `${cleaned.slice(0, 52)}…`;
}

function splitSetupItems(value: string, language: "zh" | "en"): string[] {
  const parts = language === "en" ? value.split(/\s+Then\s+/) : value.split("；");

  return parts
    .map((part) => part.trim())
    .filter(Boolean);
}

const contentById = new Map([...contents, ...expandedContents].map((content) => [content.id, content]));

function DetailBlock({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function DetailListBlock({
  label,
  items,
  language,
  compact = false
}: {
  label: string;
  items: string[];
  language: "zh" | "en";
  compact?: boolean;
}) {
  const visibleItems = compact ? items.slice(0, 1).map((item) => compactPrompt(item, language)) : items;

  return (
    <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {visibleItems.map((item, index) => (
          <li key={`${label}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function CompactSummary({
  day,
  language,
  t
}: {
  day: DayPlan;
  language: "zh" | "en";
  t: ReturnType<typeof useI18n>["t"];
}) {
  const cue = day.details?.focusCues[0] ?? day.executionFocus ?? day.focus;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <DetailBlock label={t("plan.day.goal")} value={compactPrompt(day.details?.goal ?? day.goal, language)} />
      <DetailBlock
        label={t("plan.day.dosage")}
        value={compactPrompt(day.details?.dosage ?? day.load ?? day.duration, language)}
      />
      <DetailBlock label={t("plan.day.focusCues")} value={compactPrompt(cue, language)} />
    </div>
  );
}

function StepDetailSection({
  day,
  language,
  t
}: {
  day: DayPlan;
  language: "zh" | "en";
  t: ReturnType<typeof useI18n>["t"];
}) {
  const details = day.details;
  if (!details) {
    return null;
  }

  return (
    <div className="space-y-4">
      <DetailBlock label={t("plan.day.goal")} value={details.goal} />

      <div className="grid gap-3 md:grid-cols-2">
        <DetailListBlock label={t("plan.day.setup")} items={splitSetupItems(details.setup, language)} language={language} />
        <DetailBlock label={t("plan.day.dosage")} value={details.dosage} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <DetailListBlock label={t("plan.day.focusCues")} items={details.focusCues} language={language} />
        <DetailListBlock label={t("plan.day.mistakes")} items={details.commonMistakes} language={language} />
      </div>

      <DetailListBlock label={t("plan.day.success")} items={details.successCriteria} language={language} />
    </div>
  );
}

function AttachmentCard({
  content,
  guidanceContext,
  language,
  t
}: {
  content: ContentItem;
  guidanceContext?: GuidanceContext | null;
  language: "zh" | "en";
  t: ReturnType<typeof useI18n>["t"];
}) {
  const thumbnail = getThumbnail(content);
  const primaryTitle = getContentPrimaryTitle(content, language) ?? content.title;
  const secondaryTitle = getContentSecondaryTitle(content, language);
  const focusLine = getContentFocusLine(content, language);
  const contentLanguage = getContentLanguageTag(content);
  const subtitleAvailability = getSubtitleAvailability(content);
  const subtitleLabel = subtitleAvailability ? t(getSubtitleAvailabilityTranslationKey(subtitleAvailability)) : null;

  return (
    <a
      href={content.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-[var(--line)] bg-white p-3 transition hover:border-brand-200"
      onClick={(event) => {
        logEvent("content.outbound_clicked", {
          contentId: content.id,
          platform: content.platform,
          sourceContext: "plan"
        }, { page: "/plan" });

        const outbound = getPreferredOutboundUrl(content, {
          userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent
        });

        if (outbound.href !== content.url && typeof window !== "undefined") {
          event.preventDefault();
          window.location.assign(outbound.href);
        }
      }}
    >
      <div className="flex gap-3">
        <VideoThumbnail
          thumbnail={thumbnail}
          title={primaryTitle}
          platform={content.platform}
          duration={content.duration}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge className="bg-slate-100 px-4 py-1.5 text-sm font-semibold leading-[1.15] text-slate-700">
              {contentLanguage === "zh" ? t("content.lang.zh") : t("content.lang.en")}
            </Badge>
            {subtitleLabel ? (
              <Badge className="bg-slate-100 px-4 py-1.5 text-sm font-semibold leading-[1.15] text-slate-700">
                {subtitleLabel}
              </Badge>
            ) : null}
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
          {focusLine && focusLine !== primaryTitle ? (
            <p className="mt-1 text-sm text-slate-600">{t("content.targetPrefix")} {focusLine}</p>
          ) : null}
          <RecommendationSummary item={content} guidanceContext={guidanceContext ?? undefined} className="mt-2" />
          <p className="mt-2 text-sm font-medium text-slate-500">{t("plan.day.open")} →</p>
        </div>
      </div>
    </a>
  );
}

export function DayPlanCard({
  day,
  guidanceContext,
  onViewDetails,
  isToday = false,
  defaultExpanded = false
}: {
  day: DayPlan;
  guidanceContext?: GuidanceContext | null;
  onViewDetails?: (dayNumber: number) => void;
  isToday?: boolean;
  defaultExpanded?: boolean;
}) {
  const { language, t } = useI18n();
  const resolvedDay = resolvePlanDayContract(day, language);
  const [expanded, setExpanded] = useState(isToday || defaultExpanded);
  const displayExpanded = isToday || expanded;
  const detailsId = `plan-day-${resolvedDay.day}-details`;
  const primaryContentId = resolvedDay.attachments?.primaryContentId ?? null;
  const backupContentId = resolvedDay.attachments?.backupContentId ?? null;
  const primaryContent = primaryContentId ? contentById.get(primaryContentId) ?? null : null;
  const backupContent = backupContentId ? contentById.get(backupContentId) ?? null : null;

  const toggleExpanded = () => {
    if (isToday) {
      return;
    }

    if (!expanded) {
      onViewDetails?.(resolvedDay.day);
    }

    setExpanded((prev) => !prev);
  };

  if (isToday) {
    return (
      <Card className="space-y-4 border-brand-200 bg-brand-50/40">
        <div>
          <p className="text-sm font-semibold text-brand-700">
            {t("plan.day.label", { day: resolvedDay.day })} · {t("plan.day.today")}
          </p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{resolvedDay.focus}</h3>
        </div>

        <StepDetailSection day={resolvedDay} language={language} t={t} />
        {resolvedDay.motionPrimitiveId ? (
          <MotionPrimitive motionPrimitiveId={resolvedDay.motionPrimitiveId} />
        ) : null}

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">{t("plan.day.primaryVideo")}</p>
          {primaryContent ? (
            <AttachmentCard
              content={primaryContent}
              guidanceContext={guidanceContext}
              language={language}
              t={t}
            />
          ) : (
            <p className="text-sm text-slate-600">{t("plan.day.fallback")}</p>
          )}
          {resolvedDay.linkedContentReason ? (
            <div className="mt-3 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-900">{t("plan.day.linkedReason")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {resolvedDay.linkedContentReason}
              </p>
            </div>
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-0">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{t("plan.day.label", { day: resolvedDay.day })}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{compactFocus(resolvedDay.focus)}</p>
        </div>
        <Button
          variant="ghost"
          className="px-3 text-sm"
          onClick={toggleExpanded}
          aria-expanded={displayExpanded}
          aria-controls={detailsId}
        >
          {displayExpanded ? t("plan.day.collapse") : t("plan.day.expand")}
        </Button>
      </div>

      {displayExpanded ? (
        <div id={detailsId} className="mt-4 space-y-3 border-t border-[var(--line)] pt-4">
          <StepDetailSection day={resolvedDay} language={language} t={t} />
          {resolvedDay.motionPrimitiveId ? (
            <MotionPrimitive motionPrimitiveId={resolvedDay.motionPrimitiveId} />
          ) : null}
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">{t("plan.day.primaryVideo")}</p>
              {primaryContent ? (
                <AttachmentCard
                  content={primaryContent}
                  guidanceContext={guidanceContext}
                  language={language}
                  t={t}
                />
              ) : (
                <p className="text-sm text-slate-600">{t("plan.day.fallback")}</p>
              )}
              {resolvedDay.linkedContentReason ? (
                <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
                  <p className="text-sm font-semibold text-slate-900">{t("plan.day.linkedReason")}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{resolvedDay.linkedContentReason}</p>
                </div>
              ) : null}
            </div>

            {backupContent ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">{t("plan.day.backupVideo")}</p>
                <AttachmentCard
                  content={backupContent}
                  guidanceContext={guidanceContext}
                  language={language}
                  t={t}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4 border-t border-[var(--line)] pt-4">
          <CompactSummary day={resolvedDay} language={language} t={t} />
        </div>
      )}
    </Card>
  );
}
