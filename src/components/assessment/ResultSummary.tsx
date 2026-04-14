import { AssessmentResult } from "@/types/assessment";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";
import { getLocalizedAssessmentResult } from "@/lib/assessment";
import { SkillBreakdown } from "@/components/assessment/SkillBreakdown";

export function ResultSummary({ result }: { result: AssessmentResult }) {
  const { language, t } = useI18n();

  if (result.answeredCount === 0) {
    return (
      <Card className="space-y-0.5 px-2 py-2 sm:px-6 sm:py-6">
        <h1 className="text-2xl font-black text-slate-900">{t("assessment.empty.title")}</h1>
        <p className="text-slate-600">{t("assessment.empty.subtitle")}</p>
      </Card>
    );
  }

  const localizedResult = getLocalizedAssessmentResult(result, language);
  const weaknesses = Array.from(new Set(localizedResult.weaknesses));
  const observationNeeded = Array.from(new Set(localizedResult.observationNeeded));

  return (
    <Card className="space-y-0.5 px-2 py-2 sm:px-6 sm:py-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-black text-slate-900">{t("assessment.result.headline")} {localizedResult.level}</h1>
        <div className="rounded-2xl bg-[var(--surface-soft)] p-4">
          <p className="text-sm font-semibold text-brand-700">{t("assessment.result.summary")}</p>
          <p className="mt-2 text-base leading-7 text-slate-800">{localizedResult.summary}</p>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
          <p className="text-sm font-semibold text-rose-700">{t("assessment.result.weaknesses")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {weaknesses.length > 0 ? (
              weaknesses.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-rose-200 bg-white px-3 py-1 text-sm font-medium text-rose-700"
                >
                  {label}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">{t("assessment.result.noWeaknesses")}</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
          <p className="text-sm font-semibold text-amber-700">{t("assessment.result.observationNeeded")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {observationNeeded.length > 0 ? (
              observationNeeded.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-amber-200 bg-white px-3 py-1 text-sm font-medium text-amber-700"
                >
                  {label}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-600">{t("assessment.result.noObservationNeeded")}</p>
            )}
          </div>
        </div>
      </div>

      <SkillBreakdown result={localizedResult} />
    </Card>
  );
}
