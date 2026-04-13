import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContentItem } from "@/types/content";
import { retrieveCatalogContentsByIds, retrieveCatalogRecommendations } from "@/lib/content-catalog/retrieve";

function createContentItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: overrides.id ?? "content_1",
    title: overrides.title ?? "Default title",
    creatorId: overrides.creatorId ?? "creator_1",
    platform: overrides.platform ?? "YouTube",
    type: overrides.type ?? "video",
    levels: overrides.levels ?? ["3.0"],
    skills: overrides.skills ?? ["serve"],
    problemTags: overrides.problemTags ?? ["serve-rhythm"],
    language: overrides.language ?? "en",
    summary: overrides.summary ?? "summary",
    reason: overrides.reason ?? "reason",
    useCases: overrides.useCases ?? ["use case"],
    coachReason: overrides.coachReason ?? "coach reason",
    url: overrides.url ?? `https://www.youtube.com/watch?v=${overrides.id ?? "content_1"}`,
    environment: overrides.environment ?? ["testing", "production"],
    ...overrides
  };
}

describe("content catalog retrieval", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("filters by environment, skill, problem, and level while preferring direct curated sources", () => {
    const directCurated = createContentItem({
      id: "direct_curated",
      creatorId: "creator_a",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=directCurated"
    });
    const searchCurated = createContentItem({
      id: "search_curated",
      creatorId: "creator_b",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://youtube.com/results?search_query=serve+rhythm"
    });
    const directExpanded = createContentItem({
      id: "content_expanded_direct",
      creatorId: "creator_c",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=expandedDirect"
    });
    const wrongSkill = createContentItem({
      id: "wrong_skill",
      skills: ["backhand"],
      problemTags: ["backhand-into-net"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=wrongSkill"
    });
    const wrongEnvironment = createContentItem({
      id: "wrong_environment",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      environment: "testing",
      url: "https://www.youtube.com/watch?v=wrongEnvironment"
    });

    const recommended = retrieveCatalogRecommendations({
      source: "diagnosis",
      contentPool: [directCurated, searchCurated, wrongSkill, wrongEnvironment],
      expandedContentPool: [directExpanded],
      environment: "production",
      skillCategories: ["serve"],
      problemTags: ["serve-rhythm"],
      level: "3.0",
      maxResults: 3
    });

    expect(recommended.map((item) => item.id)).toEqual(["direct_curated", "content_expanded_direct"]);
  });

  it("prefers teaching breakdowns over commentary and match-style clips in the same recommendation lane", () => {
    const commentaryFirst = createContentItem({
      id: "commentary_first",
      creatorId: "creator_a",
      title: "Serve rhythm commentary from club match",
      summary: "Loose commentary around a serve rhythm issue from match footage.",
      reason: "Commentary clip about serve rhythm.",
      coachReason: "Mostly commentary and reaction to a serve issue.",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=commentaryFirst"
    });
    const matchExampleSecond = createContentItem({
      id: "match_example_second",
      creatorId: "creator_b",
      title: "Serve rhythm example from practice set",
      summary: "Match example showing how the serve rhythm looks in live points.",
      reason: "Live-point example for serve rhythm.",
      coachReason: "Useful match example once the core pattern is clear.",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=matchExampleSecond"
    });
    const teachingThird = createContentItem({
      id: "teaching_third",
      creatorId: "creator_c",
      title: "Serve rhythm breakdown for beginners",
      summary: "Step-by-step lesson on toss timing and serve rhythm.",
      reason: "Teaching lesson for players whose serve rushes.",
      coachReason: "Clear technical breakdown for toss timing and tempo.",
      skills: ["serve"],
      problemTags: ["serve-rhythm"],
      levels: ["3.0"],
      url: "https://www.youtube.com/watch?v=teachingThird"
    });

    const recommended = retrieveCatalogRecommendations({
      source: "diagnosis",
      contentPool: [commentaryFirst, matchExampleSecond, teachingThird],
      environment: "production",
      skillCategories: ["serve"],
      problemTags: ["serve-rhythm"],
      lexicalTerms: ["serve", "rhythm"],
      level: "3.0",
      maxResults: 2
    });

    expect(recommended.map((item) => item.id)).toEqual(["teaching_third", "match_example_second"]);
  });

  it("keeps half-volley and net-play recommendations out of generic backhand tutorial lanes", () => {
    const halfVolleyTeaching = createContentItem({
      id: "half_volley_teaching",
      title: "Half-volley pickup and low-ball control",
      summary: "Short-hop pickup lesson for late half-volley contact at net.",
      reason: "Teaching lesson for half-volley timing and low-ball pickup.",
      coachReason: "Covers emergency half-volley spacing and staying compact on the pickup.",
      skills: ["net"],
      problemTags: ["half-volley-late-contact", "volley-contact-instability"],
      levels: ["3.5"],
      url: "https://www.youtube.com/watch?v=halfVolleyTeaching"
    });
    const genericBackhand = createContentItem({
      id: "generic_backhand",
      title: "Backhand basics for club players",
      summary: "General backhand lesson without net-play context.",
      reason: "Generic backhand technique lesson.",
      coachReason: "Useful backhand fundamentals, but not a half-volley lane.",
      skills: ["backhand"],
      problemTags: ["backhand-into-net"],
      levels: ["3.5"],
      url: "https://www.youtube.com/watch?v=genericBackhand"
    });

    const recommended = retrieveCatalogRecommendations({
      source: "diagnosis",
      contentPool: [genericBackhand, halfVolleyTeaching],
      environment: "production",
      skillCategories: ["net"],
      problemTags: ["half-volley-late-contact"],
      lexicalTerms: ["half-volley", "pickup", "short hop"],
      level: "3.5",
      maxResults: 1
    });

    expect(recommended.map((item) => item.id)).toEqual(["half_volley_teaching"]);
  });

  it("prefers tactical and match-handling content over generic technique when the diagnosis lane is strategic", () => {
    const tacticalTeaching = createContentItem({
      id: "tactical_teaching",
      title: "Point construction patterns for club singles",
      summary: "Pattern-building lesson for players who do not know how to organize points.",
      reason: "Tactical teaching on building one simple point pattern before changing direction.",
      coachReason: "Shows how to create pressure with setup shots instead of rallying passively.",
      skills: ["matchplay", "doubles"],
      problemTags: ["passive-point-construction", "poor-ball-selection"],
      levels: ["3.5"],
      url: "https://www.youtube.com/watch?v=tacticalTeaching"
    });
    const genericTechnique = createContentItem({
      id: "generic_technique",
      title: "Forehand mechanics refresh",
      summary: "Generic forehand tune-up with no tactical lane.",
      reason: "Technique refresh.",
      coachReason: "Good for forehand mechanics, not for point construction.",
      skills: ["forehand"],
      problemTags: ["forehand-out"],
      levels: ["3.5"],
      url: "https://www.youtube.com/watch?v=genericTechnique"
    });

    const recommended = retrieveCatalogRecommendations({
      source: "diagnosis",
      contentPool: [genericTechnique, tacticalTeaching],
      environment: "production",
      skillCategories: ["matchplay", "doubles"],
      problemTags: ["passive-point-construction"],
      lexicalTerms: ["point construction", "pattern", "organize points"],
      level: "3.5",
      maxResults: 1
    });

    expect(recommended.map((item) => item.id)).toEqual(["tactical_teaching"]);
  });

  it("enforces the recommendation cap and keeps search links out of direct recommendation lookup", () => {
    const results = retrieveCatalogContentsByIds({
      ids: ["search_curated", "direct_a", "direct_b", "direct_c"],
      contentPool: [
        createContentItem({
          id: "search_curated",
          url: "https://search.bilibili.com/all?keyword=serve"
        }),
        createContentItem({
          id: "direct_a",
          platform: "Bilibili",
          levels: ["3.0"],
          url: "https://www.bilibili.com/video/BV1aA4111111"
        }),
        createContentItem({
          id: "direct_b",
          platform: "Bilibili",
          levels: ["3.5"],
          url: "https://www.bilibili.com/video/BV1bB4111111"
        }),
        createContentItem({
          id: "direct_c",
          levels: ["3.0"],
          url: "https://www.youtube.com/watch?v=direct_c"
        })
      ],
      level: "3.0",
      maxResults: 2
    });

    expect(results.map((item) => item.id)).toEqual(["direct_a", "direct_c"]);
  });

  it("lets diagnosis and plan call the same shared retrieval boundary", async () => {
    vi.resetModules();
    const retrieveModule = await import("@/lib/content-catalog/retrieve");
    const retrieveCatalogRecommendationsMock = vi
      .spyOn(retrieveModule, "retrieveCatalogRecommendations")
      .mockReturnValue([]);
    const retrieveCatalogContentsByIdsMock = vi
      .spyOn(retrieveModule, "retrieveCatalogContentsByIds")
      .mockReturnValue([]);

    const diagnosis = await import("@/lib/diagnosis");
    const plans = await import("@/lib/plans");

    diagnosis.getContentsByIds(["content_gaiao_01"], undefined, 3, "3.0");
    plans.buildDiagnosisPlanCandidateIds({
      problemTag: "second-serve-reliability",
      level: "3.0",
      diagnosisInput: "My second serve loses rhythm under pressure",
      maxCandidates: 5
    });

    expect(retrieveCatalogContentsByIdsMock).toHaveBeenCalledTimes(1);
    expect(retrieveCatalogRecommendationsMock).toHaveBeenCalledTimes(1);
  });
});
