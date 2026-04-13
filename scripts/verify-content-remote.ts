import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { relative, resolve, sep } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";

registerSrcAlias();

const { contents } = require("../src/data/contents") as typeof import("../src/data/contents");
const { expandedContents } = require("../src/data/expandedContents") as typeof import("../src/data/expandedContents");
const {
  buildRemoteVerificationTargets,
  classifyFetchOutcome,
  planThumbnailVerification,
  renderRemoteVerificationCsv
} = require("./lib/remoteVerification") as typeof import("./lib/remoteVerification");

type RemoteLinkStatus = import("./lib/remoteVerification").RemoteLinkStatus;
type RemoteThumbnailStatus = import("./lib/remoteVerification").RemoteThumbnailStatus;
type RemoteVerificationRecord = import("./lib/remoteVerification").RemoteVerificationRecord;
type RemoteVerificationTarget = import("./lib/remoteVerification").RemoteVerificationTarget;

const OUTPUT_DIR = resolve(process.cwd(), "ops/quality");
const JSON_PATH = resolve(OUTPUT_DIR, "content-remote-check.latest.json");
const CSV_PATH = resolve(OUTPUT_DIR, "content-remote-check.latest.csv");
const PUBLIC_DIR = resolve(process.cwd(), "public");

function getArgValue(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }

  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : null;
}

function getLimit(): number | null {
  const raw = getArgValue("--limit");
  if (!raw) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getTimeoutMs(): number {
  const raw = getArgValue("--timeout-ms");
  if (!raw) {
    return 8000;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 8000;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<{
  httpStatus: number | null;
  finalUrl: string | null;
  status: RemoteLinkStatus;
  failureClass: import("./lib/remoteVerification").RemoteFailureClass | null;
  decisionReason: string;
  retrySuggested: boolean;
  errorReason: string;
  needsManualReview: boolean;
  verificationSurface: "canonical_url" | "remote_thumbnail";
}> {
  return fetchWithClassifiedOutcome({
    url,
    timeoutMs,
    verificationSurface: "canonical_url"
  });
}

async function fetchWithClassifiedOutcome(input: {
  url: string;
  timeoutMs: number;
  verificationSurface: "canonical_url" | "remote_thumbnail";
}): Promise<{
  httpStatus: number | null;
  finalUrl: string | null;
  status: RemoteLinkStatus;
  failureClass: import("./lib/remoteVerification").RemoteFailureClass | null;
  decisionReason: string;
  retrySuggested: boolean;
  errorReason: string;
  needsManualReview: boolean;
  verificationSurface: "canonical_url" | "remote_thumbnail";
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), input.timeoutMs);

  try {
    const response = await fetch(input.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "TennisLevelQA/1.0 (+remote verification)"
      }
    });
    const classified = classifyFetchOutcome({
      verificationSurface: input.verificationSurface,
      originalUrl: input.url,
      ok: response.ok,
      status: response.status,
      finalUrl: response.url
    });
    await response.body?.cancel();

    return {
      httpStatus: response.status,
      finalUrl: response.url,
      status: classified.status,
      failureClass: classified.failureClass,
      decisionReason: classified.decisionReason,
      retrySuggested: classified.retrySuggested,
      errorReason: classified.errorReason,
      needsManualReview: classified.needsManualReview,
      verificationSurface: classified.verificationSurface
    };
  } catch (error) {
    const err = error as { name?: string; message?: string; cause?: { code?: string; message?: string } };
    const classified = classifyFetchOutcome({
      verificationSurface: input.verificationSurface,
      originalUrl: input.url,
      errorName: err?.name ?? null,
      errorMessage: err?.message ?? err?.cause?.message ?? "request_failed",
      errorCode: err?.cause?.code ?? null
    });

    return {
      httpStatus: null,
      finalUrl: null,
      status: classified.status,
      failureClass: classified.failureClass,
      decisionReason: classified.decisionReason,
      retrySuggested: classified.retrySuggested,
      errorReason: classified.errorReason,
      needsManualReview: classified.needsManualReview,
      verificationSurface: classified.verificationSurface
    };
  } finally {
    clearTimeout(timer);
  }
}

async function verifyThumbnail(url: string | null, timeoutMs: number): Promise<{
  thumbnailStatus: RemoteThumbnailStatus;
  thumbnailDecisionReason: string;
  errorReason: string;
  needsManualReview: boolean;
}> {
  const plan = planThumbnailVerification({
    thumbnailUrl: url,
    publicRoot: PUBLIC_DIR
  });

  if (plan.mode === "missing" || plan.mode === "uncheckable") {
    return {
      thumbnailStatus: plan.thumbnailStatus,
      thumbnailDecisionReason: plan.decisionReason,
      errorReason: plan.errorReason,
      needsManualReview: plan.needsManualReview
    };
  }

  if (plan.mode === "local") {
    const assetRelativePath = relative(PUBLIC_DIR, plan.assetPath);
    const isInsidePublic = assetRelativePath !== "" && !assetRelativePath.startsWith("..") && !assetRelativePath.includes(`${sep}..`);
    const exists = isInsidePublic && existsSync(plan.assetPath);

    return {
      thumbnailStatus: exists ? "reachable" : "dead",
      thumbnailDecisionReason: exists ? "local_asset_present" : "local_asset_missing",
      errorReason: exists ? "" : "thumbnail_asset_missing",
      needsManualReview: !exists
    };
  }

  const result = await fetchWithClassifiedOutcome({
    url: plan.thumbnailUrl,
    timeoutMs,
    verificationSurface: "remote_thumbnail"
  });
  return {
    thumbnailStatus: result.status,
    thumbnailDecisionReason: result.decisionReason,
    errorReason: result.errorReason,
    needsManualReview: result.needsManualReview
  };
}

async function verifyTarget(target: RemoteVerificationTarget, checkedAt: string, timeoutMs: number): Promise<RemoteVerificationRecord> {
  const linkResult = await fetchWithTimeout(target.canonicalUrl, timeoutMs);
  const thumbnailResult = await verifyThumbnail(target.thumbnailUrl, timeoutMs);

  return {
    contentId: target.contentId,
    platform: target.platform,
    canonicalUrl: target.canonicalUrl,
    thumbnailUrl: target.thumbnailUrl,
    checkedAt,
    linkStatus: linkResult.status,
    httpStatus: linkResult.httpStatus,
    finalUrl: linkResult.finalUrl,
    verificationSurface: "canonical_url",
    failureClass: linkResult.failureClass,
    decisionReason: linkResult.decisionReason,
    retrySuggested: linkResult.retrySuggested,
    thumbnailStatus: thumbnailResult.thumbnailStatus,
    thumbnailDecisionReason: thumbnailResult.thumbnailDecisionReason,
    errorReason: [linkResult.errorReason, thumbnailResult.errorReason]
      .filter(Boolean)
      .join(";"),
    needsManualReview: linkResult.needsManualReview || thumbnailResult.needsManualReview
  };
}

export async function createRemoteVerificationArtifacts(options?: {
  limit?: number | null;
  timeoutMs?: number;
}) {
  const checkedAt = new Date().toISOString();
  const targets = buildRemoteVerificationTargets({
    contents,
    expandedContents
  });
  const selectedTargets = typeof options?.limit === "number" ? targets.slice(0, options.limit) : targets;
  const timeoutMs = options?.timeoutMs ?? 8000;
  const records: RemoteVerificationRecord[] = [];

  for (const target of selectedTargets) {
    records.push(await verifyTarget(target, checkedAt, timeoutMs));
  }

  const summary = {
    checkedCount: records.length,
    reachableCount: records.filter((record) => record.linkStatus === "reachable").length,
    deadCount: records.filter((record) => record.linkStatus === "dead").length,
    timeoutCount: records.filter((record) => record.linkStatus === "timeout").length,
    blockedCount: records.filter((record) => record.linkStatus === "blocked").length,
    networkErrorCount: records.filter((record) => record.linkStatus === "network_error").length,
    redirectUnverifiedCount: records.filter((record) => record.linkStatus === "redirect_unverified").length,
    unsupportedCount: records.filter((record) => record.linkStatus === "unsupported").length,
    ambiguousCount: records.filter((record) => record.linkStatus === "ambiguous").length,
    needsManualReviewCount: records.filter((record) => record.needsManualReview).length,
    failureClassCounts: {
      networkRuntimeFailure: records.filter((record) => record.failureClass === "network_runtime_failure").length,
      platformBlocking: records.filter((record) => record.failureClass === "platform_blocking").length,
      redirectUnverified: records.filter((record) => record.failureClass === "redirect_unverified").length,
      unsupportedSurface: records.filter((record) => record.failureClass === "unsupported_surface").length,
      unknown: records.filter((record) => record.failureClass === "unknown").length
    },
    timeoutMs
  };

  return {
    json: {
      generatedAt: checkedAt,
      methodology: {
        scope: "direct_source video links only",
        note: "This report is QA-only and does not change retrieval, ranking, or review overlay state."
      },
      summary,
      records
    },
    csv: renderRemoteVerificationCsv(records)
  };
}

async function main() {
  const artifacts = await createRemoteVerificationArtifacts({
    limit: getLimit(),
    timeoutMs: getTimeoutMs()
  });
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(JSON_PATH, `${JSON.stringify(artifacts.json, null, 2)}\n`, "utf8");
  writeFileSync(CSV_PATH, artifacts.csv, "utf8");

  console.log(`Wrote ${JSON_PATH}`);
  console.log(`Wrote ${CSV_PATH}`);
  console.log(`checked=${artifacts.json.summary.checkedCount}`);
}

if (require.main === module) {
  void main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
