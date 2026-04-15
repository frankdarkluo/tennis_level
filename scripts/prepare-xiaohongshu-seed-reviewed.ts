import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";
import {
  buildXiaohongshuSeedReviewedArtifact,
  parseXiaohongshuSeedReviewInput
} from "./lib/xiaohongshuSeedReviews";

registerSrcAlias();

const INPUT_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-seed-candidates.json");
const REVIEW_INPUT_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-seed-review-input.json");
const OUTPUT_DIR = resolve(process.cwd(), "ops/quality");
const OUTPUT_PATH = resolve(OUTPUT_DIR, "xiaohongshu-seed-reviewed.json");

function main() {
  const rawCandidateInput = readFileSync(INPUT_PATH, "utf8");
  const candidateArtifact = JSON.parse(rawCandidateInput) as import("./lib/xiaohongshuSeedCandidates").XiaohongshuSeedCandidateArtifact;
  const rawReviewInput = readFileSync(REVIEW_INPUT_PATH, "utf8");
  const parsedReviewInput = parseXiaohongshuSeedReviewInput(rawReviewInput, {
    allowedCandidateIds: new Set(candidateArtifact.candidates.map((candidate) => candidate.candidateId))
  });

  const reviewedArtifact = buildXiaohongshuSeedReviewedArtifact({
    generatedAt: new Date().toISOString(),
    candidateArtifact,
    decisions: parsedReviewInput.decisions
  });

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(reviewedArtifact, null, 2)}\n`, "utf8");

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`reviewed=${reviewedArtifact.summary.reviewedCount}`);
  console.log(`verified=${reviewedArtifact.summary.verifiedCount}`);
  console.log(`ready_for_runtime=${reviewedArtifact.summary.readyForRuntimeCount}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
