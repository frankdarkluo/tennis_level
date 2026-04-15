import type { DayPlan, DayPlanBlock, GeneratedPlan } from "@/types/plan";

export type PlanCopyLocale = "zh" | "en";

const EN_COPY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\b7-day\b/gi, "7-step"],
  [/\bseven days\b/gi, "7 steps"],
  [/\bDay (\d+)\b/g, "Step $1"],
  [/\btoday['’]s\b/gi, "this step's"],
  [/\btomorrow['’]s\b/gi, "next step's"],
  [/\bnext week['’]s\b/gi, "the next training block's"],
  [/\bthis week['’]s\b/gi, "this plan's"],
  [/\bweek['’]s\b/gi, "sequence's"],
  [/\btoday\b/gi, "this step"],
  [/\btomorrow\b/gi, "the next step"],
  [/\bthis week\b/gi, "this plan"],
  [/\bnext week\b/gi, "the next training block"],
  [/\bover the week\b/gi, "across the full sequence"],
  [/\bfor the week\b/gi, "for the full sequence"],
  [/\bwithin one week\b/gi, "across the 7-step sequence"],
  [/\bone week\b/gi, "the full sequence"]
];

const ZH_COPY_REPLACEMENTS: Array<[RegExp, string]> = [
  [/7天/g, "7 步"],
  [/第\s*(\d+)\s*天/g, "第 $1 步"],
  [/今天的/g, "这一步的"],
  [/明天的/g, "下一步的"],
  [/今天/g, "这一步"],
  [/明天/g, "下一步"],
  [/本周计划/g, "这套 7 步计划"],
  [/本周的/g, "这套计划的"],
  [/本周/g, "这套计划"],
  [/这周的/g, "这套计划的"],
  [/这周/g, "这套计划"],
  [/下一周/g, "下一轮训练"],
  [/下周/g, "下一轮训练"],
  [/一周内/g, "按这 7 步"],
  [/用一周/g, "按这 7 步"],
  [/一周/g, "7 步"]
];

const EN_BANNED_WEEKLY_PATTERNS = [/\bweek\b/i, /this week/i, /next week/i, /within one week/i];
const ZH_BANNED_WEEKLY_PATTERNS = [/本周/, /这周/, /一周/];

export function normalizePlanCopyText(value: string, locale: PlanCopyLocale): string {
  const normalized = value.trim();
  if (!normalized) {
    return normalized;
  }

  const replacements = locale === "en" ? EN_COPY_REPLACEMENTS : ZH_COPY_REPLACEMENTS;
  return replacements.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), normalized);
}

function normalizePlanCopyBlock(block: DayPlanBlock, locale: PlanCopyLocale): DayPlanBlock {
  return {
    title: normalizePlanCopyText(block.title, locale),
    items: block.items.map((item) => normalizePlanCopyText(item, locale))
  };
}

function normalizePlanCopyDay(day: DayPlan, locale: PlanCopyLocale): DayPlan {
  return {
    ...day,
    focus: normalizePlanCopyText(day.focus, locale),
    drills: day.drills.map((drill) => normalizePlanCopyText(drill, locale)),
    drill: day.drill ? normalizePlanCopyText(day.drill, locale) : day.drill,
    load: day.load ? normalizePlanCopyText(day.load, locale) : day.load,
    executionFocus: day.executionFocus ? normalizePlanCopyText(day.executionFocus, locale) : day.executionFocus,
    linkedContentReason: day.linkedContentReason ? normalizePlanCopyText(day.linkedContentReason, locale) : day.linkedContentReason,
    goal: normalizePlanCopyText(day.goal, locale),
    warmupBlock: normalizePlanCopyBlock(day.warmupBlock, locale),
    mainBlock: normalizePlanCopyBlock(day.mainBlock, locale),
    pressureBlock: normalizePlanCopyBlock(day.pressureBlock, locale),
    successCriteria: day.successCriteria.map((criteria) => normalizePlanCopyText(criteria, locale)),
    failureCue: normalizePlanCopyText(day.failureCue, locale),
    progressionNote: normalizePlanCopyText(day.progressionNote, locale),
    transferCue: normalizePlanCopyText(day.transferCue, locale),
    details: day.details
      ? {
          goal: normalizePlanCopyText(day.details.goal, locale),
          setup: normalizePlanCopyText(day.details.setup, locale),
          dosage: normalizePlanCopyText(day.details.dosage, locale),
          focusCues: day.details.focusCues.map((cue) => normalizePlanCopyText(cue, locale)),
          commonMistakes: day.details.commonMistakes.map((mistake) => normalizePlanCopyText(mistake, locale)),
          successCriteria: day.details.successCriteria.map((criteria) => normalizePlanCopyText(criteria, locale))
        }
      : day.details,
    attachments: day.attachments ? { ...day.attachments } : day.attachments,
    motionPrimitiveId: day.motionPrimitiveId ?? null
  };
}

export function normalizeGeneratedPlanCopy(plan: GeneratedPlan, locale: PlanCopyLocale): GeneratedPlan {
  return {
    ...plan,
    title: normalizePlanCopyText(plan.title, locale),
    target: normalizePlanCopyText(plan.target, locale),
    summary: plan.summary ? normalizePlanCopyText(plan.summary, locale) : plan.summary,
    days: plan.days.map((day) => normalizePlanCopyDay(day, locale))
  };
}

export function collectPlanCopyViolations(plan: GeneratedPlan, locale: PlanCopyLocale): string[] {
  const normalizedPlan = normalizeGeneratedPlanCopy(plan, locale);
  const bannedPatterns = locale === "en" ? EN_BANNED_WEEKLY_PATTERNS : ZH_BANNED_WEEKLY_PATTERNS;
  const fields = [
    normalizedPlan.title,
    normalizedPlan.target,
    normalizedPlan.summary ?? "",
    ...normalizedPlan.days.flatMap((day) => [
      day.focus,
      day.drill ?? "",
      day.load ?? "",
      day.executionFocus ?? "",
      day.linkedContentReason ?? "",
      day.goal,
      day.failureCue,
      day.progressionNote,
      day.transferCue,
      day.warmupBlock.title,
      ...day.warmupBlock.items,
      day.mainBlock.title,
      ...day.mainBlock.items,
      day.pressureBlock.title,
      ...day.pressureBlock.items,
      ...day.successCriteria,
      ...(day.details
        ? [
            day.details.goal,
            day.details.setup,
            day.details.dosage,
            ...day.details.focusCues,
            ...day.details.commonMistakes,
            ...day.details.successCriteria
          ]
        : [])
    ])
  ].filter(Boolean);

  return fields.filter((value) => bannedPatterns.some((pattern) => pattern.test(value)));
}
