import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";

registerSrcAlias();

const { contents } = require("../src/data/contents") as typeof import("../src/data/contents");
const { expandedContents } = require("../src/data/expandedContents") as typeof import("../src/data/expandedContents");
const { diagnosisRules } = require("../src/data/diagnosisRules") as typeof import("../src/data/diagnosisRules");
const {
  buildProblemTagCoverageReport,
  renderProblemTagCoverageMarkdown
} = require("./lib/qualityMetrics") as typeof import("./lib/qualityMetrics");

const OUTPUT_DIR = resolve(process.cwd(), "ops/quality");
const JSON_PATH = resolve(OUTPUT_DIR, "problem-tag-coverage.latest.json");
const MARKDOWN_PATH = resolve(OUTPUT_DIR, "problem-tag-coverage.latest.md");

export function createProblemTagCoverageArtifacts() {
  const generatedAt = new Date().toISOString();
  const report = buildProblemTagCoverageReport({
    contents,
    expandedContents,
    diagnosisRules
  });

  const payload = {
    generatedAt,
    methodology: {
      companionMetric: "problem_tag_direct_coverage_3plus_rate",
      verificationBasis: report.verificationBasis,
      note: "This baseline counts catalog-inferred direct_source inventory. Remote verification lands in a later PR and should tighten this metric."
    },
    ...report
  };

  const markdownSections = [
    renderProblemTagCoverageMarkdown(report).trimEnd(),
    "",
    "## Notes",
    "",
    "- This report is the companion inventory-layer metric for recommendation quality.",
    "- It intentionally uses the current catalog/connector rights inference and does not claim remote verification yet.",
    "- Review this together with `recommendation-quality.latest.md` so output-layer direct-source success does not hide weak-tag inventory gaps."
  ];

  return {
    json: payload,
    markdown: `${markdownSections.join("\n")}\n`
  };
}

function main() {
  const artifacts = createProblemTagCoverageArtifacts();
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(JSON_PATH, `${JSON.stringify(artifacts.json, null, 2)}\n`, "utf8");
  writeFileSync(MARKDOWN_PATH, artifacts.markdown, "utf8");

  console.log(`Wrote ${JSON_PATH}`);
  console.log(`Wrote ${MARKDOWN_PATH}`);
  console.log(
    `problem_tag_direct_coverage_3plus_rate=${artifacts.json.summary.problemTagDirectCoverage3plusRate.toFixed(4)}`
  );
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
