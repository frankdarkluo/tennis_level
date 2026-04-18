import type { ContentItem } from "@/types/content";
import type { GuidanceMechanismFamily } from "@/lib/guidance-context/types";
import type {
  TeachingInstructionalRole,
  TeachingRecommendationSlot
} from "@/types/teachingRecommendation";

export type PackageableAttachedCandidate<TBreakdown> = {
  item: ContentItem;
  role: TeachingInstructionalRole;
  duplicateClusterId: string;
  mechanismFamily: GuidanceMechanismFamily;
  totalScore: number;
  breakdown: TBreakdown;
};

type PackageAttachedRecommendationsOptions = {
  intentMechanismFamily: GuidanceMechanismFamily;
};

const SLOT_FLOORS: Record<TeachingRecommendationSlot, number> = {
  primary: 78,
  explanation: 72,
  drill: 68
};

function isSlotEligible<TBreakdown>(
  candidate: PackageableAttachedCandidate<TBreakdown>,
  slot: TeachingRecommendationSlot,
  options: PackageAttachedRecommendationsOptions
): boolean {
  if (candidate.role === "general") {
    return false;
  }

  if (slot === "primary") {
    return candidate.totalScore >= SLOT_FLOORS.primary
      && (candidate.role === "primary_fix" || candidate.role === "explanation");
  }

  if (slot === "explanation") {
    return candidate.totalScore >= SLOT_FLOORS.explanation
      && (candidate.role === "explanation" || candidate.role === "tactic" || candidate.role === "mental");
  }

  if (candidate.role === "drill") {
    return candidate.totalScore >= SLOT_FLOORS.drill;
  }

  if (candidate.role === "warmup") {
    return candidate.totalScore >= 74 && candidate.mechanismFamily === options.intentMechanismFamily;
  }

  return false;
}

function pickCandidate<TBreakdown>(
  candidates: Array<PackageableAttachedCandidate<TBreakdown>>,
  selectedIds: Set<string>,
  selectedClusters: Set<string>,
  slot: TeachingRecommendationSlot,
  options: PackageAttachedRecommendationsOptions
) {
  for (const candidate of candidates) {
    if (!isSlotEligible(candidate, slot, options)) {
      continue;
    }
    if (selectedIds.has(candidate.item.id)) {
      continue;
    }
    if (selectedClusters.has(candidate.duplicateClusterId)) {
      continue;
    }

    return candidate;
  }

  return null;
}

export function packageAttachedRecommendations<TBreakdown>(
  candidates: Array<PackageableAttachedCandidate<TBreakdown>>,
  options: PackageAttachedRecommendationsOptions
): Array<PackageableAttachedCandidate<TBreakdown> & { slot: TeachingRecommendationSlot }> {
  const selectedIds = new Set<string>();
  const selectedClusters = new Set<string>();
  const packaged: Array<PackageableAttachedCandidate<TBreakdown> & { slot: TeachingRecommendationSlot }> = [];

  const primary = pickCandidate(candidates, selectedIds, selectedClusters, "primary", options);
  if (primary) {
    packaged.push({ ...primary, slot: "primary" });
    selectedIds.add(primary.item.id);
    selectedClusters.add(primary.duplicateClusterId);
  }

  const explanation = pickCandidate(candidates, selectedIds, selectedClusters, "explanation", options);
  if (explanation) {
    packaged.push({ ...explanation, slot: "explanation" });
    selectedIds.add(explanation.item.id);
    selectedClusters.add(explanation.duplicateClusterId);
  }

  const drill = pickCandidate(candidates, selectedIds, selectedClusters, "drill", options);
  if (drill) {
    packaged.push({ ...drill, slot: "drill" });
  }

  return packaged;
}
