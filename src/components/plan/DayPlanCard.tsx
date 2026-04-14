"use client";

import { useState } from "react";
import { RecommendationSummary } from "@/components/content/RecommendationSummary";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import { DayPlan } from "@/types/plan";
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

const contentById = new Map([...contents, ...expandedContents].map((content) => [content.id, content]));

function PrescriptionBlock({
  label,
  block
}: {
  label: string;
  block: DayPlan["warmupBlock"];
}) {
  const normalizeHeading = (value: string) => value.replace(/[\s\-:：]/g, "").toLowerCase();
  const shouldShowBlockTitle = block.title.trim().length > 0 && normalizeHeading(block.title) !== normalizeHeading(label);

  return (
    <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      {shouldShowBlockTitle ? (
        <p className="text-sm font-medium text-slate-700">{block.title}</p>
      ) : null}
      <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
        {block.items.map((item, index) => (
          <li key={`${label}-${block.title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PrescriptionMetadata({
  durationLabel,
  intensityLabel,
  tempoLabel
}: {
  durationLabel: string;
  intensityLabel: string;
  tempoLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-slate-100 px-3 py-1.5 text-sm font-semibold leading-none text-slate-700">
        {durationLabel}
      </Badge>
      <Badge className="bg-slate-100 px-3 py-1.5 text-sm font-semibold leading-none text-slate-700">
        {intensityLabel}
      </Badge>
      <Badge className="bg-slate-100 px-3 py-1.5 text-sm font-semibold leading-none text-slate-700">
        {tempoLabel}
      </Badge>
    </div>
  );
}

function PrescriptionCue({
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

function PrescriptionPlan({
  day,
  language,
  t,
  showFull = false
}: {
  day: DayPlan;
  language: "zh" | "en";
  t: ReturnType<typeof useI18n>["t"];
  showFull?: boolean;
}) {
  const practiceItems = [...day.mainBlock.items, ...day.pressureBlock.items]
    .map((item) => item.trim())
    .filter((item, index, source) => item.length > 0 && source.indexOf(item) === index);
  const practiceLabel = t("plan.day.main");
  const drillText = showFull ? (day.drill ?? day.drills[0] ?? day.focus).trim() : compactPrompt(day.drill ?? day.drills[0] ?? day.focus, language);
  const loadText = showFull ? (day.load ?? day.duration).trim() : compactPrompt(day.load ?? day.duration, language);
  const executionFocusText = showFull
    ? (day.executionFocus ?? day.goal).trim()
    : compactPrompt(day.executionFocus ?? day.goal, language);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-900">{t("plan.day.goal")}</p>
        <p className="text-sm leading-6 text-slate-700">{showFull ? day.goal.trim() : compactPrompt(day.goal, language)}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <PrescriptionCue label={t("plan.day.drill")} value={drillText} />
        <PrescriptionCue label={t("plan.day.load")} value={loadText} />
        <PrescriptionCue label={t("plan.day.executionFocus")} value={executionFocusText} />
      </div>

      <PrescriptionMetadata
        durationLabel={`${t("plan.day.duration")} · ${day.duration}`}
        intensityLabel={`${t("plan.day.intensity")} · ${t(`plan.day.intensity.${day.intensity}`)}`}
        tempoLabel={`${t("plan.day.tempo")} · ${t(`plan.day.tempo.${day.tempo}`)}`}
      />

      <div className="space-y-3">
        <PrescriptionBlock
          label={practiceLabel}
          block={{
            title: practiceLabel,
            items: practiceItems.map((item) => (showFull ? item : compactPrompt(item, language)))
          }}
        />
      </div>

      <div className="space-y-2 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
        <p className="text-sm font-semibold text-slate-900">{t("plan.day.success")}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          {day.successCriteria.map((criteria, index) => (
            <li key={`success-${day.day}-${index}`}>{showFull ? criteria.trim() : compactPrompt(criteria, language)}</li>
          ))}
        </ul>
      </div>

      <PrescriptionCue
        label={t("plan.day.failure")}
        value={showFull ? day.failureCue.trim() : compactPrompt(day.failureCue, language)}
      />

      <PrescriptionCue
        label={t("plan.day.transfer")}
        value={showFull ? day.transferCue.trim() : compactPrompt(day.transferCue, language)}
      />
    </div>
  );
}

export function DayPlanCard({
  day,
  onViewDetails,
  isToday = false
}: {
  day: DayPlan;
  onViewDetails?: (dayNumber: number) => void;
  isToday?: boolean;
}) {
  const { language, t } = useI18n();
  const relatedContents = day.contentIds
    .map((id) => contentById.get(id))
    .filter((content) => Boolean(content));
  const [expanded, setExpanded] = useState(isToday);
  const displayExpanded = isToday || expanded;
  const detailsId = `plan-day-${day.day}-details`;
  const featuredContent = relatedContents[0] ?? null;
  const thumbnail = featuredContent ? getThumbnail(featuredContent) : null;
  const primaryTitle = featuredContent ? getContentPrimaryTitle(featuredContent, language) : null;
  const secondaryTitle = featuredContent ? getContentSecondaryTitle(featuredContent, language) : null;
  const focusLine = featuredContent ? getContentFocusLine(featuredContent, language) : null;
  const contentLanguage = featuredContent ? getContentLanguageTag(featuredContent) : null;
  const subtitleAvailability = featuredContent ? getSubtitleAvailability(featuredContent) : null;
  const subtitleLabel = subtitleAvailability ? t(getSubtitleAvailabilityTranslationKey(subtitleAvailability)) : null;

  const featuredContentCard = featuredContent ? (
    <a
      href={featuredContent.url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-[var(--line)] bg-white p-3 transition hover:border-brand-200"
      onClick={(event) => {
        logEvent("content.outbound_clicked", {
          contentId: featuredContent.id,
          platform: featuredContent.platform,
          sourceContext: "plan"
        }, { page: "/plan" });

        const outbound = getPreferredOutboundUrl(featuredContent, {
          userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent
        });

        if (outbound.href !== featuredContent.url && typeof window !== "undefined") {
          event.preventDefault();
          window.location.assign(outbound.href);
        }
      }}
    >
      <div className="flex gap-3">
        <VideoThumbnail
          thumbnail={thumbnail}
          title={primaryTitle ?? featuredContent.title}
          platform={featuredContent.platform}
          duration={featuredContent.duration}
        />
        <div className="min-w-0 flex-1">
          {featuredContent ? (
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge className="bg-slate-100 px-4 py-1.5 text-sm font-semibold leading-none text-slate-700">
                {contentLanguage === "zh" ? t("content.lang.zh") : t("content.lang.en")}
              </Badge>
              <Badge className="bg-slate-100 px-4 py-1.5 text-sm font-semibold leading-none text-slate-700">
                {subtitleLabel}
              </Badge>
            </div>
          ) : null}
          <p className="font-semibold text-slate-900">{primaryTitle ?? featuredContent.title}</p>
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
          <RecommendationSummary item={featuredContent} className="mt-2" />
          <p className="mt-2 text-sm font-medium text-slate-500">{t("plan.day.open")} →</p>
        </div>
      </div>
    </a>
  ) : null;

  const toggleExpanded = () => {
    if (isToday) {
      return;
    }

    if (!expanded) {
      onViewDetails?.(day.day);
    }

    setExpanded((prev) => !prev);
  };

  if (isToday) {
    return (
      <Card className="space-y-4 border-brand-200 bg-brand-50/40">
        <div>
          <p className="text-sm font-semibold text-brand-700">{t("plan.day.label", { day: day.day })} · {t("plan.day.today")}</p>
          <h3 className="mt-1 text-xl font-bold text-slate-900">{day.focus}</h3>
        </div>

        <PrescriptionPlan day={day} language={language} t={t} showFull={true} />

        <div>
          <p className="mb-2 text-sm font-semibold text-slate-900">{t("plan.day.watch")}</p>
          {featuredContentCard ?? (
            <p className="text-sm text-slate-600">{t("plan.day.fallback")}</p>
          )}
          {day.linkedContentReason ? (
            <div className="mt-3 rounded-2xl border border-[var(--line)] bg-white/70 p-4">
              <p className="text-sm font-semibold text-slate-900">{t("plan.day.linkedReason")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {displayExpanded ? day.linkedContentReason : compactPrompt(day.linkedContentReason, language)}
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
          <p className="text-sm font-semibold text-slate-900">{t("plan.day.label", { day: day.day })}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{compactFocus(day.focus)}</p>
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
          <PrescriptionPlan day={day} language={language} t={t} showFull={displayExpanded} />
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">{t("plan.day.watch")}</p>
            {featuredContentCard ?? (
              <p className="text-sm text-slate-600">{t("plan.day.fallback")}</p>
            )}
            {day.linkedContentReason ? (
              <div className="rounded-2xl border border-[var(--line)] bg-white/70 p-4">
                <p className="text-sm font-semibold text-slate-900">{t("plan.day.linkedReason")}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {displayExpanded ? day.linkedContentReason : compactPrompt(day.linkedContentReason, language)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
