import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";

registerSrcAlias();

const { contents } = require("../src/data/contents") as typeof import("../src/data/contents");
const { expandedContents } = require("../src/data/expandedContents") as typeof import("../src/data/expandedContents");
const {
  buildManualReviewImportArtifacts
} = require("./lib/manualReviewImport") as typeof import("./lib/manualReviewImport");

const DEFAULT_INPUT_PATH = resolve(process.cwd(), "ops/quality/content-manual-review.input.json");
const TEMPLATE_PATH = resolve(process.cwd(), "ops/quality/content-manual-review.template.json");
const PREVIEW_PATH = resolve(process.cwd(), "ops/quality/content-quality-review-import.latest.json");
const OVERLAY_PATH = resolve(process.cwd(), "src/data/contentQualityReviews.ts");

function getArgValue(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }

  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : null;
}

function main() {
  const inputPath = resolve(process.cwd(), getArgValue("--input") ?? "ops/quality/content-manual-review.input.json");
  const applyOverlay = process.argv.includes("--apply");
  const rawInput = readFileSync(inputPath, "utf8");
  const allowedContentIds = new Set([...contents, ...expandedContents].map((item) => item.id));
  const artifacts = buildManualReviewImportArtifacts({
    rawInput,
    allowedContentIds
  });

  mkdirSync(resolve(process.cwd(), "ops/quality"), { recursive: true });
  writeFileSync(PREVIEW_PATH, `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    inputPath,
    overlayEntries: artifacts.overlayEntries,
    summary: artifacts.summary
  }, null, 2)}\n`, "utf8");

  if (applyOverlay) {
    writeFileSync(OVERLAY_PATH, artifacts.moduleSource, "utf8");
  }

  console.log(`Manual review input: ${inputPath}`);
  console.log(`Template path: ${TEMPLATE_PATH}`);
  console.log(`Preview artifact: ${PREVIEW_PATH}`);
  console.log(`imported=${artifacts.summary.importedCount}`);
  console.log(`skipped=${artifacts.summary.skippedCount}`);

  if (applyOverlay) {
    console.log(`Overlay updated: ${OVERLAY_PATH}`);
  } else {
    console.log("Dry run only. Pass --apply to write src/data/contentQualityReviews.ts");
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
