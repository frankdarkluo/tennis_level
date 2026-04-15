import { PLAN_MICROCYCLE_ROLES } from "@/data/planBlueprints";
import {
  inferGuidanceMechanismFamily,
  inferGuidanceStrokeFamily
} from "@/lib/guidance-context/build";
import type { PlanLevel, PlanContext, PlanIntent, PlanMechanismFamily, PlanSkillFamily, PlanTemplate } from "@/types/plan";
import type { ProblemTag } from "@/types/problemTag";

function inferSkillFamily(problemTag: string, planContext: PlanContext | null): PlanSkillFamily {
  const normalized = `${problemTag} ${planContext?.primaryProblemTag ?? ""}`.toLowerCase();

  if (/serve|toss|double/.test(normalized)) return "serve";
  if (/return/.test(normalized)) return "return";
  if (/forehand|moonball|balls-too-short/.test(normalized)) return "forehand";
  if (/backhand|slice/.test(normalized)) return "backhand";
  if (/volley|half-volley|half_volley|doubles|poach|formation|net-confidence|net-/.test(normalized)) return "net";
  if (/overhead|lob/.test(normalized)) return "overhead";
  if (/movement|mobility|late-contact|running|on-the-run|recovery|stamina|fatigue/.test(normalized)) return "movement";
  if (/pressure|anxiety|tight|safe-short|key-point/.test(normalized)) return "mental";
  if (/tactic|pattern|construction|ball-selection|decision/.test(normalized)) return "tactics";
  return "general";
}

function inferMechanismFamily(problemTag: string, planContext: PlanContext | null): PlanMechanismFamily {
  const normalized = `${problemTag} ${planContext?.primaryProblemTag ?? ""}`.toLowerCase();

  if (/key-point-indecision|point-construction|pattern|ball-selection|decision/.test(normalized)) return "decision";
  if (/pressure|anxiety|tight/.test(normalized)) return "pressure_regulation";
  if (/doubles-positioning|doubles-formation|poach|position|coverage|overhead-spacing/.test(normalized)) return "positioning";
  if (/movement|mobility|running|on-the-run|recovery|stamina|fatigue/.test(normalized)) return "recovery";
  if (/half-volley|half_volley|spacing|distance|jammed/.test(normalized)) return "spacing";
  if (/toss|serve|second-serve|rhythm/.test(normalized)) return "rhythm";
  if (/out|long|net|contact|short/.test(normalized)) return "contact_window";
  return "shape_control";
}

export function buildPlanIntent(input: {
  source: PlanIntent["source"];
  problemTag: ProblemTag;
  level: PlanLevel;
  locale: PlanIntent["locale"];
  candidateContentIds?: string[];
  primaryNextStep?: string;
  planContext?: PlanContext | null;
  guidanceContext?: PlanIntent["guidanceContext"];
  templateSeed?: PlanTemplate | null;
  deepContext?: PlanIntent["deepContext"];
}): PlanIntent {
  const planContext = input.planContext ?? null;
  const guidanceContext = input.guidanceContext ?? null;
  const microcycle = PLAN_MICROCYCLE_ROLES.map((entry) => entry.role);
  const inferredStrokeFamily = guidanceContext?.strokeFamily ?? inferGuidanceStrokeFamily({
    problemTag: input.problemTag,
    deepContext: input.deepContext ?? null
  });
  const inferredMechanismFamily = guidanceContext?.mechanismFamily ?? inferGuidanceMechanismFamily({
    problemTag: input.problemTag,
    primaryNextStep: input.primaryNextStep,
    planContext,
    deepContext: input.deepContext ?? null
  });

  return {
    source: input.source,
    locale: input.locale,
    levelBand: input.level,
    primaryProblemTag: input.problemTag,
    skillFamily: guidanceContext
      ? inferSkillFamily(`${input.problemTag} ${inferredStrokeFamily}`, planContext)
      : inferSkillFamily(input.problemTag, planContext),
    mechanismFamily: guidanceContext
      ? inferredMechanismFamily
      : inferMechanismFamily(input.problemTag, planContext),
    primaryWeakness: planContext?.weakDimensions?.[0],
    secondaryWeakness: planContext?.weakDimensions?.[1] ?? planContext?.observationDimensions?.[0],
    playStyle: planContext?.playStyle,
    playContext: planContext?.playContext,
    primaryNextStep: input.primaryNextStep?.trim() || undefined,
    candidateContentIds: input.candidateContentIds ?? [],
    planContext,
    guidanceContext,
    templateSeed: input.templateSeed ?? null,
    deepContext: input.deepContext ?? null,
    microcycle
  };
}
