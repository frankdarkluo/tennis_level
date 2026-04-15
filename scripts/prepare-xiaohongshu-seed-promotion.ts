import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { registerSrcAlias } from "./lib/registerSrcAlias";
import { buildXiaohongshuSeedPromotionPreview } from "./lib/xiaohongshuSeedPromotion";

registerSrcAlias();

const INPUT_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-seed-reviewed.json");
const OUTPUT_DIR = resolve(process.cwd(), "ops/quality");
const OUTPUT_PATH = resolve(OUTPUT_DIR, "xiaohongshu-seed-promotion.latest.json");

function main() {
  const rawInput = readFileSync(INPUT_PATH, "utf8");
  const reviewedArtifact = JSON.parse(rawInput) as import("./lib/xiaohongshuSeedReviews").XiaohongshuSeedReviewedArtifact;
  const preview = buildXiaohongshuSeedPromotionPreview({
    generatedAt: new Date().toISOString(),
    reviewedArtifact
  });

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(preview, null, 2)}\n`, "utf8");

  console.log(`Wrote ${OUTPUT_PATH}`);
  console.log(`ready_for_runtime=${preview.summary.readyForRuntimeCount}`);
  console.log(`already_promoted=${preview.summary.alreadyPromotedCount}`);
  console.log(`pending_promotion=${preview.summary.pendingPromotionCount}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
