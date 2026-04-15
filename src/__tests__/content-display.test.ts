import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { contents } from "@/data/contents";
import { creators } from "@/data/creators";
import { diagnosisRules } from "@/data/diagnosisRules";
import { expandedContents } from "@/data/expandedContents";
import { planTemplates } from "@/data/planTemplates";
import { CREATOR_FEATURED_VIDEO_CHINESE_SUBTITLE_OVERRIDES } from "@/lib/content/chineseSubtitleOverrides";
import {
  formatCompactViewCount,
  getCreatorBio,
  getCreatorShortDescription,
  getContentFocusLine,
  getContentPrimaryTitle,
  getContentSecondaryTitle,
  getEnglishGloss,
  getFeaturedVideoPrimaryTitle,
  getFeaturedVideoSecondaryTitle,
  getFeaturedVideoTarget,
  resolveFeaturedVideoChineseTitleSuggestion,
  resolveChineseSecondaryTitleForEnglishContent
} from "@/lib/content/display";
import { extractDiagnosisSignalBundle, findBestDiagnosisRule, getDiagnosisTitle } from "@/lib/diagnosis";
import { formatLocalizedDate, formatLocalizedDateTime } from "@/lib/i18n/format";
import {
  buildAssessmentPlanContext,
  buildDiagnosisPlanCandidateIds,
  buildPlanHref,
  getPlanFromDiagnosis,
  getPlanTemplate,
  normalizePlanDraftSnapshot,
  parsePlanContentIds
} from "@/lib/plans";
import { ContentItem } from "@/types/content";

describe("content display helpers", () => {
  it("renders an English primary title and Chinese secondary title for Bilibili items", () => {
    const item = contents.find((entry) => entry.id === "content_gaiao_02");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_gaiao_02");
    }

    expect(getContentPrimaryTitle(item, "en")).toBe("Serve fundamentals: build rhythm before power");
    expect(getContentSecondaryTitle(item, "en")).toContain("网球发球");
  });

  it("keeps English fallback titles free of mixed Chinese text", () => {
    const item = contents.find((entry) => entry.id === "content_gaiao_04");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_gaiao_04");
    }

    const gloss = getEnglishGloss(item);
    expect(gloss).toBe("Forehand topspin: start with the right grip and arc");
    expect(/[\u3400-\u9fff]/.test(gloss)).toBe(false);
  });

  it("uses the English focus-line override for prioritized study content", () => {
    const item = contents.find((entry) => entry.id === "content_fr_01");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_fr_01");
    }

    expect(getContentFocusLine(item, "en")).toBe(
      "For backhands that keep finding the net or making contact too late."
    );
  });

  it("keeps English focus fallbacks visible for Chinese videos without manual English copy", () => {
    const item: ContentItem = {
      id: "synthetic_focus_fallback",
      title: "中文教学标题",
      creatorId: "creator_gaiao",
      platform: "Bilibili",
      type: "video",
      levels: ["2.5"],
      skills: ["basics"],
      problemTags: ["no-clear-technique"],
      language: "zh",
      summary: "中文字幕整理型资料库，基础内容全",
      reason: "基础动作总立不住",
      useCases: ["基础动作总立不住"],
      coachReason: "",
      url: "https://example.com/focus-fallback"
    };

    expect(getContentPrimaryTitle(item, "en")).toBe("Fundamentals keep breaking down");
    expect(getContentFocusLine(item, "en")).toBe("Subtitled reference library with full fundamentals");
  });

  it("uses creator featured-video English title and target overrides", () => {
    const creator = creators.find((entry) => entry.id === "creator_gaiao");
    const video = creator?.featuredVideos?.find((entry) => entry.id === "creator_gaiao_video_01");

    expect(creator).toBeTruthy();
    expect(video).toBeTruthy();
    if (!creator || !video) {
      throw new Error("Missing creator_gaiao featured video");
    }

    expect(getFeaturedVideoPrimaryTitle(video, "en", creator)).toBe("Detailed beginner forehand lesson");
    expect(getFeaturedVideoSecondaryTitle(video, "en", creator)).toBe("详细版 网球正手零基础教学");
    expect(getFeaturedVideoTarget(video, "en", creator)).toBe("When your forehand foundation never feels stable");
  });

  it("generates a polished Chinese subtitle suggestion for English creator videos", () => {
    const creator = creators.find((entry) => entry.id === "creator_venus_williams");
    const video = creator?.featuredVideos?.find((entry) => entry.id === "creator_venus_williams_video_01");

    expect(creator).toBeTruthy();
    expect(video).toBeTruthy();
    if (!creator || !video) {
      throw new Error("Missing creator_venus_williams featured video");
    }

    expect(resolveFeaturedVideoChineseTitleSuggestion(video, creator)).toMatchObject({
      title: "跟维纳斯·威廉姆斯学网球基础发球",
      source: "manual"
    });
    expect(getFeaturedVideoSecondaryTitle(video, "zh", creator)).toBe("跟维纳斯·威廉姆斯学网球基础发球");
  });

  it("builds creator-video suggestions from structured title patterns like masterclass episodes", () => {
    const suggestion = resolveFeaturedVideoChineseTitleSuggestion({
      id: "synthetic_masterclass_episode",
      title: "The return of serve: TENNIS MASTERCLASS by Patrick Mouratoglou, EPISODE 1",
      target: "接发启动总是偏慢"
    }, {
      name: "Patrick Mouratoglou",
      specialties: ["return", "serve"]
    });

    expect(suggestion).toMatchObject({
      title: "接发球精讲：莫拉托格鲁大师课第1集",
      source: "title_template"
    });
  });

  it("formats view counts by locale", () => {
    expect(formatCompactViewCount(150977, "zh")).toBe("15.1万");
    expect(formatCompactViewCount(150977, "en")).toMatch(/^151K$/i);
  });

  it("formats dates and times by locale", () => {
    const value = "2025-03-01T12:00:00.000Z";

    expect(formatLocalizedDate(value, "en")).toBeTruthy();
    expect(formatLocalizedDate(value, "zh")).toContain("2025");
    expect(formatLocalizedDateTime(value, "en")).toContain("2025");
    expect(formatLocalizedDateTime(value, "zh")).toContain("2025");
  });

  it("routes plan generation through localized blueprint contracts while keeping fallback generation", () => {
    const exactEn = getPlanTemplate("backhand-into-net", "3.0", "en");
    const exactZh = getPlanTemplate("backhand-into-net", "3.0", "zh");
    const fallbackEn = getPlanTemplate("unknown-problem", "3.0", "en");

    expect(exactEn.source).toBe("template");
    expect(exactEn.title).toBe("7-Step Backhand Blueprint Plan");
    expect(exactEn.target).toContain("seven-step blueprint");
    expect(exactEn.days[0]).toMatchObject({
      drill: expect.any(String),
      load: expect.any(String),
      executionFocus: expect.any(String),
      duration: expect.any(String)
    });

    expect(exactZh.title).toBe("反手蓝图式 7 步训练计划");
    expect(exactZh.days[0]).toMatchObject({
      drill: expect.any(String),
      load: expect.any(String),
      executionFocus: expect.any(String),
      duration: expect.any(String)
    });

    expect(fallbackEn.source).toBe("fallback");
    expect(fallbackEn.days[0].drill).toBeTruthy();
  });

  it("includes prescription metadata on generated plan days", () => {
    const plan = getPlanTemplate("second-serve-reliability", "3.5", "zh");

    expect(plan.days[0]).toMatchObject({
      drill: expect.any(String),
      load: expect.any(String),
      executionFocus: expect.any(String),
      goal: expect.any(String),
      warmupBlock: {
        title: expect.any(String),
        items: expect.any(Array)
      },
      mainBlock: {
        title: expect.any(String),
        items: expect.any(Array)
      },
      pressureBlock: {
        title: expect.any(String),
        items: expect.any(Array)
      },
      successCriteria: expect.any(Array),
      intensity: expect.stringMatching(/^(low|medium|medium_high)$/),
      tempo: expect.stringMatching(/^(slow|controlled|match_70)$/)
    });
  });

  it("aligns day 1 goal and done criteria with diagnosis primary next step", () => {
    const primaryNextStep = "先把引拍提前半拍再出手";
    const plan = getPlanTemplate("backhand-into-net", "3.0", "zh", [], { primaryNextStep });

    expect(plan.summary).toContain(primaryNextStep);
    expect(plan.days[0]?.focus).toBe(primaryNextStep);
    expect(plan.days[0]?.goal).toBe(primaryNextStep);
    expect(plan.days[0]?.successCriteria[0]).toContain(primaryNextStep);
  });

  it("keeps diagnosis-origin plans on one explicit primary focus across summary target and day 1", () => {
    const primaryNextStep = "关键分先把球打高深中路，不要先追求一拍穿越。";
    const plan = getPlanFromDiagnosis({
      problemTag: "forehand-out",
      level: "3.0",
      title: "关键分下的正手出界更明显",
      fixes: [primaryNextStep],
      locale: "zh"
    });

    expect(plan.summary).toContain(primaryNextStep);
    expect(plan.target).toContain(primaryNextStep);
    expect(plan.days[0]?.focus).toBe(primaryNextStep);
    expect(plan.days[0]?.goal).toBe(primaryNextStep);
    expect(plan.days[0]?.successCriteria[0]).toContain(primaryNextStep);
  });

  it("uses prescription blocks for priority study plans", () => {
    const cases = [
      { problemTag: "first-serve-in", level: "3.0" as const },
      { problemTag: "second-serve-reliability", level: "3.5" as const },
      { problemTag: "backhand-into-net", level: "3.0" as const },
      { problemTag: "forehand-out", level: "3.5" as const },
      { problemTag: "movement-slow", level: "3.0" as const },
      { problemTag: "net-confidence", level: "3.0" as const },
      { problemTag: "doubles-positioning", level: "3.0" as const },
      { problemTag: "mobility-limit", level: "3.0" as const }
    ];

    for (const { problemTag, level } of cases) {
      const plan = getPlanTemplate(problemTag, level, "zh");

      expect(plan.source).toBe("template");
      expect(plan.days[0]).toMatchObject({
        drill: expect.any(String),
        load: expect.any(String),
        executionFocus: expect.any(String),
        goal: expect.any(String),
        warmupBlock: {
          title: expect.any(String),
          items: expect.any(Array)
        },
        mainBlock: {
          title: expect.any(String),
          items: expect.any(Array)
        },
        pressureBlock: {
          title: expect.any(String),
          items: expect.any(Array)
        },
        successCriteria: expect.any(Array),
        intensity: expect.any(String),
        tempo: expect.any(String)
      });
      expect(plan.days[6]).toMatchObject({
        goal: expect.any(String),
        warmupBlock: {
          title: expect.any(String),
          items: expect.any(Array)
        },
        pressureBlock: {
          title: expect.any(String),
          items: expect.any(Array)
        },
        successCriteria: expect.any(Array)
      });
    }
  });

  it("filters plan templates by environment before resolving the selected plan", () => {
    planTemplates.push({
      problemTag: "environment-probe",
      level: "3.0",
      title: "Production environment plan",
      titleEn: "Production environment plan",
      target: "prod",
      targetEn: "prod",
      environment: "production",
      days: [
        {
          day: 1,
          focus: "prod",
          focusEn: "prod",
          contentIds: [],
          drills: ["prod"],
          drillsEn: ["prod"],
          duration: "20 分钟",
          durationEn: "20 min"
        }
      ]
    });
    planTemplates.push({
      problemTag: "environment-probe",
      level: "3.0",
      title: "Testing environment plan",
      titleEn: "Testing environment plan",
      target: "test",
      targetEn: "test",
      environment: "testing",
      days: [
        {
          day: 1,
          focus: "test",
          focusEn: "test",
          contentIds: [],
          drills: ["test"],
          drillsEn: ["test"],
          duration: "20 分钟",
          durationEn: "20 min"
        }
      ]
    });

    try {
      const plan = getPlanTemplate("environment-probe", "3.0", "en", [], { environment: "testing" });

      expect(plan.title).toBe("Testing environment plan");
      expect(plan.days[0]?.focus).toBe("test");
    } finally {
      planTemplates.pop();
      planTemplates.pop();
    }
  });

  it("gives new serve-timing content explicit English metadata and environment coverage", () => {
    const item = expandedContents.find((entry) => entry.id === "content_expanded_youtube_creator_tenniswithtyler_zxizdcpkhbg");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_expanded_youtube_creator_tenniswithtyler_zxizdcpkhbg");
    }

    expect(item.environment).toEqual(["testing", "production"]);
    expect(item.displayTitleEn).toBeTruthy();
    expect(item.focusLineEn).toBeTruthy();
    expect(getContentPrimaryTitle(item, "en")).toBe(item.displayTitleEn);
    expect(/[\u3400-\u9fff]/.test(getContentFocusLine(item, "en"))).toBe(false);
  });

  it("gives new study-facing creators explicit English metadata and environment coverage", () => {
    const creator = creators.find((entry) => entry.id === "creator_tenniswithtyler");
    const secondaryCreator = creators.find((entry) => entry.id === "creator_best_tennis_tv");

    expect(creator).toBeTruthy();
    expect(secondaryCreator).toBeTruthy();
    if (!creator || !secondaryCreator) {
      throw new Error("Missing new study-facing creator");
    }

    expect(creator.environment).toEqual(["testing", "production"]);
    expect(secondaryCreator.environment).toEqual(["testing", "production"]);
    expect(creator.shortDescriptionEn).toBeTruthy();
    expect(creator.bioEn).toBeTruthy();
    expect(secondaryCreator.shortDescriptionEn).toBeTruthy();
    expect(secondaryCreator.bioEn).toBeTruthy();
    expect(/[\u3400-\u9fff]/.test(getCreatorShortDescription(creator, "en"))).toBe(false);
    expect(/[\u3400-\u9fff]/.test(getCreatorBio(secondaryCreator, "en"))).toBe(false);
  });

  it("keeps new overhead timing candidates on the canonical overhead lane and tags new rule/template entries for both environments", () => {
    const overheadIds = [
      "content_expanded_youtube_creator_patrick_mouratoglou_dkasdyrsseu",
      "content_expanded_youtube_creator_coach_ben_zink_9gx0iuhaivu",
      "content_expanded_youtube_creator_performance_plus_tennis_rynzrqflp94",
      "content_expanded_youtube_creator_2minute_tennis_rzggh0ynlzq",
      "content_expanded_youtube_creator_2minute_tennis_qenjamtncmc",
      "content_expanded_youtube_creator_top_tennis_training_pdm6cmb3ef4",
      "content_expanded_youtube_creator_iron_will_tennis_bzyp0kv8fjg"
    ];

    for (const id of overheadIds) {
      const item = expandedContents.find((entry) => entry.id === id);

      expect(item?.problemTags).toContain("overhead-timing");
      expect(item?.environment).toEqual(["testing", "production"]);
    }

    expect(diagnosisRules.find((entry) => entry.id === "rule_serve_timing")?.environment).toEqual(["testing", "production"]);
    expect(diagnosisRules.find((entry) => entry.id === "rule_overhead_timing")?.environment).toEqual(["testing", "production"]);
    expect(planTemplates.find((entry) => entry.problemTag === "serve-timing" && entry.level === "3.0")?.environment).toEqual(["testing", "production"]);
    expect(planTemplates.find((entry) => entry.problemTag === "overhead-timing" && entry.level === "3.0")?.environment).toEqual(["testing", "production"]);
  });

  it("keeps second-serve English target-box copy aligned with the Chinese side order", () => {
    const plan = getPlanTemplate("second-serve-reliability", "3.5", "en");

    expect(plan.days[1]).toMatchObject({
      drills: ["20 half-motion second serves", "20 slow second serves to the ad court"]
    });

    expect(plan.days[5]).toMatchObject({
      drills: ["15 serves to the ad-court target", "15 serves to the deuce-court target"]
    });
  });

  it("returns fresh mutable day structures across generated and fallback plan calls", () => {
    const generatedA = getPlanTemplate("second-serve-reliability", "3.5", "zh");
    const generatedB = getPlanTemplate("second-serve-reliability", "3.5", "zh");
    const fallbackA = getPlanTemplate("unknown-problem", "3.0", "zh");
    const fallbackB = getPlanTemplate("unknown-problem", "3.0", "zh");

    expect(generatedA.days[0]).not.toBe(generatedB.days[0]);
    expect(generatedA.days[0].contentIds).not.toBe(generatedB.days[0].contentIds);
    expect(generatedA.days[0].drills).not.toBe(generatedB.days[0].drills);
    expect(generatedA.days[0].warmupBlock).not.toBe(generatedB.days[0].warmupBlock);
    expect(generatedA.days[0].warmupBlock.items).not.toBe(generatedB.days[0].warmupBlock.items);
    expect(generatedA.days[0].successCriteria).not.toBe(generatedB.days[0].successCriteria);

    generatedA.days[0].contentIds.push("synthetic-generated-id");
    generatedA.days[0].drills.push("synthetic generated drill");
    generatedA.days[0].warmupBlock.items.push("synthetic generated warmup");
    generatedA.days[0].successCriteria.push("synthetic generated criteria");

    expect(generatedB.days[0].contentIds).not.toContain("synthetic-generated-id");
    expect(generatedB.days[0].drills).not.toContain("synthetic generated drill");
    expect(generatedB.days[0].warmupBlock.items).not.toContain("synthetic generated warmup");
    expect(generatedB.days[0].successCriteria).not.toContain("synthetic generated criteria");

    expect(fallbackA.days[0]).not.toBe(fallbackB.days[0]);
    expect(fallbackA.days[0].contentIds).not.toBe(fallbackB.days[0].contentIds);
    expect(fallbackA.days[0].drills).not.toBe(fallbackB.days[0].drills);
    expect(fallbackA.days[0].mainBlock).not.toBe(fallbackB.days[0].mainBlock);
    expect(fallbackA.days[0].mainBlock.items).not.toBe(fallbackB.days[0].mainBlock.items);
    expect(fallbackA.days[0].successCriteria).not.toBe(fallbackB.days[0].successCriteria);

    fallbackA.days[0].contentIds.push("synthetic-fallback-id");
    fallbackA.days[0].drills.push("synthetic fallback drill");
    fallbackA.days[0].mainBlock.items.push("synthetic fallback main");
    fallbackA.days[0].successCriteria.push("synthetic fallback criteria");

    expect(fallbackB.days[0].contentIds).not.toContain("synthetic-fallback-id");
    expect(fallbackB.days[0].drills).not.toContain("synthetic fallback drill");
    expect(fallbackB.days[0].mainBlock.items).not.toContain("synthetic fallback main");
    expect(fallbackB.days[0].successCriteria).not.toContain("synthetic fallback criteria");
  });

  it("gives fallback plans a prescription structure", () => {
    const fallbackZh = getPlanTemplate("unknown-problem", "3.0", "zh");
    const fallbackEn = getPlanTemplate("unknown-problem", "3.0", "en");

    expect(fallbackZh.days[0]).toMatchObject({
      goal: "先把动作节奏和落点稳定下来",
      warmupBlock: {
        title: "热身",
        items: ["空挥 10 次", "分腿垫步 10 次"]
      },
      mainBlock: {
        title: "主练",
        items: ["中等速度对打 12 球", "每球后停一下确认站位"]
      },
      pressureBlock: {
        title: "带压力重复",
        items: ["连续 3 球都进区才加快"]
      },
      successCriteria: ["能连续完成 3 轮而不乱节奏"],
      intensity: "low",
      tempo: "slow"
    });

    expect(fallbackEn.days[0]).toMatchObject({
      goal: "Settle your rhythm and contact before adding pace",
      warmupBlock: {
        title: "Warm-up",
        items: ["10 shadow swings", "10 split step reps"]
      },
      mainBlock: {
        title: "Main work",
        items: ["12 medium-tempo rally feeds", "Pause after each ball to reset your stance"]
      },
      pressureBlock: {
        title: "Pressure reps",
        items: ["Only speed up after 3 clean balls in a row"]
      },
      successCriteria: ["Complete 3 rounds without losing rhythm"],
      intensity: "low",
      tempo: "slow"
    });

    expect(fallbackEn.days[6]?.warmupBlock.items).toEqual([
      "Review notes for 5 minutes",
      "Organize your training notes"
    ]);
  });

  it("returns dedicated templates for upgraded plan-quality priority tags", () => {
    const overheadPlan = getPlanTemplate("overhead-timing", "3.0", "zh");
    const volleyFloatPlan = getPlanTemplate("volley-floating", "3.0", "zh");
    const runningForehandPlan = getPlanTemplate("running-forehand", "3.0", "zh");
    const generalImprovementPlan = getPlanTemplate("general-improvement", "3.0", "zh");

    expect(overheadPlan.source).toBe("template");
    expect(overheadPlan.title).toContain("高压");
    expect(volleyFloatPlan.source).toBe("template");
    expect(volleyFloatPlan.title).toContain("截击");
    expect(runningForehandPlan.source).toBe("template");
    expect(runningForehandPlan.title).toContain("跑动");
    expect(generalImprovementPlan.source).toBe("template");
    expect(generalImprovementPlan.title).toContain("通用");
  });

  it("keeps overhead-timing day watch content aligned with the drill theme instead of generic reuse", () => {
    const plan = getPlanTemplate("overhead-timing", "3.0", "zh");
    const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));
    const firstDayItem = contentById.get(plan.days[0].contentIds[0] ?? "");
    const lastDayItem = contentById.get(plan.days[6].contentIds[0] ?? "");

    expect(firstDayItem).toBeTruthy();
    expect(firstDayItem?.url.includes("search.bilibili.com/all?keyword=")).toBe(false);
    expect(plan.days[0].contentIds[0]).not.toBe(plan.days[6].contentIds[0]);
    expect(lastDayItem).toBeTruthy();
  });

  it("returns dedicated templates for upgraded movement and net-play study tags", () => {
    const movementPlan = getPlanTemplate("movement-slow", "3.0", "zh");
    const netPlan = getPlanTemplate("net-confidence", "3.0", "zh");
    const latePlan = getPlanTemplate("late-contact", "3.0", "zh");

    expect(movementPlan.source).toBe("template");
    expect(netPlan.source).toBe("template");
    expect(latePlan.source).toBe("template");
    expect(movementPlan.title).toContain("脚步");
    expect(netPlan.title).toContain("网前");
    expect(latePlan.title).toContain("准备");
  });

  it("prioritizes diagnosis-specific content when building a plan", () => {
    const preferredContentIds = ["content_fr_01", "content_gaiao_03"];
    const plan = getPlanTemplate("backhand-into-net", "3.0", "zh", preferredContentIds);
    const earlyAssignedIds = plan.days.slice(0, 5).map((day) => day.contentIds[0]);

    expect(plan.days[0].contentIds[0]).toBe("content_fr_01");
    expect(earlyAssignedIds).toContain("content_gaiao_03");
  });

  it("serializes preferred plan content ids into plan hrefs", () => {
    const href = buildPlanHref({
      problemTag: "backhand-into-net",
      level: "3.0",
      preferredContentIds: ["content_cn_a_01", "content_zlx_03"],
      sourceType: "diagnosis"
    });

    const params = new URL(href, "https://example.com").searchParams;
    expect(params.get("source")).toBe("diagnosis");
    expect(parsePlanContentIds(params.get("contentIds"))).toEqual(["content_cn_a_01", "content_zlx_03"]);
  });

  it("serializes diagnosis primary next step into plan hrefs", () => {
    const href = buildPlanHref({
      problemTag: "serve-basics",
      level: "3.0",
      sourceType: "diagnosis",
      primaryNextStep: "Slow the tempo and rebuild the toss."
    });

    const params = new URL(href, "https://example.com").searchParams;
    expect(params.get("primaryNextStep")).toBe("Slow the tempo and rebuild the toss.");
  });

  it("normalizes a recoverable plan draft snapshot", () => {
    const draft = normalizePlanDraftSnapshot({
      problemTag: " backhand-into-net ",
      level: "4.9" as never,
      preferredContentIds: ["content_cn_a_01", "content_cn_a_01", " content_zlx_03 "],
      sourceType: "unexpected",
      primaryNextStep: "  先把引拍提前半拍再出手 ",
      updatedAt: ""
    });

    expect(draft).toMatchObject({
      problemTag: "backhand-into-net",
      level: "3.0",
      preferredContentIds: ["content_cn_a_01", "content_zlx_03"],
      sourceType: "default",
      primaryNextStep: "先把引拍提前半拍再出手"
    });
    expect(draft?.updatedAt).toBeTruthy();
  });

  it("rejects invalid plan draft snapshots", () => {
    expect(normalizePlanDraftSnapshot(null)).toBeNull();
    expect(normalizePlanDraftSnapshot({ problemTag: "" })).toBeNull();
    expect(normalizePlanDraftSnapshot({ problemTag: "no-plan", level: "3.0" })).toBeNull();
  });

  it("expands diagnosis plan candidates beyond the base three when expanded matches exist", () => {
    const candidateIds = buildDiagnosisPlanCandidateIds({
      problemTag: "backhand-into-net",
      level: "3.0",
      recommendedContentIds: ["content_fr_01", "content_gaiao_03"]
    });
    const expandedIdSet = new Set(expandedContents.map((entry) => entry.id));

    expect(candidateIds.length).toBeGreaterThanOrEqual(5);
    expect(candidateIds.slice(0, 2)).toEqual(["content_fr_01", "content_gaiao_03"]);
    expect(candidateIds.some((id) => expandedIdSet.has(id))).toBe(true);
  });

  it("derives assessment plan candidates from the weakest dimension and watch areas", () => {
    const context = buildAssessmentPlanContext({
      rawScore: 20,
      levelBand: "3.0",
      dimensionScores: {
        rally: 3,
        forehand: 3,
        backhand_slice: 3,
        serve: 1,
        return: 3,
        movement: 3,
        net: 3,
        overhead: 3,
        pressure: 2,
        tactics: 3
      },
      weakDimensions: ["serve", "pressure"],
      strongDimensions: ["forehand"],
      primaryWeakness: "serve",
      secondaryWeakness: "pressure",
      playStyle: "baseline_attack",
      playContext: "singles_standard",
      summary: {
        headline: "",
        oneLineLevelSummary: "",
        oneLinePlanHint: ""
      }
    });
    const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));

    expect(context.problemTag).toBe("second-serve-reliability");
    expect(context.candidateIds.length).toBeGreaterThanOrEqual(5);
    expect(
      context.candidateIds
        .slice(0, 3)
        .some((id) => {
          const item = contentById.get(id);
          return Boolean(item?.skills.includes("serve") || item?.problemTags.includes("second-serve-reliability"));
        })
    ).toBe(true);
  });

  it("falls back gracefully for sparse plan tags and prefers stronger unused matches before reuse", () => {
    const candidateIds = buildDiagnosisPlanCandidateIds({
      problemTag: "plateau-no-progress",
      level: "3.0"
    });
    const plan = getPlanTemplate("plateau-no-progress", "3.0", "zh", candidateIds);
    const assignedIds = plan.days.map((day) => day.contentIds[0]).filter(Boolean);
    const uniqueEarlyIds = new Set(assignedIds.slice(0, 3));

    expect(candidateIds.length).toBeGreaterThanOrEqual(5);
    expect(assignedIds[0]).toBeTruthy();
    expect(uniqueEarlyIds.size).toBeGreaterThanOrEqual(Math.min(3, candidateIds.length));
  });

  it("keeps review-day assignments on direct candidate videos", () => {
    const candidateIds = buildDiagnosisPlanCandidateIds({
      problemTag: "backhand-into-net",
      level: "3.0",
      recommendedContentIds: ["content_fr_01", "content_gaiao_03"]
    });
    const plan = getPlanTemplate("backhand-into-net", "3.0", "zh", candidateIds);
    const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));
    const reviewDayId = plan.days[5]?.contentIds[0];
    const reviewDayItem = reviewDayId ? contentById.get(reviewDayId) : null;

    expect(reviewDayId).toBeTruthy();
    expect(candidateIds).toContain(reviewDayId);
    expect(reviewDayItem?.url.includes("search.bilibili.com/all?keyword=")).toBe(false);
  });

  it("keeps assessment-derived second-serve plans on serve-focused content", () => {
    const context = buildAssessmentPlanContext({
      rawScore: 20,
      levelBand: "3.0",
      dimensionScores: {
        rally: 3,
        forehand: 3,
        backhand_slice: 3,
        serve: 1,
        return: 3,
        movement: 3,
        net: 3,
        overhead: 3,
        pressure: 2,
        tactics: 3
      },
      weakDimensions: ["serve", "pressure"],
      strongDimensions: ["forehand"],
      primaryWeakness: "serve",
      secondaryWeakness: "pressure",
      playStyle: "baseline_attack",
      playContext: "singles_standard",
      summary: {
        headline: "",
        oneLineLevelSummary: "",
        oneLinePlanHint: ""
      }
    });
    const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));
    const plan = getPlanTemplate(context.problemTag, "3.0", "zh", context.candidateIds);

    expect(
      plan.days.every((day) => {
        const item = day.contentIds[0] ? contentById.get(day.contentIds[0]) : null;
        return Boolean(item?.skills.includes("serve"));
      })
    ).toBe(true);
  });

  it("matches newly added English diagnosis triggers", () => {
    expect(findBestDiagnosisRule("I do not know where to stand in doubles").rule?.problemTag).toBe("doubles-positioning");
    expect(findBestDiagnosisRule("My serve toss is all over the place").rule?.problemTag).toBe("serve-toss-consistency");
    expect(findBestDiagnosisRule("My shots keep landing short").rule?.problemTag).toBe("balls-too-short");
    expect(extractDiagnosisSignalBundle("I practice a lot but never get better").supportSignals).toContain("plateau_no_progress");
  });

  it("matches more specific movement and net-play phrasing without falling back to broad tags", () => {
    expect(findBestDiagnosisRule("脚步总慢半拍，左右移动时最明显").rule?.problemTag).toBe("movement-slow");
    expect(findBestDiagnosisRule("双打时网前截击老冒高，一紧张就更明显").rule?.problemTag).toBe("volley-floating");
    expect(findBestDiagnosisRule("my footwork is always half a beat late when I move wide").rule?.problemTag).toBe("movement-slow");
    expect(findBestDiagnosisRule("my volley keeps floating in doubles when I get tight").rule?.problemTag).toBe("volley-floating");
  });

  it("applies slot-aware diagnosis priority for overlapping stroke, physical, and mental phrasing", () => {
    expect(findBestDiagnosisRule("关键分正手老飞").rule?.problemTag).toBe("forehand-out");
    expect(findBestDiagnosisRule("年纪大了跑不太动").rule?.problemTag).toBe("mobility-limit");
    expect(findBestDiagnosisRule("比赛一紧张就手紧").rule?.problemTag).toBe("pressure-tightness");
  });

  it("keeps self-slice and match-context technical complaints in their technical lanes", () => {
    expect(findBestDiagnosisRule("slice floats").rule?.problemTag).toBe("backhand-slice-floating");
    expect(findBestDiagnosisRule("my backhand slice sits up").rule?.problemTag).toBe("backhand-slice-floating");
    expect(["movement-slow", "late-contact"]).toContain(findBestDiagnosisRule("比赛总慢半拍").rule?.problemTag);
    expect(findBestDiagnosisRule("比赛来不及准备").rule?.problemTag).toBe("late-contact");
    expect(findBestDiagnosisRule("比赛接发总被压制").rule?.problemTag).toBe("return-under-pressure");
    expect(findBestDiagnosisRule("比赛里切球总飘起来").rule?.problemTag).toBe("backhand-slice-floating");
  });

  it("aligns diagnosis titles to the renamed plan-facing tags", () => {
    expect(getDiagnosisTitle("second-serve-reliability", "zh")).toBe("二发稳定性不足");
    expect(getDiagnosisTitle("serve-toss-consistency", "zh")).toBe("发球抛球稳定性不足");
    expect(getDiagnosisTitle("backhand-slice-floating", "zh")).toBe("反手切削控制不足");
    expect(getDiagnosisTitle("incoming-slice-trouble", "zh")).toBe("对手削球来球处理不顺");
    expect(getDiagnosisTitle("mobility-limit", "zh")).toBe("移动范围和到位能力受限");
  });

  it("normalizes renamed tags onto existing plan templates instead of falling back", () => {
    const secondServePlan = getPlanTemplate("second-serve-reliability", "3.0", "zh");
    const tossPlan = getPlanTemplate("serve-toss-consistency", "3.0", "zh");
    const slicePlan = getPlanTemplate("incoming-slice-trouble", "3.0", "zh");

    expect(secondServePlan.source).toBe("template");
    expect(secondServePlan.title).toContain("二发");
    expect(tossPlan.source).toBe("template");
    expect(tossPlan.title).toContain("抛球");
    expect(slicePlan.source).toBe("template");
    expect(slicePlan.title).toContain("削球");
  });

  it("adds minimal plan-template coverage for new diagnosis winners", () => {
    const firstServePlan = getPlanTemplate("first-serve-in", "3.0", "zh");
    const mobilityPlan = getPlanTemplate("mobility-limit", "3.0", "zh");

    expect(firstServePlan.source).toBe("template");
    expect(firstServePlan.title).toContain("一发");
    expect(mobilityPlan.source).toBe("template");
    expect(mobilityPlan.title).toContain("移动");
  });

  it("preserves specific new-tag recommendation priority before compatibility fallback when seeding plan candidates", () => {
    const candidateIds = buildDiagnosisPlanCandidateIds({
      problemTag: "pressure-tightness",
      level: "3.0"
    });
    const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));

    expect(candidateIds.length).toBeGreaterThanOrEqual(5);
    expect(candidateIds.slice(0, 3)).toEqual(expect.arrayContaining(["content_rb_03", "content_rb_02"]));
    expect(
      candidateIds.every((id) => {
        const item = contentById.get(id);
        return Boolean(item && !item.url.includes("search.bilibili.com/all?keyword="));
      })
    ).toBe(true);
  });

  it("keeps pressure-tightness plans on direct library videos only", () => {
    const plan = getPlanTemplate("pressure-tightness", "3.0", "zh");
    const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));

    expect(plan.days.some((day) => day.contentIds.length > 0)).toBe(true);
    expect(
      plan.days.every((day) =>
        day.contentIds.every((id) => {
          const item = contentById.get(id);
          return Boolean(
            item &&
            !item.url.includes("search.bilibili.com/all?keyword=") &&
            !item.url.includes("youtube.com/results?search_query=")
          );
        })
      )
    ).toBe(true);
  });

  it("removes search-entry ids from high-risk plan template source data", () => {
    const riskyTags = new Set([
      "pressure-tightness",
      "match-anxiety",
      "movement-slow",
      "mobility-limit",
      "incoming-slice-trouble",
      "doubles-positioning",
      "first-serve-in"
    ]);
    const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));
    const riskyTemplateDays = planTemplates
      .filter((template) => riskyTags.has(template.problemTag))
      .flatMap((template) => template.days);

    expect(riskyTemplateDays.length).toBeGreaterThan(0);
    expect(
      riskyTemplateDays.every((day) =>
        day.contentIds.every((id) => {
          const item = contentById.get(id);
          return Boolean(item && !item.url.includes("search.bilibili.com/all?keyword="));
        })
      )
    ).toBe(true);
  });

  it("does not leave any search-entry ids in plan template source data", () => {
    const contentById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));
    const templateDays = planTemplates.flatMap((template) => template.days);

    expect(templateDays.length).toBeGreaterThan(0);
    expect(
      templateDays.every((day) =>
        day.contentIds.every((id) => {
          const item = contentById.get(id);
          return Boolean(item && !item.url.includes("search.bilibili.com/all?keyword="));
        })
      )
    ).toBe(true);
  });

  it("uses diagnosis context cues to keep pressure-support content in plan candidates", () => {
    const baseline = buildDiagnosisPlanCandidateIds({
      problemTag: "forehand-out",
      level: "3.0"
    });
    const withContext = buildDiagnosisPlanCandidateIds({
      problemTag: "forehand-out",
      level: "3.0",
      diagnosisInput: "关键分正手老飞，对手一上网我就慌"
    });

    expect(withContext[0]).toBe("content_cn_d_01");
    expect(withContext.slice(0, 5)).toEqual(expect.arrayContaining(["content_rb_02"]));
    expect(baseline.slice(0, 5)).not.toEqual(expect.arrayContaining(["content_rb_02"]));
  });

  it("recognizes poaching-at-net pressure phrasing and keeps net-pressure support in plan candidates", () => {
    const withContext = buildDiagnosisPlanCandidateIds({
      problemTag: "forehand-out",
      level: "3.0",
      diagnosisInput: "On key points I panic when they poach at net and my forehand flies long"
    });

    expect(withContext[0]).toBe("content_cn_d_01");
    expect(withContext.slice(0, 6)).toEqual(expect.arrayContaining(["content_rb_03", "content_rb_01"]));
  });

  it("keeps top candidate pools from over-concentrating on one creator for broad practice tags", () => {
    const candidateIds = buildDiagnosisPlanCandidateIds({
      problemTag: "cant-self-practice",
      level: "3.0"
    });
    const poolById = new Map([...contents, ...expandedContents].map((entry) => [entry.id, entry]));
    const topCreators = new Set(
      candidateIds
        .slice(0, 5)
        .map((id) => poolById.get(id)?.creatorId)
        .filter((value): value is string => Boolean(value))
    );

    expect(candidateIds.length).toBeGreaterThanOrEqual(5);
    expect(topCreators.size).toBeGreaterThanOrEqual(2);
  });

  it("expands canonical problem-tag coverage for direct-library training videos", () => {
    const byId = new Map(contents.map((entry) => [entry.id, entry]));

    expect(byId.get("content_gaiao_02")?.problemTags).toEqual(
      expect.arrayContaining(["second-serve-reliability"])
    );
    expect(byId.get("content_ttt_01")?.problemTags).toEqual(
      expect.arrayContaining(["serve-toss-consistency"])
    );
    expect(byId.get("content_common_02")?.problemTags).toEqual(
      expect.arrayContaining(["incoming-slice-trouble"])
    );
    expect(byId.get("content_common_03")?.problemTags).toEqual(
      expect.arrayContaining(["backhand-slice-floating"])
    );
    expect(byId.get("content_rb_03")?.problemTags).toEqual(
      expect.arrayContaining(["pressure-tightness", "plateau-no-progress"])
    );
  });

  it("prefers hand-polished Chinese secondary titles for English content in zh mode", () => {
    const item = contents.find((entry) => entry.id === "content_ttt_01");

    expect(item).toBeTruthy();
    if (!item) {
      throw new Error("Missing content_ttt_01");
    }

    expect(getContentPrimaryTitle(item, "zh")).toBe("Simple Tennis Serve Technique Masterclass for Beginners");
    expect(getContentSecondaryTitle(item, "zh")).toBe("网球发球入门精讲");
    expect(resolveChineseSecondaryTitleForEnglishContent(item).source).toBe("manual");
  });

  it("uses the title-template layer before falling back to metadata or generic skill labels", () => {
    const item: ContentItem = {
      id: "synthetic_title_template",
      title: "How To Control Groundstroke Depth",
      creatorId: "creator_essential_tennis",
      platform: "YouTube",
      type: "video",
      levels: ["3.0"],
      skills: ["forehand"],
      problemTags: ["balls-too-short"],
      language: "en",
      summary: "适合相持里总把球打浅的球员。",
      reason: "补足底线深度控制。",
      useCases: ["相持里总落在发球线附近"],
      coachReason: "",
      url: "https://example.com/template"
    };

    expect(resolveChineseSecondaryTitleForEnglishContent(item)).toMatchObject({
      title: "底线球深度控制讲解",
      source: "title_template"
    });
  });

  it("uses the metadata layer when the English title does not map cleanly", () => {
    const item: ContentItem = {
      id: "synthetic_metadata_title",
      title: "Sharpen your timing under pressure",
      creatorId: "creator_top_tennis_training",
      platform: "YouTube",
      type: "video",
      levels: ["3.0"],
      skills: ["serve"],
      problemTags: ["serve-toss-inconsistent"],
      language: "en",
      summary: "适合抛球一乱发球动作就跟着散的球员。",
      reason: "帮助你把发球节奏重新稳定下来。",
      useCases: ["发球抛球总偏左偏右"],
      coachReason: "",
      url: "https://example.com/metadata"
    };

    expect(resolveChineseSecondaryTitleForEnglishContent(item)).toMatchObject({
      title: "发球：重点解决抛球总偏左偏右",
      source: "metadata"
    });
  });

  it("falls back to a generic skill label only after all subtitle attempts fail", () => {
    const item: ContentItem = {
      id: "synthetic_generic_title",
      title: "Tennis tips",
      creatorId: "creator_top_tennis_training",
      platform: "YouTube",
      type: "video",
      levels: ["3.0"],
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      language: "en",
      summary: "",
      reason: "",
      useCases: [""],
      coachReason: "",
      url: "https://example.com/generic"
    };

    expect(resolveChineseSecondaryTitleForEnglishContent(item)).toMatchObject({
      title: "发球技术",
      source: "generic_skill"
    });
    expect(getContentSecondaryTitle(item, "zh")).toBe("发球技术");
  });

  it("tracks videos that still need manual Chinese subtitles in the translation backlog", () => {
    const pendingContentIds = contents
      .filter((entry) => entry.language === "en" && !entry.secondaryTitleZh?.trim())
      .map((entry) => entry.id);
    const pendingFeaturedIds = creators.flatMap((creator) => (creator.featuredVideos ?? []).flatMap((video) => {
      const title = video.originalTitle?.trim() || video.sourceTitle?.trim() || video.title?.trim() || "";
      const hasCJK = /[\u3400-\u9fff]/.test(title);
      const hasLatin = /[A-Za-z]/.test(title);

      if (!hasLatin || hasCJK || video.displayTitleZh?.trim() || CREATOR_FEATURED_VIDEO_CHINESE_SUBTITLE_OVERRIDES[video.id]?.trim()) {
        return [];
      }

      return [video.id];
    }));
    const backlogPath = path.join(process.cwd(), "CONTENT_TRANSLATION_BACKLOG.md");

    if (!fs.existsSync(backlogPath)) {
      expect(pendingContentIds.length).toBeGreaterThanOrEqual(0);
      expect(pendingFeaturedIds.length).toBeGreaterThanOrEqual(0);
      return;
    }

    const backlog = fs.readFileSync(backlogPath, "utf8");

    if (pendingContentIds.length === 0) {
      expect(backlog).toContain("_None right now._");
    }

    for (const id of pendingContentIds) {
      expect(backlog).toContain(id);
    }

    expect(pendingFeaturedIds.length).toBeGreaterThan(0);
    for (const id of pendingFeaturedIds.slice(0, 10)) {
      expect(backlog).toContain(id);
    }

    expect(backlog).toContain(`- Content items pending manual subtitles: ${pendingContentIds.length}`);
    expect(backlog).toContain(`- Creator featured videos pending manual subtitles: ${pendingFeaturedIds.length}`);
  });
});
