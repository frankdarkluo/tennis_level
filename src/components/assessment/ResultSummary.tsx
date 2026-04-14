import { AssessmentResult } from "@/types/assessment";
import { Card } from "@/components/ui/Card";
import { SkillBreakdown } from "@/components/assessment/SkillBreakdown";
import {
  formatAssessmentLevelRange,
  getDimensionLabel,
  getLocalizedAssessmentResult,
  getPlayContextLabel,
  getPlayStyleLabel
} from "@/lib/assessment";
import { useI18n } from "@/lib/i18n/config";

export function ResultSummary({ result }: { result: AssessmentResult }) {
  const { language, t } = useI18n();

  if (!result.profileVector) {
    return (
      <Card className="space-y-2 px-5 py-5 sm:px-6 sm:py-6">
        <h1 className="text-2xl font-black text-slate-900">{t("assessment.empty.title")}</h1>
        <p className="text-slate-600">{t("assessment.empty.subtitle")}</p>
      </Card>
    );
  }

  const localizedResult = getLocalizedAssessmentResult(result, language);
  const profileVector = localizedResult.profileVector!;
  const rangeLabel = formatAssessmentLevelRange(profileVector.levelBand);
  const strongDimensions = profileVector.strongDimensions.map((dimension) => getDimensionLabel(dimension, language));
  const weakDimensions = [
    profileVector.primaryWeakness,
    profileVector.secondaryWeakness,
    ...profileVector.weakDimensions
  ]
    .filter((dimension, index, array): dimension is NonNullable<typeof dimension> => Boolean(dimension) && array.indexOf(dimension) === index)
    .slice(0, 3)
    .map((dimension) => getDimensionLabel(dimension, language));

  return (
    <Card className="space-y-4 px-5 py-5 sm:space-y-5 sm:px-6 sm:py-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-black text-slate-900">{t("assessment.result.headline")}</h1>
      </div>

      <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-[var(--surface-soft)] p-3 md:p-4">
          <p className="text-sm font-semibold text-brand-700">{t("assessment.result.level")}</p>
          <p className="mt-2 text-2xl font-black text-slate-900">{rangeLabel}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{profileVector.summary.oneLineLevelSummary}</p>
        </div>

        <div className="rounded-2xl bg-white px-0 py-1 md:p-4">
          <p className="text-sm font-semibold text-brand-700">{t("assessment.result.headlineLabel")}</p>
          <p className="mt-2 text-base font-semibold text-slate-900">{profileVector.summary.headline}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-white px-0 py-1 md:p-4">
          <p className="text-sm font-semibold text-slate-700">{t("assessment.result.planHintLabel")}</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{profileVector.summary.oneLinePlanHint}</p>
        </div>

        <div className="rounded-2xl bg-white px-0 py-1 md:p-4">
          <p className="text-sm font-semibold text-slate-700">{t("assessment.result.styleLabel")}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {getPlayStyleLabel(profileVector.playStyle, language)}
          </p>
        </div>

        <div className="rounded-2xl bg-white px-0 py-1 md:p-4">
          <p className="text-sm font-semibold text-slate-700">{t("assessment.result.contextLabel")}</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {getPlayContextLabel(profileVector.playContext, language)}
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
        <div className="rounded-2xl bg-emerald-50/60 p-3 md:p-4">
          <p className="text-sm font-semibold text-emerald-700">{t("assessment.result.strongLabel")}</p>
          <div className="mt-2 flex flex-wrap gap-2 md:mt-3">
            {strongDimensions.length > 0 ? (
              strongDimensions.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-sm font-medium text-emerald-700"
                >
                  {label}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">{t("profile.none")}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-rose-50/60 p-3 md:p-4">
          <p className="text-sm font-semibold text-rose-700">{t("assessment.result.weakLabel")}</p>
          <div className="mt-2 flex flex-wrap gap-2 md:mt-3">
            {weakDimensions.length > 0 ? (
              weakDimensions.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-rose-200 bg-white px-3 py-1 text-sm font-medium text-rose-700"
                >
                  {label}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">{t("profile.none")}</p>
            )}
          </div>
        </div>
      </div>

      <SkillBreakdown result={localizedResult} />
    </Card>
  );
}
