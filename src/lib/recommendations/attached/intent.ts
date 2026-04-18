import { canonicalizeTennisText } from "@/lib/i18n/tennisGlossary";
import type { AttachedRecommendationRequest } from "@/lib/recommendations/attached/recommend";
import type {
  TeachingInstructionalRole,
  TeachingRetrievalIntent
} from "@/types/teachingRecommendation";

function normalizeTerm(value: string, locale: "zh" | "en"): string {
  return canonicalizeTennisText(value.replace(/_/g, " ").trim(), locale).trim().toLowerCase();
}

function uniqueClean(values: Array<string | null | undefined>, locale: "zh" | "en"): string[] {
  const normalized = values
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .map((value) => normalizeTerm(value, locale))
    .filter((value) => value.length > 0);

  return Array.from(new Set(normalized));
}

function inferPreferredRoles(request: AttachedRecommendationRequest): TeachingInstructionalRole[] {
  if (request.stepRole === "pressure_repetition") {
    return ["drill", "mental", "primary_fix", "explanation"];
  }
  if (request.stepRole === "transfer") {
    return ["tactic", "primary_fix", "explanation", "drill"];
  }
  if (request.stepRole === "review_reset") {
    return ["explanation", "mental", "primary_fix", "drill"];
  }

  switch (request.guidanceContext.planIntent) {
    case "stabilize_under_pressure":
      return ["primary_fix", "drill", "mental", "explanation"];
    case "arrive_earlier":
      return ["primary_fix", "drill", "explanation"];
    case "rebuild_mechanics":
      return ["primary_fix", "explanation", "drill"];
    case "organize_tactics":
      return ["tactic", "explanation", "primary_fix", "drill"];
    case "stabilize_primary_pattern":
      return ["primary_fix", "drill", "explanation"];
    case "assessment_priority":
    default:
      return ["primary_fix", "explanation", "drill"];
  }
}

function inferQuerySpecificity(input: {
  rawInput: string;
  lexicalTerms: string[];
  trainingFocus: string;
}): TeachingRetrievalIntent["querySpecificity"] {
  const text = `${input.rawInput} ${input.trainingFocus} ${input.lexicalTerms.join(" ")}`;
  const hasContext = /关键分|比赛|二发|接发|跑动|网前|双打|前四拍|pressure|match|second serve|return|on the run|first four shots|build point/i.test(text);
  const hasMechanism = /节奏|击球点|抛球|脚步|站位|决策|分腿垫步|回位|被球挤到|timing|rhythm|contact|toss|spacing|routine|split step|recovery|jammed/i.test(text);

  if (hasContext && hasMechanism) return "high";
  if (hasContext || hasMechanism) return "medium";
  return "low";
}

export function buildTeachingRetrievalIntent(
  request: AttachedRecommendationRequest
): TeachingRetrievalIntent {
  const locale = request.guidanceContext.languagePreference;
  const rawInput = request.guidanceContext.sourceInput ?? request.guidanceContext.trainingFocus;
  const lexicalTerms = uniqueClean(request.lexicalTerms ?? [], locale);
  const symptomTerms = uniqueClean([
    rawInput,
    request.guidanceContext.trainingFocus,
    request.guidanceContext.primaryProblemTag,
    ...request.guidanceContext.secondaryProblemTags,
    ...lexicalTerms
  ], locale);
  const causeCandidates = uniqueClean([
    request.guidanceContext.mechanismFamily,
    request.guidanceContext.planIntent,
    ...lexicalTerms
  ], locale);
  const fixTargets = uniqueClean([
    request.guidanceContext.trainingFocus,
    request.guidanceContext.planIntent.replace(/_/g, " "),
    request.guidanceContext.strokeFamily,
    request.guidanceContext.mechanismFamily,
    ...lexicalTerms
  ], locale);
  const drillTargets = uniqueClean([
    request.guidanceContext.trainingFocus,
    request.guidanceContext.strokeFamily,
    request.guidanceContext.mechanismFamily,
    ...lexicalTerms.filter((term) => /练|drill|reps|tempo|beat|routine|脚步|split|contact|timing|jammed|挤到|回位|recover|前四拍|pattern/.test(term))
  ], locale);
  const contextTerms = uniqueClean([
    request.guidanceContext.planIntent,
    request.guidanceContext.strokeFamily,
    request.guidanceContext.mechanismFamily,
    ...lexicalTerms
  ], locale);

  return {
    source: request.source,
    rawInput,
    normalizedInput: normalizeTerm(rawInput, locale),
    primaryProblemTag: request.guidanceContext.primaryProblemTag,
    secondaryProblemTags: request.guidanceContext.secondaryProblemTags,
    strokeFamily: request.guidanceContext.strokeFamily,
    mechanismFamily: request.guidanceContext.mechanismFamily,
    skillBand: request.guidanceContext.skillBand,
    languagePreference: request.guidanceContext.languagePreference,
    symptomTerms,
    causeCandidates,
    fixTargets,
    drillTargets,
    contextTerms,
    planIntent: request.guidanceContext.planIntent,
    trainingFocus: request.guidanceContext.trainingFocus,
    preferredRoles: inferPreferredRoles(request),
    requiredIds: Array.from(new Set(request.requiredIds ?? [])),
    preferredIds: Array.from(new Set(request.preferredIds ?? [])),
    supportIds: Array.from(new Set(request.supportIds ?? [])),
    querySpecificity: inferQuerySpecificity({
      rawInput,
      lexicalTerms,
      trainingFocus: request.guidanceContext.trainingFocus
    }),
    maxResults: request.maxResults ?? 3,
    guidanceContext: request.guidanceContext
  };
}
