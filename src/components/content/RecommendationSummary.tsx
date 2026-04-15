"use client";

import { Badge } from "@/components/ui/Badge";
import type { GuidanceContext } from "@/lib/guidance-context/types";
import { buildRecommendationDetails, RecommendationTrustSignal } from "@/lib/content/recommendationSignals";
import { I18nKey, useI18n } from "@/lib/i18n/config";
import { ContentItem } from "@/types/content";

const TRUST_SIGNAL_KEYS = {
  direct_source: "content.trust.directSource",
  search_link: "content.trust.searchLink",
  teaching: "content.trust.teaching",
  match_example: "content.trust.matchExample",
  commentary: "content.trust.commentary"
} satisfies Record<RecommendationTrustSignal, I18nKey>;

export function RecommendationSummary({
  item,
  guidanceContext,
  className = ""
}: {
  item: ContentItem;
  guidanceContext?: GuidanceContext;
  className?: string;
}) {
  const { language, t } = useI18n();
  const locale: "zh" | "en" = language === "en" ? "en" : "zh";
  const details = buildRecommendationDetails(item, locale, guidanceContext);

  return (
    <div className={`space-y-2 text-xs leading-5 text-slate-500 ${className}`.trim()}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
          {t("content.recommendationWhy")}
        </p>
        <p>{details.whySelected}</p>
      </div>
      {details.technicalPoint ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {t("content.recommendationTarget")}
          </p>
          <p>{details.technicalPoint}</p>
        </div>
      ) : null}
      {details.trustSignals.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            {t("content.recommendationTrust")}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {details.trustSignals.map((signal) => (
              <Badge
                key={signal}
                className="bg-slate-100 px-2.5 py-1 text-[11px] font-semibold leading-none text-slate-600"
              >
                {t(TRUST_SIGNAL_KEYS[signal])}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
