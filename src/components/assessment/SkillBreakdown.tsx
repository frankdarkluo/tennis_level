import { AssessmentResult, AssessmentDimensionStatus } from "@/types/assessment";
import { getAssessmentStatusLabel, getDimensionLabel } from "@/lib/assessment";
import { useI18n } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

function getStatusClasses(status: AssessmentDimensionStatus) {
  switch (status) {
    case "weak":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "needs_work":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "strength":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export function SkillBreakdown({ result }: { result: AssessmentResult }) {
  const { language, t } = useI18n();

  if (!result.profileVector || result.dimensionSummaries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-900">{t("assessment.result.skillBreakdown")}</h2>
        <p className="text-sm text-slate-500">{t("assessment.result.skillBreakdownHint")}</p>
      </div>

      <div className="space-y-2">
        {result.dimensionSummaries.map((dimension) => {
          const percentage = Math.round((dimension.score / dimension.maxScore) * 100);

          return (
            <div
              key={dimension.key}
              className="rounded-2xl bg-white px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">{getDimensionLabel(dimension.key, language)}</p>
                  <p className="text-xs text-slate-500">{`${dimension.score} / ${dimension.maxScore}`}</p>
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs font-semibold",
                    getStatusClasses(dimension.status)
                  )}
                >
                  {getAssessmentStatusLabel(dimension.status, language)}
                </span>
              </div>

              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all",
                    dimension.status === "weak"
                      ? "bg-rose-400"
                      : dimension.status === "needs_work"
                        ? "bg-amber-400"
                        : dimension.status === "strength"
                          ? "bg-emerald-400"
                          : "bg-slate-400"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
