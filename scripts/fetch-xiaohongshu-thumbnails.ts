import { closeSync, cpSync, existsSync, mkdirSync, openSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { resolve } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";
import {
  extractXiaohongshuProfileCardThumbnailsFromHtml,
  extractXiaohongshuThumbnailFromHtml,
  loadXiaohongshuThumbnailOverrides,
  type XiaohongshuThumbnailFetchFailure,
  type XiaohongshuThumbnailOverride,
  type XiaohongshuThumbnailOverrideArtifact
} from "./lib/xiaohongshuThumbnailOverrides";
import { buildXiaohongshuThumbnailFetchTargets } from "./lib/xiaohongshuThumbnailFetchTargets";

registerSrcAlias();

type CandidateRecord = {
  candidateId: string;
  creatorProgramId: string;
  creatorName: string;
  creatorProfileUrl: string;
  postId: string | null;
  rawUrl: string;
  canonicalUrl: string | null;
  title: string;
  thumbnailUrl: string | null;
};

const CHROME_BINARY = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SOURCE_PROFILE_DIR = resolve(homedir(), "Library/Application Support/Google/Chrome");
const SOURCE_PROFILE_NAME = "Default";
const TEMP_PROFILE_DIR = resolve(tmpdir(), "xhs-chrome-profile");
const CANDIDATES_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-seed-candidates.json");
const OUTPUT_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-thumbnail-overrides.json");
const PROFILE_SENTINEL = resolve(TEMP_PROFILE_DIR, ".profile-cloned");
const LOCK_FILE_NAMES = ["SingletonLock", "SingletonCookie", "SingletonSocket"];
const CHROME_VIRTUAL_TIME_BUDGET_MS = 15_000;
const RENDER_TIMEOUT_MS = 180_000;

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function parseArgs(argv: string[]) {
  const creatorIds = new Set<string>();
  const postIds = new Set<string>();
  let limit = Number.POSITIVE_INFINITY;
  let force = false;
  let refreshProfile = false;

  for (const rawArg of argv) {
    if (rawArg === "--force") {
      force = true;
      continue;
    }

    if (rawArg === "--refresh-profile") {
      refreshProfile = true;
      continue;
    }

    if (rawArg.startsWith("--creator=")) {
      for (const creatorId of rawArg.slice("--creator=".length).split(",")) {
        const normalized = normalizeString(creatorId);
        if (normalized) {
          creatorIds.add(normalized);
        }
      }
      continue;
    }

    if (rawArg.startsWith("--post-id=")) {
      for (const postId of rawArg.slice("--post-id=".length).split(",")) {
        const normalized = normalizeString(postId);
        if (normalized) {
          postIds.add(normalized);
        }
      }
      continue;
    }

    if (rawArg.startsWith("--limit=")) {
      const parsed = Number(rawArg.slice("--limit=".length));
      if (Number.isFinite(parsed) && parsed > 0) {
        limit = parsed;
      }
    }
  }

  return { creatorIds, postIds, limit, force, refreshProfile };
}

function loadCandidates(): CandidateRecord[] {
  const parsed = JSON.parse(readFileSync(CANDIDATES_PATH, "utf8")) as { candidates?: CandidateRecord[] };
  if (!Array.isArray(parsed.candidates)) {
    throw new Error("xiaohongshu seed candidates artifact is missing the candidates array");
  }

  return parsed.candidates;
}

function ensureTempProfile(refreshProfile: boolean) {
  mkdirSync(TEMP_PROFILE_DIR, { recursive: true });

  if (refreshProfile || !existsSync(PROFILE_SENTINEL)) {
    cpSync(resolve(SOURCE_PROFILE_DIR, "Local State"), resolve(TEMP_PROFILE_DIR, "Local State"));
    cpSync(resolve(SOURCE_PROFILE_DIR, SOURCE_PROFILE_NAME), resolve(TEMP_PROFILE_DIR, SOURCE_PROFILE_NAME), {
      recursive: true
    });
    writeFileSync(PROFILE_SENTINEL, new Date().toISOString(), "utf8");
  }

  clearTempProfileLocks();
}

function killProcessGroup(pid: number | undefined, signal: NodeJS.Signals) {
  if (!pid) {
    return;
  }

  try {
    process.kill(-pid, signal);
  } catch {
    // The process group may already be gone.
  }
}

function clearTempProfileLocks() {
  for (const fileName of LOCK_FILE_NAMES) {
    const filePath = resolve(TEMP_PROFILE_DIR, fileName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}

async function dumpRenderedDom(url: string): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    clearTempProfileLocks();
    const outputPath = resolve(
      tmpdir(),
      `xhs-dom-${Date.now()}-${Math.random().toString(36).slice(2)}.html`
    );
    const outputFd = openSync(outputPath, "w");

    const args = [
      "--headless=new",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-component-extensions-with-background-pages",
      "--disable-background-networking",
      "--disable-sync",
      "--no-first-run",
      "--mute-audio",
      `--user-data-dir=${TEMP_PROFILE_DIR}`,
      `--profile-directory=${SOURCE_PROFILE_NAME}`,
      `--virtual-time-budget=${CHROME_VIRTUAL_TIME_BUDGET_MS}`,
      "--dump-dom",
      url
    ];

    const child = spawn(CHROME_BINARY, args, {
      detached: true,
      stdio: ["ignore", outputFd, "pipe"]
    });
    closeSync(outputFd);

    let stderr = "";
    let settled = false;
    let pollId: NodeJS.Timeout | null = null;

    const settle = (error: Error | null, html?: string) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeoutId);
      if (pollId) {
        clearInterval(pollId);
      }
      killProcessGroup(child.pid, "SIGTERM");
      setTimeout(() => killProcessGroup(child.pid, "SIGKILL"), 500).unref();
      try {
        rmSync(outputPath, { force: true });
      } catch {
        // Ignore temp-file cleanup errors.
      }

      if (error) {
        rejectPromise(error);
        return;
      }

      resolvePromise(html ?? "");
    };

    const timeoutId = setTimeout(() => {
      settle(new Error(`Timed out while rendering ${url}`));
    }, RENDER_TIMEOUT_MS);

    if (child.stderr) {
      child.stderr.setEncoding("utf8");

      child.stderr.on("data", (chunk: string) => {
        stderr += chunk;
      });
    }

    pollId = setInterval(() => {
      if (settled || !existsSync(outputPath)) {
        return;
      }

      try {
        const html = readFileSync(outputPath, "utf8");
        if (html.includes("</html>")) {
          settle(null, html);
        }
      } catch {
        // The file may still be mid-write; keep polling.
      }
    }, 1000);
    pollId.unref();

    child.on("error", (error) => {
      settle(error);
    });

    child.on("close", () => {
      if (settled) {
        return;
      }

      const html = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : "";

      if (html.includes("<html")) {
        settle(null, html);
        return;
      }

      settle(new Error(`Chrome did not produce HTML for ${url}. ${stderr.trim()}`));
    });
  });
}

function writeArtifact(
  existing: XiaohongshuThumbnailOverrideArtifact | null,
  updates: XiaohongshuThumbnailOverride[],
  failures: XiaohongshuThumbnailFetchFailure[]
) {
  const retainedOverrides = new Map<string, XiaohongshuThumbnailOverride>();
  const retainedFailures = new Map<string, XiaohongshuThumbnailFetchFailure>();

  for (const override of existing?.overrides ?? []) {
    retainedOverrides.set(override.postId, override);
  }

  for (const override of updates) {
    retainedOverrides.set(override.postId, override);
  }

  for (const failure of existing?.failures ?? []) {
    retainedFailures.set(failure.candidateId, failure);
  }

  for (const failure of failures) {
    retainedFailures.set(failure.candidateId, failure);
  }

  const artifact: XiaohongshuThumbnailOverrideArtifact = {
    version: 1,
    generatedAt: new Date().toISOString(),
    methodology: {
      extractor: "cloned_local_chrome_profile_headless_dump_dom",
      chromeProfile: "Default",
      tempProfileDir: TEMP_PROFILE_DIR
    },
    overrides: [...retainedOverrides.values()].sort((left, right) =>
      left.creatorProgramId.localeCompare(right.creatorProgramId) || left.title.localeCompare(right.title)
    ),
    failures: [...retainedFailures.values()].sort((left, right) =>
      left.creatorProgramId.localeCompare(right.creatorProgramId) || left.title.localeCompare(right.title)
    )
  };

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const candidates = loadCandidates();
  const existingArtifact = loadXiaohongshuThumbnailOverrides();
  const existingOverrides = new Map(
    (existingArtifact?.overrides ?? []).map((override) => [override.postId, override.thumbnailUrl])
  );

  const targets = candidates
    .filter((candidate) => Boolean(candidate.postId))
    .filter((candidate) => options.creatorIds.size === 0 || options.creatorIds.has(candidate.creatorProgramId))
    .filter((candidate) => options.postIds.size === 0 || options.postIds.has(candidate.postId!))
    .filter((candidate) => {
      if (options.force) {
        return true;
      }

      return !candidate.thumbnailUrl && !existingOverrides.has(candidate.postId!);
    })
    .slice(0, options.limit);

  if (targets.length === 0) {
    console.log("No Xiaohongshu candidates need thumbnail extraction.");
    return;
  }

  ensureTempProfile(options.refreshProfile);

  const updates: XiaohongshuThumbnailOverride[] = [];
  const failures: XiaohongshuThumbnailFetchFailure[] = [];
  const profileCardMaps = new Map<string, Map<string, { rawUrl: string; thumbnailUrl: string; title: string }>>();

  const creatorProfiles = new Map<string, string>();
  for (const candidate of targets) {
    if (candidate.creatorProgramId && candidate.creatorProfileUrl) {
      creatorProfiles.set(candidate.creatorProgramId, candidate.creatorProfileUrl);
    }
  }

  for (const [creatorProgramId, creatorProfileUrl] of creatorProfiles.entries()) {
    try {
      const html = await dumpRenderedDom(creatorProfileUrl);
      const profileCards = extractXiaohongshuProfileCardThumbnailsFromHtml(html);
      profileCardMaps.set(
        creatorProgramId,
        new Map(profileCards.map((card) => [card.postId, card]))
      );
      console.log(`profile_cards ${creatorProgramId}=${profileCards.length}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(`profile_cards_failed ${creatorProgramId} ${message}`);
    }
  }

  for (const candidate of targets) {
    const checkedAt = new Date().toISOString();
    const profileCard = candidate.postId
      ? profileCardMaps.get(candidate.creatorProgramId)?.get(candidate.postId)
      : undefined;

    if (profileCard?.thumbnailUrl) {
      updates.push({
        candidateId: candidate.candidateId,
        creatorProgramId: candidate.creatorProgramId,
        postId: candidate.postId!,
        rawUrl: profileCard.rawUrl,
        title: candidate.title,
        thumbnailUrl: profileCard.thumbnailUrl,
        extractedFrom: "profile.note-item.cover img",
        checkedAt
      });
      console.log(`thumbnail_ok ${candidate.creatorProgramId} ${candidate.postId} profile`);
      continue;
    }

    const targetUrls = buildXiaohongshuThumbnailFetchTargets({
      creatorProfileUrl: candidate.creatorProfileUrl,
      rawUrl: candidate.rawUrl,
      canonicalUrl: candidate.canonicalUrl,
      postId: candidate.postId
    });

    try {
      let extracted: ReturnType<typeof extractXiaohongshuThumbnailFromHtml> = null;
      const failedTargets: string[] = [];

      for (const targetUrl of targetUrls) {
        try {
          const html = await dumpRenderedDom(targetUrl);
          extracted = extractXiaohongshuThumbnailFromHtml(html, candidate.postId ?? undefined);

          if (extracted) {
            break;
          }

          failedTargets.push(`${targetUrl} (rendered without note image state)`);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          failedTargets.push(`${targetUrl} (${message})`);
        }
      }

      if (!extracted) {
        failures.push({
          candidateId: candidate.candidateId,
          creatorProgramId: candidate.creatorProgramId,
          postId: candidate.postId,
          rawUrl: candidate.rawUrl,
          title: candidate.title,
          reason: failedTargets.length > 0
            ? `all render targets failed: ${failedTargets.join(" | ")}`
            : "note thumbnail was not present in the rendered initial state",
          checkedAt
        });
        console.log(`thumbnail_missing ${candidate.creatorProgramId} ${candidate.postId}`);
        continue;
      }

      updates.push({
        candidateId: candidate.candidateId,
        creatorProgramId: candidate.creatorProgramId,
        postId: candidate.postId!,
        rawUrl: candidate.rawUrl,
        title: candidate.title,
        thumbnailUrl: extracted.thumbnailUrl,
        extractedFrom: extracted.extractedFrom,
        checkedAt
      });
      console.log(`thumbnail_ok ${candidate.creatorProgramId} ${candidate.postId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({
        candidateId: candidate.candidateId,
        creatorProgramId: candidate.creatorProgramId,
        postId: candidate.postId,
        rawUrl: candidate.rawUrl,
        title: candidate.title,
        reason: message,
        checkedAt
      });
      console.log(`thumbnail_failed ${candidate.creatorProgramId} ${candidate.postId} ${message}`);
    }
  }

  writeArtifact(existingArtifact, updates, failures);

  const successByCreator = new Map<string, number>();
  for (const update of updates) {
    successByCreator.set(update.creatorProgramId, (successByCreator.get(update.creatorProgramId) ?? 0) + 1);
  }

  console.log(`wrote_overrides=${updates.length}`);
  console.log(`wrote_failures=${failures.length}`);
  for (const [creatorProgramId, count] of successByCreator.entries()) {
    console.log(`creator_success ${creatorProgramId}=${count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
