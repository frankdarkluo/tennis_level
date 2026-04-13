import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";

registerSrcAlias();

const { contents } = require("../src/data/contents") as typeof import("../src/data/contents");
const { expandedContents } = require("../src/data/expandedContents") as typeof import("../src/data/expandedContents");
const { diagnosisRules } = require("../src/data/diagnosisRules") as typeof import("../src/data/diagnosisRules");
const { contentQualityReviews } = require("../src/data/contentQualityReviews") as typeof import("../src/data/contentQualityReviews");
const {
  applyCoverageRemediationView,
  buildCoverageRemediationReport,
  renderCoverageRemediationMarkdown
} = require("./lib/coverageRemediation") as typeof import("./lib/coverageRemediation");

const OUTPUT_DIR = resolve(process.cwd(), "ops/quality");
const JSON_PATH = resolve(OUTPUT_DIR, "problem-tag-remediation.latest.json");
const MARKDOWN_PATH = resolve(OUTPUT_DIR, "problem-tag-remediation.latest.md");

function getArgValue(flag: string): string | null {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return null;
  }

  const value = process.argv[index + 1];
  return value && !value.startsWith("--") ? value : null;
}

function getTopN(): number | null {
  const raw = getArgValue("--top-n");
  if (!raw) {
    return null;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getTagsFilter(): string[] | null {
  const raw = getArgValue("--tags");
  if (!raw) {
    return null;
  }

  const values = raw.split(",").map((value) => value.trim()).filter(Boolean);
  return values.length > 0 ? values : null;
}

function main() {
  const fullReport = buildCoverageRemediationReport({
    contents,
    expandedContents,
    diagnosisRules,
    qualityReviews: contentQualityReviews
  });
  const view = applyCoverageRemediationView(fullReport, {
    topN: getTopN(),
    tagsFilter: getTagsFilter()
  });
  const payload = {
    generatedAt: new Date().toISOString(),
    methodology: {
      scope: "all active diagnostic tags",
      filtersApplied: {
        topN: getTopN(),
        tags: getTagsFilter()
      }
    },
    fullSummary: fullReport.summary,
    ...view
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  writeFileSync(MARKDOWN_PATH, renderCoverageRemediationMarkdown(view), "utf8");

  console.log(`Wrote ${JSON_PATH}`);
  console.log(`Wrote ${MARKDOWN_PATH}`);
  console.log(`ranked_tags=${view.byProblemTag.length}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
