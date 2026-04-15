import type { DayPlan, PlanStepAttachments, PlanStepDetails } from "@/types/plan";
import { canonicalizeTennisText } from "@/lib/i18n/tennisGlossary";

export type PlanLocale = "zh" | "en";

export type PlanDayContractInput = Omit<DayPlan, "details" | "attachments"> & {
  details?: Partial<PlanStepDetails>;
  attachments?: Partial<PlanStepAttachments>;
};

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const normalized = value?.trim();
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    result.push(normalized);
  }

  return result;
}

function canonicalizeValue(value: string, locale: PlanLocale) {
  return canonicalizeTennisText(value.trim(), locale);
}

function canonicalizeList(values: string[], locale: PlanLocale) {
  return uniqueStrings(values.map((value) => canonicalizeValue(value, locale)));
}

function canonicalizeBlock(
  block: DayPlan["warmupBlock"],
  locale: PlanLocale
): DayPlan["warmupBlock"] {
  return {
    title: canonicalizeValue(block.title, locale),
    items: canonicalizeList(block.items, locale)
  };
}

function buildSetup(day: PlanDayContractInput, locale: PlanLocale): string {
  const explicitSetup = day.details?.setup?.trim();
  if (explicitSetup) {
    return explicitSetup;
  }

  const warmupItems = uniqueStrings(day.warmupBlock.items);
  const mainLead = day.mainBlock.items[0]?.trim();
  const setupItems = uniqueStrings([
    ...warmupItems,
    mainLead && !warmupItems.includes(mainLead)
      ? (locale === "en" ? `move into ${mainLead}` : `进入主练：${mainLead}`)
      : null
  ]);

  if (setupItems.length > 0) {
    return setupItems.join(locale === "en" ? " Then " : "；");
  }

  return locale === "en"
    ? `Set the first rep for ${day.focus.toLowerCase()} before adding pace.`
    : `先把${day.focus}这一步布置好，再开始加速度。`;
}

function buildDosage(day: PlanDayContractInput, locale: PlanLocale): string {
  const explicitDosage = day.details?.dosage?.trim();
  if (explicitDosage) {
    return explicitDosage;
  }

  const load = day.load?.trim();
  const duration = day.duration?.trim();

  if (load && duration && load !== duration) {
    return `${load} · ${duration}`;
  }

  if (load) {
    return load;
  }

  if (duration) {
    return duration;
  }

  return locale === "en" ? "Repeat until the shape stays stable." : "重复到动作稳定为止。";
}

function buildFocusCues(day: PlanDayContractInput, locale: PlanLocale): string[] {
  const cues = uniqueStrings([
    ...(day.details?.focusCues ?? []),
    day.executionFocus,
    day.pressureBlock.items[0],
    day.transferCue
  ]);

  if (cues.length > 0) {
    return cues;
  }

  return [
    locale === "en"
      ? `Stay with ${day.focus.toLowerCase()} before changing anything else.`
      : `先把${day.focus}稳住，再谈别的变化。`
  ];
}

function buildCommonMistakes(day: PlanDayContractInput, locale: PlanLocale): string[] {
  const mistakes = uniqueStrings([
    ...(day.details?.commonMistakes ?? []),
    day.failureCue
  ]);

  if (mistakes.length > 0) {
    return mistakes;
  }

  return [
    locale === "en"
      ? `Do not speed up before ${day.focus.toLowerCase()} feels repeatable.`
      : `别在${day.focus}还不稳的时候先加速度。`
  ];
}

function buildSuccessCriteria(day: PlanDayContractInput, locale: PlanLocale): string[] {
  const successCriteria = uniqueStrings([
    ...(day.details?.successCriteria ?? []),
    ...day.successCriteria
  ]);

  if (successCriteria.length > 0) {
    return successCriteria;
  }

  return [
    locale === "en"
      ? `Finish the step with repeatable mechanics.`
      : `完成这一步时动作仍然可重复。`
  ];
}

function buildAttachments(day: PlanDayContractInput): PlanStepAttachments {
  const explicitPrimary = day.attachments?.primaryContentId?.trim();
  const explicitBackup = day.attachments?.backupContentId?.trim();
  const candidateIds = uniqueStrings(day.contentIds);
  const primaryContentId = explicitPrimary ?? candidateIds[0] ?? null;
  const backupContentId = explicitBackup && explicitBackup !== primaryContentId
    ? explicitBackup
    : candidateIds.find((id) => id !== primaryContentId) ?? null;

  return {
    primaryContentId,
    backupContentId
  };
}

export function resolvePlanDayContract(day: PlanDayContractInput, locale: PlanLocale): DayPlan {
  const details: PlanStepDetails = {
    goal: canonicalizeValue(day.details?.goal?.trim() || day.goal.trim() || day.focus.trim(), locale),
    setup: canonicalizeValue(buildSetup(day, locale), locale),
    dosage: canonicalizeValue(buildDosage(day, locale), locale),
    focusCues: canonicalizeList(buildFocusCues(day, locale), locale),
    commonMistakes: canonicalizeList(buildCommonMistakes(day, locale), locale),
    successCriteria: canonicalizeList(buildSuccessCriteria(day, locale), locale)
  };

  return {
    ...day,
    focus: canonicalizeValue(day.focus, locale),
    drills: canonicalizeList(day.drills, locale),
    drill: day.drill ? canonicalizeValue(day.drill, locale) : day.drill,
    load: day.load ? canonicalizeValue(day.load, locale) : day.load,
    executionFocus: day.executionFocus ? canonicalizeValue(day.executionFocus, locale) : day.executionFocus,
    duration: canonicalizeValue(day.duration, locale),
    goal: canonicalizeValue(day.goal, locale),
    warmupBlock: canonicalizeBlock(day.warmupBlock, locale),
    mainBlock: canonicalizeBlock(day.mainBlock, locale),
    pressureBlock: canonicalizeBlock(day.pressureBlock, locale),
    successCriteria: canonicalizeList(day.successCriteria, locale),
    failureCue: canonicalizeValue(day.failureCue, locale),
    progressionNote: canonicalizeValue(day.progressionNote, locale),
    transferCue: canonicalizeValue(day.transferCue, locale),
    linkedContentReason: day.linkedContentReason ? canonicalizeValue(day.linkedContentReason, locale) : day.linkedContentReason,
    details,
    attachments: buildAttachments(day),
    motionPrimitiveId: day.motionPrimitiveId ?? null
  };
}
