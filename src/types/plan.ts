import { LevelBand, PlayContext, PlayStyle, ScoredDimension } from "@/types/assessment";
import { EnvironmentValue } from "@/types/environment";
import { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import type { GuidanceContext } from "@/lib/guidance-context/types";
import { ProblemTag } from "@/types/problemTag";

export type PlanLevel = "2.5" | "3.0" | "3.5" | "4.0" | "4.0+";
export type PlanContextSessionType = "match" | "practice" | "unknown";
export type PlanContextPressure = "high" | "some" | "unknown";
export type PlanContextMovement = "stationary" | "moving" | "unknown";
export type PlanContextDepth = "deep" | "unknown";
export type PlanContextOutcome = "net" | "long" | "no_control" | "weak" | "unknown";
export type PlanContextFeeling = "tight" | "nervous" | "rushed";
export type PlanSkillFamily =
  | "serve"
  | "return"
  | "forehand"
  | "backhand"
  | "net"
  | "overhead"
  | "movement"
  | "mental"
  | "tactics"
  | "general";
export type PlanMechanismFamily =
  | "contact_window"
  | "rhythm"
  | "spacing"
  | "pressure_regulation"
  | "positioning"
  | "decision"
  | "recovery"
  | "shape_control";
export type PlanBlueprintRole =
  | "stabilize"
  | "repeatable_mechanics"
  | "controlled_variability"
  | "review_reset"
  | "pressure_repetition"
  | "transfer"
  | "consolidation";

export type PlanContext = {
  source: "diagnosis" | "assessment";
  primaryProblemTag: ProblemTag;
  sessionType: PlanContextSessionType;
  pressureContext: PlanContextPressure;
  movementContext: PlanContextMovement;
  incomingBallDepth: PlanContextDepth;
  outcomePattern: PlanContextOutcome;
  feelingModifiers: PlanContextFeeling[];
  weakDimensions?: ScoredDimension[];
  observationDimensions?: ScoredDimension[];
  levelBand?: LevelBand;
  playStyle?: PlayStyle;
  playContext?: PlayContext;
  rationale?: string;
};

export type PlanIntensity = "low" | "medium" | "medium_high";

export type PlanTempo = "slow" | "controlled" | "match_70";

export type DayPlanBlock = {
  title: string;
  items: string[];
};

export type PlanStepDetails = {
  goal: string;
  setup: string;
  dosage: string;
  focusCues: string[];
  commonMistakes: string[];
  successCriteria: string[];
};

export type PlanStepAttachments = {
  primaryContentId: string | null;
  backupContentId: string | null;
};

export type MotionPrimitiveId =
  | "split-step"
  | "unit-turn"
  | "shoulder-turn"
  | "contact-point"
  | "weight-transfer"
  | "recovery-step"
  | "serve-toss"
  | "trophy-position"
  | "pronation"
  | "cross-step-shuffle";

// Legacy internal naming is retained for compatibility with existing storage,
// tests, and handoff contracts. User-facing semantics are step-based.
export type DayPlan = {
  day: number;
  focus: string;
  contentIds: string[];
  drills: string[];
  drill?: string;
  load?: string;
  executionFocus?: string;
  linkedContentReason?: string | null;
  duration: string;
  goal: string;
  warmupBlock: DayPlanBlock;
  mainBlock: DayPlanBlock;
  pressureBlock: DayPlanBlock;
  successCriteria: string[];
  failureCue: string;
  progressionNote: string;
  transferCue: string;
  intensity: PlanIntensity;
  tempo: PlanTempo;
  details?: PlanStepDetails;
  attachments?: PlanStepAttachments;
  motionPrimitiveId?: MotionPrimitiveId | null;
};

export type PlanTemplateDay = {
  day: number;
  focus: string;
  contentIds: string[];
  drills: string[];
  duration: string;
  focusEn: string;
  drillsEn: string[];
  durationEn: string;
  goal?: string;
  goalEn?: string;
  warmupBlock?: DayPlanBlock;
  warmupBlockEn?: DayPlanBlock;
  mainBlock?: DayPlanBlock;
  mainBlockEn?: DayPlanBlock;
  pressureBlock?: DayPlanBlock;
  pressureBlockEn?: DayPlanBlock;
  successCriteria?: string[];
  successCriteriaEn?: string[];
  failureCue?: string;
  failureCueEn?: string;
  progressionNote?: string;
  progressionNoteEn?: string;
  transferCue?: string;
  transferCueEn?: string;
  intensity?: PlanIntensity;
  tempo?: PlanTempo;
  drill?: string;
  drillEn?: string;
  load?: string;
  loadEn?: string;
  executionFocus?: string;
  executionFocusEn?: string;
  linkedContentReason?: string;
  linkedContentReasonEn?: string;
  details?: Partial<PlanStepDetails>;
  detailsEn?: Partial<PlanStepDetails>;
  attachments?: Partial<PlanStepAttachments>;
  motionPrimitiveId?: MotionPrimitiveId | null;
};

export type PlanTemplate = {
  problemTag: ProblemTag;
  level: "3.0" | "3.5" | "4.0";
  title: string;
  titleEn: string;
  target: string;
  targetEn: string;
  days: PlanTemplateDay[];
  environment?: EnvironmentValue;
};

export type GeneratedPlan = {
  source: "template" | "fallback";
  level: PlanLevel;
  problemTag: ProblemTag;
  title: string;
  target: string;
  summary?: string;
  days: DayPlan[];
  resume?: {
    href: string;
    payload: {
      problemTag: ProblemTag;
      level: PlanLevel;
      preferredContentIds: string[];
      sourceType: "diagnosis" | "assessment" | "default";
      primaryNextStep?: string;
      planContext?: PlanContext;
      guidanceContext?: GuidanceContext;
      deepContext?: EnrichedDiagnosisContext;
    };
  };
};

export type PlanIntent = {
  source: "diagnosis" | "assessment" | "direct";
  locale: "zh" | "en";
  levelBand: PlanLevel;
  primaryProblemTag: ProblemTag;
  skillFamily: PlanSkillFamily;
  mechanismFamily: PlanMechanismFamily;
  primaryWeakness?: ScoredDimension;
  secondaryWeakness?: ScoredDimension;
  playStyle?: PlayStyle;
  playContext?: PlayContext;
  primaryNextStep?: string;
  candidateContentIds: string[];
  planContext: PlanContext | null;
  guidanceContext: GuidanceContext | null;
  templateSeed?: PlanTemplate | null;
  deepContext?: EnrichedDiagnosisContext | null;
  microcycle: PlanBlueprintRole[];
};
