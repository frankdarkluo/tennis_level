import { PLAN_MICROCYCLE_ROLES } from "@/data/planBlueprints";
import { resolvePlanDayContract, type PlanDayContractInput, type PlanLocale } from "@/lib/plan-core/dayContract";
import type { DayPlan, GeneratedPlan } from "@/types/plan";

export type { PlanLocale };

function getNextRoleLabel(day: number, locale: PlanLocale): string | null {
  const nextRole = PLAN_MICROCYCLE_ROLES.find((entry) => entry.day === Math.min(day + 1, 7));
  if (!nextRole) {
    return null;
  }

  return locale === "en" ? nextRole.labelEn : nextRole.labelZh;
}

function buildFailureCue(day: Pick<DayPlan, "focus">, locale: PlanLocale): string {
  return locale === "en"
    ? `If ${day.focus.toLowerCase()} starts to rush or lose shape, slow down and reset the rep before adding difficulty.`
    : `一旦${day.focus}开始着急或走样，就先降速重置，不要继续加难度。`;
}

function buildProgressionNote(day: Pick<DayPlan, "day" | "focus">, locale: PlanLocale): string {
  const nextRoleLabel = getNextRoleLabel(day.day, locale);

  if (locale === "en") {
    return nextRoleLabel
      ? `If this step holds, carry ${day.focus.toLowerCase()} into the next-step ${nextRoleLabel} block.`
      : `Carry ${day.focus.toLowerCase()} forward as the baseline rule for the next training block.`;
  }

  return nextRoleLabel
    ? `如果这一步能稳住，就把${day.focus}带进下一步的${nextRoleLabel}。`
    : `把${day.focus}保留成下一轮训练继续沿用的基线规则。`;
}

function buildTransferCue(day: Pick<DayPlan, "focus">, locale: PlanLocale): string {
  return locale === "en"
    ? `Carry ${day.focus.toLowerCase()} into the first playable point pattern.`
    : `把${day.focus}带进第一组可打的得分片段里。`;
}

export function withDeterministicDayContract(day: PlanDayContractInput, locale: PlanLocale): DayPlan {
  return resolvePlanDayContract({
    ...day,
    failureCue: day.failureCue?.trim() || buildFailureCue(day, locale),
    progressionNote: day.progressionNote?.trim() || buildProgressionNote(day, locale),
    transferCue: day.transferCue?.trim() || buildTransferCue(day, locale)
  }, locale);
}

export function withPlanDayContract(plan: GeneratedPlan, locale: PlanLocale): GeneratedPlan {
  return {
    ...plan,
    days: plan.days.map((day) => withDeterministicDayContract(day, locale))
  };
}
