import { contents } from "../src/data/contents";
import { contentQualityReviews } from "../src/data/contentQualityReviews";
import { expandedContents } from "../src/data/expandedContents";
import { creators } from "../src/data/creators";
import { diagnosisRules } from "../src/data/diagnosisRules";
import { planTemplates } from "../src/data/planTemplates";
import {
  getMissingCanonicalTagPairs,
  getNormalizedProblemTagSignature,
  isDirectLibraryVideo,
  normalizeProblemTags,
  uniqueStrings
} from "./lib/contentNormalization";

type ValidationIssue = {
  severity: "error" | "warning";
  scope: string;
  message: string;
};

const strictWarnings = process.argv.includes("--strict-warnings");
const issues: ValidationIssue[] = [];

function pushIssue(issue: ValidationIssue) {
  issues.push(issue);
}

function pushError(scope: string, message: string) {
  pushIssue({ severity: "error", scope, message });
}

function pushWarning(scope: string, message: string) {
  pushIssue({ severity: "warning", scope, message });
}

const allContents = [...contents, ...expandedContents];
const contentIds = new Set(allContents.map((item) => item.id));
const creatorIds = new Set(creators.map((creator) => creator.id));
const problemTags = new Set(diagnosisRules.map((rule) => rule.problemTag));
const curatedContentIds = new Set(contents.map((item) => item.id));
const TEMPLATE_ONLY_PROBLEM_TAGS = new Set(["cant-self-practice", "general-improvement"]);
const reviewedContentIds = new Set<string>();

for (const rule of diagnosisRules) {
  if (new Set(rule.recommendedContentIds).size !== rule.recommendedContentIds.length) {
    pushWarning(
      `diagnosisRules:${rule.id}`,
      "recommendedContentIds 存在重复项"
    );
  }

  const validRecommendedItems = rule.recommendedContentIds
    .map((contentId) => allContents.find((item) => item.id === contentId))
    .filter((item): item is (typeof allContents)[number] => Boolean(item));

  if (validRecommendedItems.length > 0) {
    const hasProblemTagAlignedContent = validRecommendedItems.some((item) =>
      normalizeProblemTags(item.problemTags).includes(rule.problemTag)
    );
    const hasCategorySkillAlignedContent = validRecommendedItems.some((item) =>
      item.skills.some((skill) => rule.category.includes(skill))
    );

    if (!hasProblemTagAlignedContent && !hasCategorySkillAlignedContent) {
      pushWarning(
        `diagnosisRules:${rule.id}`,
        `recommendedContentIds 与 rule problemTag(${rule.problemTag}) 和 category(${rule.category.join(",")}) 的语义对齐较弱`
      );
    }
  }

  for (const contentId of rule.recommendedContentIds) {
    if (!contentIds.has(contentId)) {
      pushError(
        `diagnosisRules:${rule.id}`,
        `recommendedContentId "${contentId}" 在 contents.ts 中不存在`
      );
    }
  }
}

for (const item of allContents) {
  if (!creatorIds.has(item.creatorId)) {
    pushError(
      `content:${item.id}`,
      `creatorId "${item.creatorId}" 在 creators.ts 中不存在`
    );
  }

  if (!item.url.trim()) {
    pushError(`content:${item.id}`, "url 为空");
  }

  if (item.problemTags.length === 0) {
    pushError(`content:${item.id}`, "problemTags 为空");
  }

  if (new Set(item.problemTags).size !== item.problemTags.length) {
    pushWarning(`content:${item.id}`, "problemTags 存在重复项");
  }

  const missingCanonicalPairs = getMissingCanonicalTagPairs(item.problemTags);
  if (missingCanonicalPairs.length > 0) {
    const pairText = uniqueStrings(missingCanonicalPairs.map((pair) => `${pair.legacyTag}->${pair.canonicalTag}`)).join(", ");
    const isCuratedDirectVideo = curatedContentIds.has(item.id) && isDirectLibraryVideo(item);

    if (isCuratedDirectVideo) {
      pushError(
        `content:${item.id}`,
        `直链资源存在 legacy 标签但缺少 canonical 标签: ${pairText}`
      );
    } else {
      pushWarning(
        `content:${item.id}`,
        `存在 legacy 标签但缺少 canonical 标签: ${pairText}`
      );
    }
  }
}

for (const template of planTemplates) {
  if (!problemTags.has(template.problemTag) && !TEMPLATE_ONLY_PROBLEM_TAGS.has(template.problemTag)) {
    pushError(
      `planTemplates:${template.problemTag}:${template.level}`,
      `problemTag "${template.problemTag}" 没有对应的 diagnosis rule`
    );
  }
}

for (const review of contentQualityReviews) {
  if (reviewedContentIds.has(review.contentId)) {
    pushError(
      `contentQualityReviews:${review.contentId}`,
      `contentId "${review.contentId}" 存在重复 review 记录`
    );
  }
  reviewedContentIds.add(review.contentId);

  if (!contentIds.has(review.contentId)) {
    pushError(
      `contentQualityReviews:${review.contentId}`,
      `contentId "${review.contentId}" 在内容库中不存在`
    );
  }

  if (review.lastVerifiedAt) {
    const timestamp = Date.parse(review.lastVerifiedAt);
    if (Number.isNaN(timestamp)) {
      pushError(
        `contentQualityReviews:${review.contentId}`,
        `lastVerifiedAt "${review.lastVerifiedAt}" 不是合法时间戳`
      );
    }
  }

  if (
    typeof review.metadataSimilarityScore === "number" &&
    (review.metadataSimilarityScore < 0 || review.metadataSimilarityScore > 1)
  ) {
    pushError(
      `contentQualityReviews:${review.contentId}`,
      `metadataSimilarityScore 必须落在 0 到 1 之间`
    );
  }
}

const expandedConcentrationMap = new Map<string, string[]>();
for (const item of expandedContents) {
  const signature = getNormalizedProblemTagSignature(item.problemTags);
  const key = `${item.creatorId}::${signature}`;
  const group = expandedConcentrationMap.get(key) ?? [];
  group.push(item.id);
  expandedConcentrationMap.set(key, group);
}

for (const [groupKey, ids] of expandedConcentrationMap.entries()) {
  if (ids.length >= 8) {
    pushWarning(
      `expandedContents:${groupKey}`,
      `同创作者+同标签簇候选过密(${ids.length}条)，可能增加候选重复风险`
    );
  }
}

const errorIssues = issues.filter((issue) => issue.severity === "error");
const warningIssues = issues.filter((issue) => issue.severity === "warning");

const summaryLines = [
  `诊断规则: ${diagnosisRules.length} 条`,
  `静态内容: ${contents.length} 条`,
  `扩展内容: ${expandedContents.length} 条`,
  `总内容条目: ${allContents.length} 条`,
  `质量 review: ${contentQualityReviews.length} 条`,
  `博主数量: ${creators.length} 位`,
  `训练计划: ${planTemplates.length} 套`,
  `错误: ${errorIssues.length} 项`,
  `告警: ${warningIssues.length} 项`
];

console.log("数据校验开始");
for (const line of summaryLines) {
  console.log(`- ${line}`);
}

if (warningIssues.length > 0) {
  console.warn(`校验告警: 共发现 ${warningIssues.length} 个风险提示。`);
  for (const issue of warningIssues) {
    console.warn(`- [${issue.scope}] ${issue.message}`);
  }
}

if (errorIssues.length === 0 && (!strictWarnings || warningIssues.length === 0)) {
  console.log("校验通过: 未发现数据一致性问题。");
  process.exit(0);
}

const failedCount = strictWarnings ? errorIssues.length + warningIssues.length : errorIssues.length;
console.error(`校验失败: 共发现 ${failedCount} 个问题。`);
for (const issue of strictWarnings ? issues : errorIssues) {
  console.error(`- [${issue.scope}] ${issue.message}`);
}

process.exit(1);
