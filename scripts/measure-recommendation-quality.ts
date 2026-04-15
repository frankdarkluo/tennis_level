import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { PlayerProfileVector, ScoredDimension } from "../src/types/assessment";
import type { ContentItem } from "../src/types/content";
import type { RecommendationSample } from "./lib/qualityMetrics";
import { registerSrcAlias } from "./lib/registerSrcAlias";

registerSrcAlias();

const {
  buildRecommendationQualityReport,
  renderRecommendationQualityMarkdown
} = require("./lib/qualityMetrics") as typeof import("./lib/qualityMetrics");
const { contents } = require("../src/data/contents") as typeof import("../src/data/contents");
const { diagnosisRules } = require("../src/data/diagnosisRules") as typeof import("../src/data/diagnosisRules");
const { expandedContents } = require("../src/data/expandedContents") as typeof import("../src/data/expandedContents");
const { planFewShotFixtures } = require("../src/data/planFewShotFixtures") as typeof import("../src/data/planFewShotFixtures");
const { ASSESSMENT_DIMENSION_PLAN_HINTS } = require("../src/lib/plan-core/problemTagSupport") as typeof import("../src/lib/plan-core/problemTagSupport");
const { diagnoseProblem } = require("../src/lib/diagnosis") as typeof import("../src/lib/diagnosis");
const { buildAssessmentPlanContext, buildDiagnosisPlanCandidateIds } = require("../src/lib/plans") as typeof import("../src/lib/plans");
const { retrieveCatalogRecommendations } = require("../src/lib/content-catalog/retrieve") as typeof import("../src/lib/content-catalog/retrieve");

const OUTPUT_DIR = resolve(process.cwd(), "ops/quality");
const JSON_PATH = resolve(OUTPUT_DIR, "recommendation-quality.latest.json");
const MARKDOWN_PATH = resolve(OUTPUT_DIR, "recommendation-quality.latest.md");
const allContents = [...contents, ...expandedContents];
const contentById = new Map(allContents.map((item) => [item.id, item]));

function detectLocale(text: string): "zh" | "en" {
  if (/[\u4e00-\u9fff]/.test(text)) {
    return "zh";
  }

  return "en";
}

function pickRuleInput(rule: (typeof diagnosisRules)[number]): { text: string; locale: "zh" | "en" } {
  const synonyms = rule.synonyms ?? [];
  const english = synonyms.find((value) => /[A-Za-z]/.test(value));
  if (english) {
    return { text: english, locale: "en" };
  }

  const chinese = synonyms.find((value) => /[\u4e00-\u9fff]/.test(value));
  if (chinese) {
    return { text: chinese, locale: "zh" };
  }

  const fallback = rule.keywords.join(" ");
  return {
    text: fallback,
    locale: detectLocale(fallback)
  };
}

function createAssessmentProfile(primaryWeakness: ScoredDimension): PlayerProfileVector {
  const dimensions = Object.keys(ASSESSMENT_DIMENSION_PLAN_HINTS) as ScoredDimension[];
  const secondaryWeakness = dimensions.find((dimension) => dimension !== primaryWeakness) ?? primaryWeakness;
  const strongDimensions = dimensions.filter(
    (dimension) => dimension !== primaryWeakness && dimension !== secondaryWeakness
  );

  const dimensionScores = dimensions.reduce<PlayerProfileVector["dimensionScores"]>((scores, dimension) => {
    scores[dimension] = 3;
    return scores;
  }, {} as PlayerProfileVector["dimensionScores"]);

  dimensionScores[primaryWeakness] = 1;
  dimensionScores[secondaryWeakness] = 2;

  return {
    rawScore: 28,
    levelBand: "3.5",
    dimensionScores,
    weakDimensions: [primaryWeakness, secondaryWeakness],
    strongDimensions,
    primaryWeakness,
    secondaryWeakness,
    playStyle: "baseline_attack",
    playContext: "singles_standard",
    summary: {
      headline: `Assessment sample for ${primaryWeakness}`,
      oneLineLevelSummary: "Synthetic PR1 assessment sample.",
      oneLinePlanHint: "Use the weakest area to seed plan retrieval."
    }
  };
}

function createDiagnosisRuleSeededSamples(): RecommendationSample[] {
  return diagnosisRules.map((rule) => {
    const items = retrieveCatalogRecommendations({
      source: "diagnosis",
      contentPool: contents,
      expandedContentPool: expandedContents,
      environment: "production",
      problemTags: [rule.problemTag],
      skillCategories: rule.category,
      lexicalTerms: [...rule.keywords, ...(rule.synonyms ?? []).slice(0, 3)],
      preferredIds: rule.recommendedContentIds,
      maxResults: 3,
      level: rule.fallbackLevel?.[0]
    });

    return {
      id: `diagnosis_rule_seeded:${rule.id}`,
      lane: "diagnosis_rule_seeded",
      source: "diagnosis",
      description: `Seeded diagnosis retrieval for ${rule.problemTag}`,
      expectedProblemTag: rule.problemTag,
      matchedProblemTag: rule.problemTag,
      matchedRuleId: rule.id,
      items
    };
  });
}

function createDiagnosisStandardSamples(): RecommendationSample[] {
  return diagnosisRules.map((rule) => {
    const { text, locale } = pickRuleInput(rule);
    const result = diagnoseProblem(text, {
      level: rule.fallbackLevel?.[0],
      locale,
      effortMode: "standard",
      environment: "production"
    });

    return {
      id: `diagnosis_standard:${rule.id}`,
      lane: "diagnosis_standard",
      source: "diagnosis",
      description: `Standard diagnosis sample for ${rule.problemTag}`,
      expectedProblemTag: rule.problemTag,
      matchedProblemTag: result.problemTag,
      matchedRuleId: result.matchedRuleId,
      items: result.recommendedContents
    };
  });
}

function createDiagnosisDeepSamples(): RecommendationSample[] {
  return planFewShotFixtures
    .filter((fixture) => fixture.deepContext)
    .map((fixture) => {
      const deepContext = fixture.deepContext!;
      const result = diagnoseProblem(deepContext.sourceInput || fixture.diagnosisInput, {
        level: fixture.level,
        locale: fixture.locale,
        effortMode: "deep",
        environment: "production",
        deepHandoff: deepContext
      });

      return {
        id: `diagnosis_deep:${fixture.id}`,
        lane: "diagnosis_deep",
        source: "diagnosis",
        description: `Deep diagnosis sample for ${fixture.problemTag}`,
        expectedProblemTag: fixture.problemTag,
        matchedProblemTag: result.problemTag,
        matchedRuleId: result.matchedRuleId,
        items: result.recommendedContents
      };
    });
}

function createAssessmentPlanSamples(): RecommendationSample[] {
  return (Object.keys(ASSESSMENT_DIMENSION_PLAN_HINTS) as ScoredDimension[]).map((dimension) => {
    const profile = createAssessmentProfile(dimension);
    const context = buildAssessmentPlanContext(profile);
    const items = context.candidateIds
      .map((id) => contentById.get(id))
      .filter((item): item is ContentItem => Boolean(item));

    return {
      id: `assessment_plan:${dimension}`,
      lane: "assessment_plan",
      source: "plan",
      description: `Assessment-to-plan sample for ${dimension}`,
      expectedProblemTag: context.problemTag,
      matchedProblemTag: context.problemTag,
      items
    };
  });
}

function createDiagnosisPlanSamples(): RecommendationSample[] {
  return planFewShotFixtures.map((fixture) => {
    const diagnosis = diagnoseProblem(fixture.deepContext?.sourceInput || fixture.diagnosisInput, {
      level: fixture.level,
      locale: fixture.locale,
      effortMode: fixture.deepContext ? "deep" : "standard",
      environment: "production",
      deepHandoff: fixture.deepContext
    });
    const candidateIds = buildDiagnosisPlanCandidateIds({
      problemTag: diagnosis.problemTag,
      level: fixture.level,
      recommendedContentIds: diagnosis.recommendedContents.map((item) => item.id),
      diagnosisInput: fixture.diagnosisInput,
      guidanceContext: diagnosis.guidanceContext,
      maxCandidates: 3
    });
    const items = candidateIds
      .map((id) => contentById.get(id))
      .filter((item): item is ContentItem => Boolean(item));

    return {
      id: `diagnosis_plan:${fixture.id}`,
      lane: "diagnosis_plan",
      source: "plan",
      description: `Diagnosis-conditioned plan sample for ${fixture.problemTag}`,
      expectedProblemTag: fixture.problemTag,
      matchedProblemTag: diagnosis.problemTag,
      matchedRuleId: diagnosis.matchedRuleId,
      items
    };
  });
}

export function createRecommendationQualityArtifacts() {
  const generatedAt = new Date().toISOString();
  const samples = [
    ...createDiagnosisRuleSeededSamples(),
    ...createDiagnosisStandardSamples(),
    ...createDiagnosisDeepSamples(),
    ...createDiagnosisPlanSamples(),
    ...createAssessmentPlanSamples()
  ];
  const report = buildRecommendationQualityReport({
    contents,
    expandedContents,
    samples
  });

  const sampleCounts = {
    diagnosisRuleSeeded: samples.filter((sample) => sample.lane === "diagnosis_rule_seeded").length,
    diagnosisStandard: samples.filter((sample) => sample.lane === "diagnosis_standard").length,
    diagnosisDeep: samples.filter((sample) => sample.lane === "diagnosis_deep").length,
    diagnosisPlan: samples.filter((sample) => sample.lane === "diagnosis_plan").length,
    assessmentPlan: samples.filter((sample) => sample.lane === "assessment_plan").length
  };
  const problemTagMismatches = report.samples.filter(
    (sample) => sample.expectedProblemTag && sample.matchedProblemTag && sample.expectedProblemTag !== sample.matchedProblemTag
  );
  const payload = {
    generatedAt,
    methodology: {
      verificationBasis: report.verificationBasis,
      note: "This output-layer metric is expected to run high because default retrieval already restricts to direct_source. Pair it with problem-tag direct coverage and the attached-flow metrics section below.",
      sampleCounts
    },
    mismatchedProblemTagSamples: problemTagMismatches,
    ...report
  };

  const markdownSections = [
    renderRecommendationQualityMarkdown(report).trimEnd(),
    "",
    "## Notes",
    "",
    "- This is an output-layer metric only and is structurally biased upward by the current direct_source-only default retrieval boundary.",
    "- Review this together with `problem-tag-coverage.latest.md` so weak-tag inventory gaps remain visible.",
    "- `manual_relevance_accept_rate@3` currently uses a `manual_qc_or_verified_proxy` basis until richer explicit relevance labels are added to QA.",
    `- Sample counts: diagnosis_rule_seeded=${sampleCounts.diagnosisRuleSeeded}, diagnosis_standard=${sampleCounts.diagnosisStandard}, diagnosis_deep=${sampleCounts.diagnosisDeep}, diagnosis_plan=${sampleCounts.diagnosisPlan}, assessment_plan=${sampleCounts.assessmentPlan}.`
  ];

  if (problemTagMismatches.length > 0) {
    markdownSections.push("", "## Problem Tag Mismatches", "");
    for (const sample of problemTagMismatches) {
      markdownSections.push(
        `- ${sample.id}: expected=${sample.expectedProblemTag} matched=${sample.matchedProblemTag ?? "null"}`
      );
    }
  }

  return {
    json: payload,
    markdown: `${markdownSections.join("\n")}\n`
  };
}

function main() {
  const artifacts = createRecommendationQualityArtifacts();
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(JSON_PATH, `${JSON.stringify(artifacts.json, null, 2)}\n`, "utf8");
  writeFileSync(MARKDOWN_PATH, artifacts.markdown, "utf8");

  console.log(`Wrote ${JSON_PATH}`);
  console.log(`Wrote ${MARKDOWN_PATH}`);
  console.log(
    `recommendation_direct_source_rate_output=${artifacts.json.summary.recommendationDirectSourceRateOutput?.toFixed(4) ?? "n/a"}`
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
