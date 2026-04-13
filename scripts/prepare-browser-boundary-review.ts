import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";

registerSrcAlias();

const {
  buildBrowserBoundaryReviewQueue,
  renderBrowserBoundaryReviewMarkdown
} = require("./lib/browserReviewQueue") as typeof import("./lib/browserReviewQueue");

const DEFAULT_REPORT_PATH = resolve(process.cwd(), "ops/quality/content-remote-check.latest.json");
const OUTPUT_DIR = resolve(process.cwd(), "ops/quality");
const JSON_PATH = resolve(OUTPUT_DIR, "content-browser-boundary-review.latest.json");
const MARKDOWN_PATH = resolve(OUTPUT_DIR, "content-browser-boundary-review.latest.md");

type RemoteReport = {
  records?: import("./lib/remoteVerification").RemoteVerificationRecord[];
};

function getArgValue(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }

  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : null;
}

function main() {
  const reportPath = resolve(process.cwd(), getArgValue("--input") ?? "ops/quality/content-remote-check.latest.json");
  const parsed = JSON.parse(readFileSync(reportPath, "utf8")) as RemoteReport;
  const candidates = buildBrowserBoundaryReviewQueue(parsed.records ?? []);
  const payload = {
    generatedAt: new Date().toISOString(),
    sourceReportPath: reportPath,
    candidateCount: candidates.length,
    candidates
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  writeFileSync(MARKDOWN_PATH, renderBrowserBoundaryReviewMarkdown(candidates), "utf8");

  console.log(`Wrote ${JSON_PATH}`);
  console.log(`Wrote ${MARKDOWN_PATH}`);
  console.log(`candidates=${candidates.length}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
