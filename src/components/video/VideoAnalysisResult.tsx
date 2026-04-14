"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  getContentCoachNote,
  getContentFocusLine,
  getContentPrimaryTitle,
  getContentSecondaryTitle,
  getCreatorBio,
  getCreatorTags
} from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { buildDiagnosisPlanCandidateIds, buildPlanHref } from "@/lib/plans";
import { getThumbnail } from "@/lib/thumbnail";
import { VideoDiagnosisResult } from "@/types/videoDiagnosis";

function getConfidenceTone(confidence: VideoDiagnosisResult["confidenceBand"]) {
  if (confidence === "较高") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (confidence === "中等") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-rose-50 text-rose-700";
}

function RecommendationCard({
  item,
  source
}: {
  item: VideoDiagnosisResult["recommendedContents"][number];
  source: "video_diagnosis_featured" | "video_diagnosis_more";
}) {
  const { language, t } = useI18n();
  const thumbnail = getThumbnail(item);
  const primaryTitle = getContentPrimaryTitle(item, language);
  const secondaryTitle = getContentSecondaryTitle(item, language);
  const focusLine = getContentFocusLine(item, language);
  const coachNote = getContentCoachNote(item, language);

  return (
    <div className="rounded-xl border border-[var(--line)] p-4">
      <div className="flex gap-3">
        <VideoThumbnail thumbnail={thumbnail} title={primaryTitle} platform={item.platform} duration={item.duration} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PlatformBadge platform={item.platform} />
            <Badge className="bg-slate-100 text-slate-700">{item.levels.join("/")}</Badge>
          </div>
          <p className="mt-2 font-semibold text-slate-900">{primaryTitle}</p>
          {secondaryTitle ? (
            <p className="mt-1 text-xs leading-5 text-slate-400">{secondaryTitle}</p>
          ) : null}
          {focusLine && focusLine !== primaryTitle ? (
            <p className="mt-1 text-sm text-slate-600">{t("content.targetPrefix")} {focusLine}</p>
          ) : null}
          {coachNote ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{t("content.coachNote")} {coachNote}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3">
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          onClick={() => {
            logEvent("content_click", { contentId: item.id, source });
            logEvent("content_external", { contentId: item.id, platform: item.platform, url: item.url });
          }}
        >
          <Button variant="secondary">{t("content.open")}</Button>
        </a>
      </div>
    </div>
  );
}

export function VideoAnalysisResult({ result }: { result: VideoDiagnosisResult }) {
  const { language, t } = useI18n();
  const candidateIds = buildDiagnosisPlanCandidateIds({
    problemTag: result.trainingPlan.problemTag,
    level: result.trainingPlan.level,
    recommendedContentIds: result.recommendedContents.map((item) => item.id)
  });
  const planHref = buildPlanHref({
    problemTag: result.trainingPlan.problemTag,
    level: result.trainingPlan.level,
    preferredContentIds: candidateIds,
    sourceType: "diagnosis"
  });
  const [layer, setLayer] = useState<1 | 2 | 3>(1);
  const primaryFix = result.primaryProblem.fix || result.primaryProblem.cause;
  const featuredContent = result.recommendedContents[0];
  const moreContents = result.recommendedContents.slice(1);

  useEffect(() => {
    setLayer(1);
  }, [result.primaryProblem.label, result.observation.overallAssessment]);

  return (
    <Card className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-700">{t("video.result.badge")}</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">{t("video.result.title")} {result.primaryProblem.label}</h2>
          </div>
          <Badge className={getConfidenceTone(result.confidenceBand)}>
            {language === "en"
              ? result.confidenceBand === "较高"
                ? "High confidence"
                : result.confidenceBand === "中等"
                  ? "Medium confidence"
                  : "Low confidence"
              : result.confidenceBand}
          </Badge>
        </div>

        <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
          <p className="text-sm font-semibold text-slate-700">{t("video.result.focus")}</p>
          <p className="mt-2 text-base font-medium text-slate-900">{primaryFix}</p>
        </div>

        {!result.chargeable && result.fallbackReason ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <p className="font-semibold">{t("video.result.cautionTitle")}</p>
            <p className="mt-1 leading-6">{result.fallbackReason}</p>
          </div>
        ) : null}

        {layer === 1 ? (
          <button
            type="button"
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            onClick={() => setLayer(2)}
          >
            {t("video.result.expand1")}
          </button>
        ) : null}
      </div>

      {layer >= 2 ? (
        <div className="space-y-4 border-t border-[var(--line)] pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">{t("video.result.see")}</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>{language === "en" ? "Body posture:" : "身体姿态："}{result.observation.bodyPosture}</li>
                <li>{language === "en" ? "Contact point:" : "击球点："}{result.observation.contactPoint}</li>
                <li>{language === "en" ? "Footwork:" : "脚步："}{result.observation.footwork}</li>
                <li>{language === "en" ? "Swing path:" : "挥拍路径："}{result.observation.swingPath}</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-900">{t("video.result.because")}</p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
                <li>{result.primaryProblem.cause}</li>
                {result.secondaryProblems.slice(0, 2).map((item) => (
                  <li key={item.label}>{item.description}</li>
                ))}
              </ul>
            </div>
          </div>

          {featuredContent ? (
            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">{t("video.result.featured")}</p>
              <RecommendationCard item={featuredContent} source="video_diagnosis_featured" />
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Link
              href={planHref}
              onClick={() => logEvent("video_plan_generate", { problemTag: result.trainingPlan.problemTag, level: result.trainingPlan.level })}
            >
              <Button>{result.chargeable ? t("video.result.plan") : t("video.result.planFallback")}</Button>
            </Link>
          </div>

        {layer === 2 ? (
            <button
              type="button"
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => setLayer(3)}
            >
              {t("video.result.expand2")}
            </button>
          ) : null}
        </div>
      ) : null}

      {layer >= 3 ? (
        <div className="space-y-4 border-t border-[var(--line)] pt-4">
          {moreContents.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">{t("video.result.more")}</p>
              {moreContents.map((item) => (
                <RecommendationCard key={item.id} item={item} source="video_diagnosis_more" />
              ))}
            </div>
          ) : null}

          {result.recommendedCreators.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-900">{t("video.result.creators")}</p>
              {result.recommendedCreators.map((creator) => (
                <div key={creator.id} className="rounded-2xl border border-[var(--line)] p-4">
                  <div className="flex items-start gap-3">
                    <CreatorAvatar name={creator.name} avatarUrl={creator.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-slate-900">{creator.name}</p>
                        {creator.platforms.slice(0, 1).map((platform) => (
                          <PlatformBadge key={platform} platform={platform} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{getCreatorBio(creator, language)}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {getCreatorTags(creator.tags.slice(0, 2), language).map((tag, index) => (
                          <Badge key={`${creator.id}:${index}`}>{tag}</Badge>
                        ))}
                      </div>
                      {creator.profileUrl ? (
                        <div className="mt-3">
                          <a
                            href={creator.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => logEvent("creator_click", { creatorId: creator.id, source: "video_diagnosis" })}
                          >
                            <Button variant="ghost">{language === "en" ? "Visit creator" : "去看 TA"}</Button>
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {result.searchSuggestions.length > 0 ? (
            <Card className="space-y-3">
              <p className="text-sm font-semibold text-brand-700">{t("video.result.search")}</p>
              <div className="space-y-2">
                {result.searchSuggestions.map((item) => (
                  <div key={`${item.platform}-${item.keyword}`} className="rounded-2xl border border-[var(--line)] px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <PlatformBadge platform={item.platform} />
                      <span className="text-sm font-medium text-slate-900">{item.keyword}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
