import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type XiaohongshuTeachingType =
  | "technique_explanation"
  | "drill"
  | "footwork"
  | "tactic"
  | "serve"
  | "return"
  | "doubles"
  | "warmup"
  | "mental_execution";

export type XiaohongshuCreatorProfileStatus = "verified_profile" | "pending_profile_verification";

export type XiaohongshuCreatorProgramEntry = {
  id: string;
  displayName: string;
  aliases: string[];
  creatorProfileUrl: string | null;
  creatorProfileStatus: XiaohongshuCreatorProfileStatus;
  profileEvidenceNote: string;
  candidateTarget: number;
  runtimePromotionTarget: {
    min: number;
    max: number;
  };
  allowedTeachingTypes: XiaohongshuTeachingType[];
};

type XiaohongshuCreatorProgramFile = {
  version: 1;
  scopeTarget: number;
  allowedTeachingTypes: XiaohongshuTeachingType[];
  creators: Array<{
    id: string;
    displayName: string;
    aliases: string[];
    creatorProfileUrl: string | null;
    creatorProfileStatus: XiaohongshuCreatorProfileStatus;
    profileEvidenceNote: string;
    candidateTarget: number;
    runtimePromotionTarget: {
      min: number;
      max: number;
    };
    allowedTeachingTypes?: XiaohongshuTeachingType[];
  }>;
};

export const XIAOHONGSHU_ALLOWED_TEACHING_TYPES: XiaohongshuTeachingType[] = [
  "technique_explanation",
  "drill",
  "footwork",
  "tactic",
  "serve",
  "return",
  "doubles",
  "warmup",
  "mental_execution"
];

const PROGRAM_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-creator-program.json");
const PROFILE_STATUSES: XiaohongshuCreatorProfileStatus[] = ["verified_profile", "pending_profile_verification"];

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isTeachingType(value: unknown): value is XiaohongshuTeachingType {
  return XIAOHONGSHU_ALLOWED_TEACHING_TYPES.includes(value as XiaohongshuTeachingType);
}

function parseTeachingTypes(value: unknown, label: string): XiaohongshuTeachingType[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }

  const teachingTypes = value.map((item) => normalizeString(item));
  for (const teachingType of teachingTypes) {
    if (!isTeachingType(teachingType)) {
      throw new Error(`${label} contains unsupported teaching type "${teachingType}"`);
    }
  }

  return [...new Set(teachingTypes)] as XiaohongshuTeachingType[];
}

export function normalizeCreatorName(value: string): string {
  return value.trim().replace(/\s+/g, "");
}

export function loadXiaohongshuCreatorProgram(
  filePath = PROGRAM_PATH
): XiaohongshuCreatorProgramEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_json";
    throw new Error(`Unable to read Xiaohongshu creator program: ${message}`);
  }

  if (!isObject(parsed)) {
    throw new Error("Xiaohongshu creator program must be a JSON object");
  }

  if (parsed.version !== 1) {
    throw new Error("Xiaohongshu creator program version must be 1");
  }

  const allowedTeachingTypes = parseTeachingTypes(parsed.allowedTeachingTypes, "allowedTeachingTypes");
  const creators = parsed.creators;
  if (!Array.isArray(creators) || creators.length === 0) {
    throw new Error("Xiaohongshu creator program must include creators");
  }

  const normalizedCreators = creators.map((creator, index) => {
    const prefix = `creators[${index}]`;
    if (!isObject(creator)) {
      throw new Error(`${prefix} must be an object`);
    }

    const id = normalizeString(creator.id);
    const displayName = normalizeString(creator.displayName);
    const aliases = Array.isArray(creator.aliases)
      ? [...new Set(creator.aliases.map((alias) => normalizeString(alias)).filter(Boolean))]
      : [];
    const creatorProfileUrl = normalizeString(creator.creatorProfileUrl) || null;
    const creatorProfileStatus = normalizeString(creator.creatorProfileStatus) as XiaohongshuCreatorProfileStatus;
    const profileEvidenceNote = normalizeString(creator.profileEvidenceNote);
    const candidateTarget = Number(creator.candidateTarget);
    const runtimePromotionTarget = creator.runtimePromotionTarget;

    if (!id) {
      throw new Error(`${prefix}.id is required`);
    }
    if (!displayName) {
      throw new Error(`${prefix}.displayName is required`);
    }
    if (aliases.length === 0) {
      throw new Error(`${prefix}.aliases must include at least one name`);
    }
    if (!PROFILE_STATUSES.includes(creatorProfileStatus)) {
      throw new Error(`${prefix}.creatorProfileStatus is invalid`);
    }
    if (!profileEvidenceNote) {
      throw new Error(`${prefix}.profileEvidenceNote is required`);
    }
    if (!Number.isInteger(candidateTarget) || candidateTarget <= 0) {
      throw new Error(`${prefix}.candidateTarget must be a positive integer`);
    }
    if (!isObject(runtimePromotionTarget)) {
      throw new Error(`${prefix}.runtimePromotionTarget is required`);
    }

    const min = Number(runtimePromotionTarget.min);
    const max = Number(runtimePromotionTarget.max);
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max < min) {
      throw new Error(`${prefix}.runtimePromotionTarget must contain integer min/max with max >= min`);
    }

    return {
      id,
      displayName,
      aliases,
      creatorProfileUrl,
      creatorProfileStatus,
      profileEvidenceNote,
      candidateTarget,
      runtimePromotionTarget: { min, max },
      allowedTeachingTypes: creator.allowedTeachingTypes
        ? parseTeachingTypes(creator.allowedTeachingTypes, `${prefix}.allowedTeachingTypes`)
        : allowedTeachingTypes
    } satisfies XiaohongshuCreatorProgramEntry;
  });

  const parsedScopeTarget = Number(parsed.scopeTarget);
  const scopeTarget = normalizedCreators.reduce((sum, creator) => sum + creator.candidateTarget, 0);
  if (!Number.isInteger(parsedScopeTarget) || parsedScopeTarget !== scopeTarget) {
    throw new Error(`Xiaohongshu creator program scopeTarget must equal ${scopeTarget}`);
  }

  return normalizedCreators;
}

export function findXiaohongshuCreatorProgramEntry(
  program: XiaohongshuCreatorProgramEntry[],
  input: {
    creatorName?: string;
    creatorProfileUrl?: string;
  }
): XiaohongshuCreatorProgramEntry | null {
  const normalizedName = normalizeCreatorName(input.creatorName ?? "");
  const normalizedProfileUrl = input.creatorProfileUrl?.trim();

  for (const entry of program) {
    if (normalizedProfileUrl && entry.creatorProfileUrl && normalizedProfileUrl === entry.creatorProfileUrl) {
      return entry;
    }

    if (normalizedName && entry.aliases.some((alias) => normalizeCreatorName(alias) === normalizedName)) {
      return entry;
    }
  }

  return null;
}

export function canCollectXiaohongshuSeedCandidates(entry: XiaohongshuCreatorProgramEntry): boolean {
  return entry.creatorProfileStatus === "verified_profile" && Boolean(entry.creatorProfileUrl);
}
