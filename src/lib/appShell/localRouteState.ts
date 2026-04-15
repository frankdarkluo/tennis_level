"use client";

import { DiagnosisSnapshot } from "@/types/diagnosis";
import { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import type { GuidanceContext } from "@/lib/guidance-context/types";
import { PlanContext, PlanLevel } from "@/types/plan";
import { SavedPlanSource } from "@/types/userData";

const DIAGNOSIS_SNAPSHOT_KEY = "tennislevel_diagnosis_snapshot";
const PLAN_DRAFT_KEY = "tennislevel_plan_draft";

export type LocalPlanDraft = {
  problemTag: string;
  level: PlanLevel;
  preferredContentIds?: string[];
  sourceType?: SavedPlanSource;
  primaryNextStep?: string;
  planContext?: PlanContext;
  guidanceContext?: GuidanceContext;
  deepContext?: EnrichedDiagnosisContext;
  updatedAt?: string;
};

function isBrowser() {
  return typeof window !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readLocalDiagnosisSnapshot() {
  return readJson<DiagnosisSnapshot | null>(DIAGNOSIS_SNAPSHOT_KEY, null);
}

export function writeLocalDiagnosisSnapshot(snapshot: DiagnosisSnapshot) {
  writeJson(DIAGNOSIS_SNAPSHOT_KEY, snapshot);
  return snapshot;
}

export function readLocalPlanDraft() {
  return readJson<LocalPlanDraft | null>(PLAN_DRAFT_KEY, null);
}

export function writeLocalPlanDraft(draft: LocalPlanDraft) {
  const problemTag = draft.problemTag?.trim();
  if (!problemTag) {
    return null;
  }

  const normalized: LocalPlanDraft = {
    problemTag,
    level: draft.level,
    preferredContentIds: Array.isArray(draft.preferredContentIds) ? draft.preferredContentIds : [],
    sourceType: draft.sourceType,
    primaryNextStep: draft.primaryNextStep,
    planContext: draft.planContext,
    guidanceContext: draft.guidanceContext,
    deepContext: draft.deepContext,
    updatedAt: draft.updatedAt ?? new Date().toISOString()
  };

  writeJson(PLAN_DRAFT_KEY, normalized);
  return normalized;
}

export function clearLocalPlanDraft() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(PLAN_DRAFT_KEY);
}
