import { AssessmentResult } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import { AppEnvironment, EnvironmentValue } from "@/types/environment";
import type { GuidanceContext } from "@/lib/guidance-context/types";
import { DeepDiagnosisHandoff, EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import { ProblemTag } from "@/types/problemTag";

export type DiagnosisSearchQueries = {
  bilibili: string[];
  youtube: string[];
};

export type DiagnosisCategoryConsistency = "ungated" | "consistent" | "conflict";

export type DiagnosisCategoryConflict = {
  expectedSkillCategory: string;
  actualProblemTag: ProblemTag | null;
  actualCategory: string[];
  reason: string;
};

export type DiagnosisAlias =
  | "first_serve"
  | "second_serve"
  | "overhead"
  | "moonball"
  | "slice"
  | "key_point"
  | "tight"
  | "age"
  | "mobility_limit";

export type DiagnosisModifier = "age" | "tight";

export type DiagnosisSupportSignal = string;

export type DiagnosisSlotType = "stroke" | "outcome" | "context" | "condition";

export type DiagnosisInternalSignal = `slot_${DiagnosisSlotType}_${string}`;

export type DiagnosisSlot = {
  type: DiagnosisSlotType;
  value: string;
  signal: DiagnosisInternalSignal;
};

export type DiagnosisSignalSource = "raw" | "alias" | "modifier" | "support" | "internal";

export type DiagnosisSignalSegment = {
  source: DiagnosisSignalSource;
  value: string;
};

export type DiagnosisSignalLayer = "primary" | "modifier" | "trigger" | "support" | "unknown";

export type DiagnosisClause = {
  text: string;
  normalizedText: string;
};

export type DiagnosisLayeredSignals = {
  primaryCandidates: string[];
  modifiers: string[];
  triggers: string[];
};

export type DiagnosisSignalBundle = {
  rawInput: string;
  normalizedInput: string;
  matchableText: string;
  clauses: DiagnosisClause[];
  layeredSignals: DiagnosisLayeredSignals;
  segments: DiagnosisSignalSegment[];
  aliases: DiagnosisAlias[];
  modifiers: DiagnosisModifier[];
  supportSignals: DiagnosisSupportSignal[];
  slots: DiagnosisSlot[];
  internalSignals: DiagnosisInternalSignal[];
};

export type DiagnosisRule = {
  id: string;
  keywords: string[];
  synonyms?: string[];
  category: string[];
  problemTag: ProblemTag;
  causes: string[];
  fixes: string[];
  causes_en?: string[];
  fixes_en?: string[];
  drills_en?: string[];
  recommendedContentIds: string[];
  drills: string[];
  searchQueries: DiagnosisSearchQueries;
  fallbackLevel?: string[];
  environment?: EnvironmentValue;
};

export type DiagnosisConfidence = "较低" | "中等" | "较高";

export type DiagnosisEvidenceLevel = "low" | "medium" | "high";
export type DiagnosisEffortMode = "quick" | "standard" | "deep";

export type DiagnosisNarrowingSeverity = "high" | "medium" | "low";

export type DiagnosisNarrowingSuggestion = {
  id: string;
  severity: DiagnosisNarrowingSeverity;
  reason: string;
  nextAction: string;
};

export type DiagnosisRefusalReasonCode =
  | "missing_stroke"
  | "missing_outcome"
  | "missing_context"
  | "low_match_score";

export type DiagnosisResult = {
  input: string;
  normalizedInput: string;
  matchedRuleId: string | null;
  matchedKeywords: string[];
  matchedSynonyms: string[];
  matchScore: number;
  confidence: DiagnosisConfidence;
  effortMode: DiagnosisEffortMode;
  evidenceLevel: DiagnosisEvidenceLevel;
  needsNarrowing: boolean;
  narrowingPrompts: string[];
  narrowingSuggestions: DiagnosisNarrowingSuggestion[];
  refusalReasonCodes?: DiagnosisRefusalReasonCode[];
  missingEvidenceSlots?: DiagnosisSlotType[];
  primaryNextStep: string;
  problemTag: ProblemTag;
  category: string[];
  title: string;
  summary: string;
  detailedSummary?: string | null;
  causes: string[];
  fixes: string[];
  drills: string[];
  recommendedContents: ContentItem[];
  searchQueries: DiagnosisSearchQueries | null;
  fallbackUsed: boolean;
  fallbackMode: "assessment" | "no-assessment" | null;
  level?: string;
  enrichedContext?: EnrichedDiagnosisContext | null;
  guidanceContext?: GuidanceContext | null;
  categoryConsistency?: DiagnosisCategoryConsistency;
  categoryConflict?: DiagnosisCategoryConflict | null;
};

export type DiagnosisSnapshot = {
  inputSummary: string;
  capturedAt: string;
  matchedRuleId: string | null;
  matchScore: number;
  confidence: DiagnosisConfidence;
  effortMode: DiagnosisEffortMode;
  evidenceLevel: DiagnosisEvidenceLevel;
  needsNarrowing: boolean;
  narrowingPrompts: string[];
  narrowingSuggestions: DiagnosisNarrowingSuggestion[];
  refusalReasonCodes?: DiagnosisRefusalReasonCode[];
  missingEvidenceSlots?: DiagnosisSlotType[];
  primaryNextStep: string;
  problemTag: ProblemTag;
  category: string[];
  title: string;
  summary: string;
  detailedSummary?: string | null;
  causes: string[];
  fixes: string[];
  drills: string[];
  recommendedContentIds: string[];
  fallbackUsed: boolean;
  fallbackMode: "assessment" | "no-assessment" | null;
  level?: string;
  enrichedContext?: EnrichedDiagnosisContext | null;
  guidanceContext?: GuidanceContext | null;
  categoryConsistency?: DiagnosisCategoryConsistency;
  categoryConflict?: DiagnosisCategoryConflict | null;
};

export type DiagnoseOptions = {
  level?: string;
  assessmentResult?: AssessmentResult | null;
  maxRecommendations?: number;
  rules?: DiagnosisRule[];
  contentPool?: ContentItem[];
  effortMode?: DiagnosisEffortMode;
  locale?: "zh" | "en";
  environment?: AppEnvironment;
  deepHandoff?: DeepDiagnosisHandoff | null;
};
