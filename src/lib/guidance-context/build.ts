import { assertGuidanceContext } from "@/lib/guidance-context/assert";
import type {
  GuidanceContext,
  GuidanceLanguagePreference,
  GuidanceMechanismFamily,
  GuidancePlanIntent,
  GuidanceSkillBand,
  GuidanceStrokeFamily
} from "@/lib/guidance-context/types";
import { getPlanLookupProblemTags, normalizePlanProblemTag, normalizePlanProblemTags } from "@/lib/plan-core/problemTagSupport";
import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import type { PlanContext } from "@/types/plan";
import type { ProblemTag } from "@/types/problemTag";

type RawGuidanceContext = Partial<GuidanceContext> & {
  primaryProblemTag?: string | null;
};

function uniqueProblemTags(values: string[], primaryProblemTag: ProblemTag): ProblemTag[] {
  return normalizePlanProblemTags(values).filter((tag) => tag !== primaryProblemTag);
}

function normalizeSkillBand(value?: string | null): GuidanceSkillBand {
  if (value === "2.5" || value === "3.0" || value === "3.5" || value === "4.0" || value === "4.0+") {
    return value;
  }

  if (value === "4.5") {
    return "4.0+";
  }

  return "3.0";
}

function normalizeLanguagePreference(value?: string | null): GuidanceLanguagePreference {
  return value === "en" ? "en" : "zh";
}

function guessStrokeFamily(problemTag: string): GuidanceStrokeFamily {
  if (/serve|double/.test(problemTag)) return "serve";
  if (/return/.test(problemTag)) return "return";
  if (/overhead|lob/.test(problemTag)) return "overhead";
  if (/slice/.test(problemTag)) return "slice";
  if (/backhand/.test(problemTag)) return "backhand";
  if (/volley|net-|doubles-|half-volley/.test(problemTag)) return "volley";
  if (/forehand|topspin|moonball|balls-too-short/.test(problemTag)) return "forehand";
  return "general";
}

export function inferGuidanceStrokeFamily(input: {
  problemTag: string;
  deepContext?: EnrichedDiagnosisContext | null;
}): GuidanceStrokeFamily {
  if (input.deepContext?.strokeFamily && input.deepContext.strokeFamily !== "general") {
    if (input.deepContext.strokeFamily === "volley") {
      return "volley";
    }

    return input.deepContext.strokeFamily;
  }

  return guessStrokeFamily(input.problemTag.toLowerCase());
}

export function inferGuidanceMechanismFamily(input: {
  problemTag: string;
  primaryNextStep?: string | null;
  planContext?: PlanContext | null;
  deepContext?: EnrichedDiagnosisContext | null;
}): GuidanceMechanismFamily {
  if (input.deepContext?.serveMechanismFamily === "toss" || input.deepContext?.serveMechanismFamily === "rhythm") {
    return "rhythm";
  }

  if (input.deepContext?.serveMechanismFamily === "contact") {
    return "contact_window";
  }

  if (input.deepContext?.serveMechanismFamily === "direction_control") {
    return "shape_control";
  }

  const normalized = [
    input.problemTag,
    input.planContext?.primaryProblemTag ?? "",
    input.primaryNextStep ?? ""
  ]
    .join(" ")
    .toLowerCase();

  if (/key-point-indecision|point-construction|pattern|ball-selection|decision|tactic|formation/.test(normalized)) {
    return "decision";
  }

  if (
    input.planContext?.pressureContext === "high" ||
    input.deepContext?.pressureContext === "key_points" ||
    /pressure|anxiety|tight|nerves?|confidence/.test(normalized)
  ) {
    return "pressure_regulation";
  }

  if (/doubles-positioning|poach|position|coverage|spacing behind the ball|overhead-spacing/.test(normalized)) {
    return "positioning";
  }

  if (
    input.planContext?.movementContext === "moving" ||
    input.deepContext?.movement === "moving" ||
    /movement|mobility|running|on-the-run|recovery|stamina|fatigue/.test(normalized)
  ) {
    return "recovery";
  }

  if (/half-volley|spacing|distance|jammed/.test(normalized)) {
    return "spacing";
  }

  if (/rally-consistency|consistency|plateau|general-improvement/.test(normalized)) {
    return "rhythm";
  }

  if (/toss|serve|second-serve|rhythm|timing/.test(normalized)) {
    return "rhythm";
  }

  if (/out|long|net|contact|short|point in front/.test(normalized)) {
    return "contact_window";
  }

  return "shape_control";
}

export function inferGuidancePlanIntent(input: {
  problemTag: string;
  planContext?: PlanContext | null;
  deepContext?: EnrichedDiagnosisContext | null;
  mechanismFamily: GuidanceMechanismFamily;
}): GuidancePlanIntent {
  if (input.planContext?.source === "assessment") {
    return "assessment_priority";
  }

  if (input.planContext?.pressureContext === "high" || input.deepContext?.pressureContext === "key_points") {
    return "stabilize_under_pressure";
  }

  if (
    input.planContext?.movementContext === "moving" ||
    input.deepContext?.movement === "moving" ||
    /late-contact|running|movement|recovery/.test(input.problemTag)
  ) {
    return "arrive_earlier";
  }

  if (
    input.mechanismFamily === "decision" ||
    /doubles|formation|construction|pattern|tactic|indecision/.test(input.problemTag)
  ) {
    return "organize_tactics";
  }

  if (
    input.mechanismFamily === "contact_window" ||
    input.mechanismFamily === "rhythm" ||
    input.mechanismFamily === "spacing" ||
    input.mechanismFamily === "shape_control"
  ) {
    return "rebuild_mechanics";
  }

  return "stabilize_primary_pattern";
}

function deriveSecondaryProblemTags(input: {
  primaryProblemTag: ProblemTag;
  planContext?: PlanContext | null;
  deepContext?: EnrichedDiagnosisContext | null;
}): ProblemTag[] {
  const candidates = [
    ...getPlanLookupProblemTags(input.primaryProblemTag),
    ...(input.planContext?.pressureContext === "high" ? ["pressure-tightness", "match-anxiety"] : []),
    ...(input.planContext?.movementContext === "moving" ? ["late-contact", "movement-slow", "recovery-delay"] : []),
    ...(input.planContext?.incomingBallDepth === "deep" ? ["late-contact", "balls-too-short"] : []),
    ...(input.deepContext?.pressureContext === "key_points" ? ["pressure-tightness", "key-point-indecision"] : []),
    ...(input.deepContext?.movement === "moving" ? ["late-contact", "movement-slow"] : []),
    ...(input.deepContext?.incomingBallDepth === "deep" ? ["late-contact", "balls-too-short"] : [])
  ];

  return uniqueProblemTags(candidates, input.primaryProblemTag);
}

function deriveTrainingFocus(primaryNextStep?: string | null, problemTag?: string): string {
  const normalizedPrimaryNextStep = primaryNextStep?.trim();
  if (normalizedPrimaryNextStep) {
    return normalizedPrimaryNextStep;
  }

  if (problemTag) {
    return problemTag.replace(/-/g, " ");
  }

  return "stabilize the primary next step";
}

export function normalizeGuidanceContext(raw: RawGuidanceContext | null | undefined): GuidanceContext | null {
  if (!raw?.primaryProblemTag) {
    return null;
  }

  const primaryProblemTag = normalizePlanProblemTag(raw.primaryProblemTag);
  const guidanceContext: GuidanceContext = {
    source: "diagnosis",
    primaryProblemTag,
    secondaryProblemTags: uniqueProblemTags(raw.secondaryProblemTags ?? [], primaryProblemTag),
    strokeFamily: raw.strokeFamily ?? "general",
    mechanismFamily: raw.mechanismFamily ?? "contact_window",
    skillBand: normalizeSkillBand(raw.skillBand),
    languagePreference: normalizeLanguagePreference(raw.languagePreference),
    planIntent: raw.planIntent ?? "stabilize_primary_pattern",
    trainingFocus: deriveTrainingFocus(raw.trainingFocus, primaryProblemTag),
    ...(raw.sourceInput?.trim() ? { sourceInput: raw.sourceInput.trim() } : {})
  };

  return assertGuidanceContext(guidanceContext);
}

export function parseGuidanceContext(raw: string | null | undefined): GuidanceContext | null {
  if (!raw) {
    return null;
  }

  try {
    return normalizeGuidanceContext(JSON.parse(raw) as RawGuidanceContext);
  } catch {
    return null;
  }
}

export function encodeGuidanceContext(guidanceContext?: GuidanceContext | null): string | null {
  const normalized = normalizeGuidanceContext(guidanceContext);
  return normalized ? JSON.stringify(normalized) : null;
}

export function buildDiagnosisGuidanceContext(input: {
  problemTag: string;
  level?: string | null;
  locale?: string | null;
  primaryNextStep?: string | null;
  diagnosisInput?: string | null;
  planContext?: PlanContext | null;
  deepContext?: EnrichedDiagnosisContext | null;
}): GuidanceContext {
  const primaryProblemTag = normalizePlanProblemTag(input.problemTag);
  const strokeFamily = inferGuidanceStrokeFamily({
    problemTag: primaryProblemTag,
    deepContext: input.deepContext
  });
  const mechanismFamily = inferGuidanceMechanismFamily({
    problemTag: primaryProblemTag,
    primaryNextStep: input.primaryNextStep,
    planContext: input.planContext,
    deepContext: input.deepContext
  });

  return assertGuidanceContext({
    source: "diagnosis",
    primaryProblemTag,
    secondaryProblemTags: deriveSecondaryProblemTags({
      primaryProblemTag,
      planContext: input.planContext,
      deepContext: input.deepContext
    }),
    strokeFamily,
    mechanismFamily,
    skillBand: normalizeSkillBand(input.level ?? input.planContext?.levelBand),
    languagePreference: normalizeLanguagePreference(input.locale),
    planIntent: inferGuidancePlanIntent({
      problemTag: primaryProblemTag,
      planContext: input.planContext,
      deepContext: input.deepContext,
      mechanismFamily
    }),
    trainingFocus: deriveTrainingFocus(input.primaryNextStep, primaryProblemTag),
    ...(input.diagnosisInput?.trim() ? { sourceInput: input.diagnosisInput.trim() } : {})
  });
}
