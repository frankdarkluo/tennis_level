import type { ProblemTag } from "@/types/problemTag";
import type {
  GuidanceContext,
  GuidanceLanguagePreference,
  GuidanceMechanismFamily,
  GuidancePlanIntent,
  GuidanceSkillBand,
  GuidanceStrokeFamily
} from "@/lib/guidance-context/types";

const VALID_STROKE_FAMILIES = new Set<GuidanceStrokeFamily>([
  "forehand",
  "backhand",
  "serve",
  "return",
  "volley",
  "overhead",
  "slice",
  "general"
]);

const VALID_MECHANISM_FAMILIES = new Set<GuidanceMechanismFamily>([
  "contact_window",
  "rhythm",
  "spacing",
  "pressure_regulation",
  "positioning",
  "decision",
  "recovery",
  "shape_control"
]);

const VALID_SKILL_BANDS = new Set<GuidanceSkillBand>(["2.5", "3.0", "3.5", "4.0", "4.0+"]);
const VALID_LANGUAGE_PREFERENCES = new Set<GuidanceLanguagePreference>(["zh", "en"]);
const VALID_PLAN_INTENTS = new Set<GuidancePlanIntent>([
  "assessment_priority",
  "stabilize_primary_pattern",
  "stabilize_under_pressure",
  "arrive_earlier",
  "rebuild_mechanics",
  "organize_tactics"
]);

function isProblemTagLike(value: unknown): value is ProblemTag {
  return typeof value === "string" && value.trim().length > 0;
}

export function assertGuidanceContext(context: GuidanceContext): GuidanceContext {
  if (!isProblemTagLike(context.primaryProblemTag)) {
    throw new Error("GuidanceContext requires a primaryProblemTag.");
  }

  if (!Array.isArray(context.secondaryProblemTags)) {
    throw new Error("GuidanceContext.secondaryProblemTags must be an array.");
  }

  if (!VALID_STROKE_FAMILIES.has(context.strokeFamily)) {
    throw new Error(`Unsupported GuidanceContext.strokeFamily: ${context.strokeFamily}`);
  }

  if (!VALID_MECHANISM_FAMILIES.has(context.mechanismFamily)) {
    throw new Error(`Unsupported GuidanceContext.mechanismFamily: ${context.mechanismFamily}`);
  }

  if (!VALID_SKILL_BANDS.has(context.skillBand)) {
    throw new Error(`Unsupported GuidanceContext.skillBand: ${context.skillBand}`);
  }

  if (!VALID_LANGUAGE_PREFERENCES.has(context.languagePreference)) {
    throw new Error(`Unsupported GuidanceContext.languagePreference: ${context.languagePreference}`);
  }

  if (!VALID_PLAN_INTENTS.has(context.planIntent)) {
    throw new Error(`Unsupported GuidanceContext.planIntent: ${context.planIntent}`);
  }

  if (!context.trainingFocus.trim()) {
    throw new Error("GuidanceContext requires a non-empty trainingFocus.");
  }

  return {
    ...context,
    secondaryProblemTags: Array.from(new Set(
      context.secondaryProblemTags.filter(
        (tag) => isProblemTagLike(tag) && tag !== context.primaryProblemTag
      )
    ))
  };
}
