import type { ProblemTag } from "@/types/problemTag";

export type GuidanceStrokeFamily =
  | "forehand"
  | "backhand"
  | "serve"
  | "return"
  | "volley"
  | "overhead"
  | "slice"
  | "general";

export type GuidanceMechanismFamily =
  | "contact_window"
  | "rhythm"
  | "spacing"
  | "pressure_regulation"
  | "positioning"
  | "decision"
  | "recovery"
  | "shape_control";

export type GuidanceSkillBand = "2.5" | "3.0" | "3.5" | "4.0" | "4.0+";

export type GuidancePlanIntent =
  | "assessment_priority"
  | "stabilize_primary_pattern"
  | "stabilize_under_pressure"
  | "arrive_earlier"
  | "rebuild_mechanics"
  | "organize_tactics";

export type GuidanceLanguagePreference = "zh" | "en";

export type GuidanceContext = {
  source: "diagnosis";
  primaryProblemTag: ProblemTag;
  secondaryProblemTags: ProblemTag[];
  strokeFamily: GuidanceStrokeFamily;
  mechanismFamily: GuidanceMechanismFamily;
  skillBand: GuidanceSkillBand;
  languagePreference: GuidanceLanguagePreference;
  planIntent: GuidancePlanIntent;
  trainingFocus: string;
  sourceInput?: string;
};
