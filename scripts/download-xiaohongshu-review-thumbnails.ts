import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { homedir, tmpdir } from "node:os";
import { resolve } from "node:path";
import { buildXiaohongshuThumbnailFetchTargets } from "./lib/xiaohongshuThumbnailFetchTargets";

type CandidateArtifact = {
  candidates: Array<{
    creatorProfileUrl: string;
    postId: string | null;
    rawUrl: string;
    canonicalUrl: string | null;
  }>;
};

type LocalThumbnailManifestEntry = {
  postId: string;
  localPath: string;
  contentType: "image/png";
  sourceUrl: string;
};

type LocalThumbnailManifest = {
  version: 1;
  generatedAt: string;
  items: LocalThumbnailManifestEntry[];
};

const CANDIDATES_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-seed-candidates.json");
const MANIFEST_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-local-thumbnails.json");
const OUTPUT_DIR = resolve(process.cwd(), "public", "thumbnails", "xiaohongshu", "review");

const CHROME_BINARY = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const SOURCE_PROFILE_DIR = resolve(homedir(), "Library/Application Support/Google/Chrome");
const SOURCE_PROFILE_NAME = "Default";
const TEMP_PROFILE_DIR = resolve(tmpdir(), "xhs-chrome-profile");
const PROFILE_SENTINEL = resolve(TEMP_PROFILE_DIR, ".profile-cloned");
const LOCK_FILE_NAMES = ["SingletonLock", "SingletonCookie", "SingletonSocket"];

const SCREENSHOT_WIDTH = 720;
const SCREENSHOT_HEIGHT = 1600;
const COVER_CROP_WIDTH = 720;
const COVER_CROP_HEIGHT = 560;
const COVER_CROP_OFFSET_Y = 138;
const COVER_CROP_OFFSET_X = 0;
const MIN_VALID_SCREENSHOT_BYTES = 100_000;
const SCREENSHOT_TIMEOUT_MS = 20_000;

function normalizeString(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function ensureTempProfile() {
  mkdirSync(TEMP_PROFILE_DIR, { recursive: true });

  if (!existsSync(PROFILE_SENTINEL)) {
    cpSync(resolve(SOURCE_PROFILE_DIR, "Local State"), resolve(TEMP_PROFILE_DIR, "Local State"));
    cpSync(resolve(SOURCE_PROFILE_DIR, SOURCE_PROFILE_NAME), resolve(TEMP_PROFILE_DIR, SOURCE_PROFILE_NAME), {
      recursive: true
    });
    writeFileSync(PROFILE_SENTINEL, new Date().toISOString(), "utf8");
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

function killProcessGroup(pid: number | undefined, signal: NodeJS.Signals) {
  if (!pid) {
    return;
  }

  try {
    process.kill(-pid, signal);
  } catch {
    // The process may already be gone.
  }
}

function killExistingTempProfileChromeProcesses() {
  const result = spawnSync("ps", ["ax", "-o", "pid=,command="], {
    encoding: "utf8"
  });

  if (result.status !== 0 || !result.stdout) {
    return;
  }

  for (const line of result.stdout.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.includes(TEMP_PROFILE_DIR) || !trimmed.includes("Google Chrome")) {
      continue;
    }

    const match = trimmed.match(/^(\d+)/);
    if (!match) {
      continue;
    }

    const pid = Number(match[1]);
    if (!Number.isFinite(pid) || pid === process.pid) {
      continue;
    }

    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // Ignore processes that have already exited.
    }
  }
}

function loadCandidates() {
  const parsed = JSON.parse(readFileSync(CANDIDATES_PATH, "utf8")) as CandidateArtifact;
  return parsed.candidates.filter((candidate) => candidate.postId) as Array<{
    creatorProfileUrl: string;
    postId: string;
    rawUrl: string;
    canonicalUrl: string | null;
  }>;
}

function loadExistingManifest(): LocalThumbnailManifest {
  if (!existsSync(MANIFEST_PATH)) {
    return { version: 1, generatedAt: new Date(0).toISOString(), items: [] };
  }

  return JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as LocalThumbnailManifest;
}

function buildCaptureUrls(candidate: {
  creatorProfileUrl: string;
  rawUrl: string;
  canonicalUrl: string | null;
  postId: string;
}) {
  return uniqueStrings([
    candidate.rawUrl,
    ...buildXiaohongshuThumbnailFetchTargets({
      creatorProfileUrl: candidate.creatorProfileUrl,
      rawUrl: candidate.rawUrl,
      canonicalUrl: candidate.canonicalUrl,
      postId: candidate.postId
    })
  ]);
}

async function captureFullPageScreenshot(url: string, outputPath: string) {
  killExistingTempProfileChromeProcesses();
  clearTempProfileLocks();

  const child = spawn(CHROME_BINARY, [
    "--headless=new",
    "--disable-gpu",
    `--user-data-dir=${TEMP_PROFILE_DIR}`,
    `--profile-directory=${SOURCE_PROFILE_NAME}`,
    `--window-size=${SCREENSHOT_WIDTH},${SCREENSHOT_HEIGHT}`,
    `--screenshot=${outputPath}`,
    url
  ], {
    detached: true,
    stdio: ["ignore", "ignore", "pipe"]
  });

  let stderr = "";
  child.stderr?.setEncoding("utf8");
  child.stderr?.on("data", (chunk: string) => {
    stderr += chunk;
  });

  const exitCode = await new Promise<number>((resolvePromise, rejectPromise) => {
    const timeoutId = setTimeout(() => {
      killProcessGroup(child.pid, "SIGTERM");
      setTimeout(() => killProcessGroup(child.pid, "SIGKILL"), 500).unref();
      rejectPromise(new Error(`Chrome screenshot timed out for ${url}`));
    }, SCREENSHOT_TIMEOUT_MS);

    child.on("error", (error) => {
      clearTimeout(timeoutId);
      rejectPromise(error);
    });

    child.on("close", (code) => {
      clearTimeout(timeoutId);
      resolvePromise(code ?? 0);
    });
  });

  if (exitCode !== 0) {
    throw new Error(`Chrome screenshot failed for ${url}${stderr.trim() ? `\n${stderr.trim()}` : ""}`);
  }

  if (!existsSync(outputPath)) {
    throw new Error(`Chrome did not write a screenshot for ${url}`);
  }

  const screenshotSize = statSync(outputPath).size;
  if (screenshotSize < MIN_VALID_SCREENSHOT_BYTES) {
    throw new Error(`Chrome screenshot for ${url} looks invalid (${screenshotSize} bytes)`);
  }
}

function cropScreenshotToCover(sourcePath: string, destinationPath: string) {
  const result = spawnSync("sips", [
    "-c",
    String(COVER_CROP_HEIGHT),
    String(COVER_CROP_WIDTH),
    "--cropOffset",
    String(COVER_CROP_OFFSET_Y),
    String(COVER_CROP_OFFSET_X),
    sourcePath,
    "--out",
    destinationPath
  ], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    throw new Error(`sips crop failed for ${sourcePath}\n${result.stderr || result.stdout}`);
  }
}

async function captureLocalCover(candidate: {
  creatorProfileUrl: string;
  postId: string;
  rawUrl: string;
  canonicalUrl: string | null;
}) {
  const tempScreenshotPath = resolve(tmpdir(), `xhs-note-${candidate.postId}.png`);
  const outputFilename = `${candidate.postId}.png`;
  const outputPath = resolve(OUTPUT_DIR, outputFilename);
  const captureUrls = buildCaptureUrls(candidate);
  const failures: string[] = [];

  try {
    for (const url of captureUrls) {
      try {
        await captureFullPageScreenshot(url, tempScreenshotPath);
        cropScreenshotToCover(tempScreenshotPath, outputPath);
        return {
          postId: candidate.postId,
          localPath: `/thumbnails/xiaohongshu/review/${outputFilename}`,
          contentType: "image/png",
          sourceUrl: url
        } satisfies LocalThumbnailManifestEntry;
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        failures.push(`${url} -> ${reason}`);
      }
    }

    throw new Error(`No screenshot target produced a usable cover for post ${candidate.postId}\n${failures.join("\n")}`);
  } finally {
    rmSync(tempScreenshotPath, { force: true });
  }
}

async function main() {
  ensureTempProfile();
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const candidates = loadCandidates();
  const existingManifest = loadExistingManifest();
  const nextEntries = new Map<string, LocalThumbnailManifestEntry>();
  const failures: string[] = [];

  for (const entry of existingManifest.items) {
    const existingOutputPath = resolve(process.cwd(), "public", entry.localPath.replace(/^\//, ""));
    if (existsSync(existingOutputPath)) {
      nextEntries.set(entry.postId, entry);
    }
  }

  for (const candidate of candidates) {
    const outputFilename = `${candidate.postId}.png`;
    const outputPath = resolve(OUTPUT_DIR, outputFilename);

    if (!nextEntries.has(candidate.postId) && existsSync(outputPath)) {
      nextEntries.set(candidate.postId, {
        postId: candidate.postId,
        localPath: `/thumbnails/xiaohongshu/review/${outputFilename}`,
        contentType: "image/png",
        sourceUrl: candidate.rawUrl
      });
    }

    if (nextEntries.has(candidate.postId)) {
      continue;
    }

    try {
      const captured = await captureLocalCover(candidate);
      nextEntries.set(captured.postId, captured);
      console.log(`captured ${captured.postId} -> ${captured.localPath}`);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      failures.push(reason);
      console.error(reason);
    }
  }

  const manifest: LocalThumbnailManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    items: [...nextEntries.values()].sort((left, right) => left.postId.localeCompare(right.postId))
  };

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`wrote manifest ${MANIFEST_PATH} (${manifest.items.length} items)`);

  if (failures.length > 0) {
    throw new Error(`Failed to capture ${failures.length} Xiaohongshu local covers`);
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
