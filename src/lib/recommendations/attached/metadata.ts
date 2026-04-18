import type { CatalogContentItem } from "@/lib/content-catalog/schema";
import type {
  GuidanceMechanismFamily,
  GuidanceStrokeFamily
} from "@/lib/guidance-context/types";
import type {
  TeachingInstructionalRole,
  TeachingMetadata
} from "@/types/teachingRecommendation";

function normalizeSearchTag(value: string): string {
  return value.replace(/_/g, " ").trim().toLowerCase();
}

export function buildTeachingSearchText(item: CatalogContentItem, metadata: TeachingMetadata | null): string {
  return [
    item.display.title,
    item.display.sourceTitle,
    item.display.originalTitle,
    item.display.summary,
    item.display.reason,
    item.display.coachReason,
    ...item.display.useCases,
    ...item.skillCategories,
    ...item.problemTags,
    ...(metadata?.symptomTags ?? []),
    ...(metadata?.causeTags ?? []),
    ...(metadata?.fixTags ?? []),
    ...(metadata?.drillTags ?? []),
    ...(metadata?.contextTags ?? []),
    ...(metadata?.naturalLanguageQueriesZh ?? []),
    ...(metadata?.naturalLanguageQueriesEn ?? [])
  ]
    .filter(Boolean)
    .map((value) => normalizeSearchTag(String(value)))
    .join(" ");
}

export function inferTeachingRole(
  item: CatalogContentItem,
  metadata: TeachingMetadata | null
): TeachingInstructionalRole {
  if (metadata?.instructionalRole) {
    return metadata.instructionalRole;
  }

  const text = buildTeachingSearchText(item, metadata);

  if (/(warm[- ]?up|热身|准备活动)/i.test(text)) return "warmup";
  if (/(pressure|mental|mindset|routine|关键分|紧张|手紧|心态)/i.test(text)) return "mental";
  if (/(drill|reps|follow along|跟练|练习|模板|模版|重复|训练组)/i.test(text)) return "drill";
  if (/(tactic|pattern|point construction|doubles|poach|战术|分点|站位|双打|前四拍)/i.test(text)) return "tactic";
  if (/(fix|correct|release|纠正|修正|解决|改掉|纠偏|释放|修好)/i.test(text)) return "primary_fix";
  if (/(how to|teaching|lesson|masterclass|basics|fundamentals|explanation|教学|讲解|精讲|基础|拆解|秘诀)/i.test(text)) {
    return "explanation";
  }

  if (item.teachingIntent === "teaching") {
    return "explanation";
  }

  return "general";
}

export function inferTeachingStrokeFamily(
  item: CatalogContentItem,
  metadata: TeachingMetadata | null
): GuidanceStrokeFamily {
  if (metadata?.strokeFamily) {
    return metadata.strokeFamily;
  }

  const text = buildTeachingSearchText(item, metadata);

  if (/(serve|second serve|toss|double fault|发球|二发|抛球)/i.test(text)) return "serve";
  if (/(return|return of serve|接发|接发球)/i.test(text)) return "return";
  if (/(volley|net|doubles|截击|网前|双打)/i.test(text)) return "volley";
  if (/(overhead|smash|高压|扣杀)/i.test(text)) return "overhead";
  if (/(slice|切削|切球)/i.test(text)) return "slice";
  if (/(backhand|反手)/i.test(text)) return "backhand";
  if (/(forehand|正手)/i.test(text)) return "forehand";
  return "general";
}

export function inferTeachingMechanismFamily(
  item: CatalogContentItem,
  metadata: TeachingMetadata | null
): GuidanceMechanismFamily {
  if (metadata?.mechanismFamily) {
    return metadata.mechanismFamily;
  }

  const text = buildTeachingSearchText(item, metadata);

  if (/(pressure|anxiety|tight|routine|关键分|紧张|手紧|心态)/i.test(text)) return "pressure_regulation";
  if (/(decision|pattern|point construction|战术|分点|前四拍|选择)/i.test(text)) return "decision";
  if (/(position|poach|doubles formation|站位|位置)/i.test(text)) return "positioning";
  if (/(recovery|footwork|movement|回位|脚步|移动|跑动)/i.test(text)) return "recovery";
  if (/(spacing|distance|jammed|挤到|距离|站不开)/i.test(text)) return "spacing";
  if (/(rhythm|timing|beat|tempo|节奏|时机|节拍)/i.test(text)) return "rhythm";
  if (/(contact|window|in front|击球点|触球|击球窗口)/i.test(text)) return "contact_window";
  return "shape_control";
}

export function inferSpecificityScore(item: CatalogContentItem, metadata: TeachingMetadata | null): number {
  if (typeof metadata?.specificityScore === "number") {
    return metadata.specificityScore;
  }

  const text = buildTeachingSearchText(item, metadata);
  let score = 0.35;
  if (item.problemTags.length > 0) score += 0.15;
  if (item.display.useCases.length > 0) score += 0.15;
  if (/(二发|关键分|击球点|抛球|跑动|网前|双打|second serve|pressure|contact point|toss)/i.test(text)) score += 0.2;
  if (/(基础|basics|fundamentals|完整教学|masterclass)/i.test(text)) score -= 0.08;

  return Math.max(0, Math.min(1, score));
}

export function inferActionabilityScore(item: CatalogContentItem, metadata: TeachingMetadata | null): number {
  if (typeof metadata?.actionabilityScore === "number") {
    return metadata.actionabilityScore;
  }

  const text = buildTeachingSearchText(item, metadata);
  let score = 0.35;
  if (/(drill|reps|practice|跟练|练习|重复|训练|组|目标区|shadow|节拍|routine)/i.test(text)) score += 0.3;
  if (/(cue|checklist|step|步骤|提示|口诀|模板|模版)/i.test(text)) score += 0.15;
  if (item.teachingIntent === "teaching") score += 0.1;
  if (item.teachingIntent === "commentary") score -= 0.25;

  return Math.max(0, Math.min(1, score));
}

export function inferDiagnosticDepthScore(item: CatalogContentItem, metadata: TeachingMetadata | null): number {
  if (typeof metadata?.diagnosticDepthScore === "number") {
    return metadata.diagnosticDepthScore;
  }

  const text = buildTeachingSearchText(item, metadata);
  let score = 0.3;
  if (/(because|why|原因|为什么|根源|本质|导致)/i.test(text)) score += 0.3;
  if (/(timing|rhythm|spacing|decision|pressure|节奏|击球点|站位|决策|压力)/i.test(text)) score += 0.2;
  if (item.display.reason.length > 0 || item.display.coachReason.length > 0) score += 0.1;

  return Math.max(0, Math.min(1, score));
}
