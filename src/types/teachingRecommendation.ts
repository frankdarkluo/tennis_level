import type {
  GuidanceContext,
  GuidanceLanguagePreference,
  GuidanceMechanismFamily,
  GuidancePlanIntent,
  GuidanceSkillBand,
  GuidanceStrokeFamily
} from "@/lib/guidance-context/types";
import type { ProblemTag } from "@/types/problemTag";

export type TeachingGranularity = "video" | "segment";

export type TeachingRecommendationSlot = "primary" | "explanation" | "drill";

export type TeachingInstructionalRole =
  | "primary_fix"
  | "explanation"
  | "drill"
  | "tactic"
  | "mental"
  | "warmup"
  | "general";

export type TeachingMetadata = {
  contentId: string;
  granularity: TeachingGranularity;
  strokeFamily: GuidanceStrokeFamily;
  mechanismFamily: GuidanceMechanismFamily;
  instructionalRole: TeachingInstructionalRole;
  symptomTags: string[];
  causeTags: string[];
  fixTags: string[];
  drillTags: string[];
  contextTags: string[];
  naturalLanguageQueriesZh: string[];
  naturalLanguageQueriesEn: string[];
  specificityScore: number;
  actionabilityScore: number;
  diagnosticDepthScore: number;
  safetyScore: number;
  negativeTags?: string[];
  prerequisites?: string[];
};

export type TeachingRetrievalIntent = {
  source: "diagnosis" | "plan";
  rawInput: string;
  normalizedInput: string;
  primaryProblemTag: ProblemTag;
  secondaryProblemTags: ProblemTag[];
  strokeFamily: GuidanceStrokeFamily;
  mechanismFamily: GuidanceMechanismFamily;
  skillBand: GuidanceSkillBand;
  languagePreference: GuidanceLanguagePreference;
  symptomTerms: string[];
  causeCandidates: string[];
  fixTargets: string[];
  drillTargets: string[];
  contextTerms: string[];
  planIntent: GuidancePlanIntent;
  trainingFocus: string;
  preferredRoles: TeachingInstructionalRole[];
  requiredIds: string[];
  preferredIds: string[];
  supportIds: string[];
  querySpecificity: "low" | "medium" | "high";
  maxResults: number;
  guidanceContext: GuidanceContext;
};
