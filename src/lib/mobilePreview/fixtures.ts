import { contents } from "@/data/contents";
import { buildDiagnosisGuidanceContext } from "@/lib/guidance-context/build";
import { buildDiagnosisPlanContext, buildPlanResume, getPlanTemplate } from "@/lib/plans";
import type { ContentItem } from "@/types/content";
import type { LocaleValue } from "@/lib/i18n/config";
import type { DiagnosisHistoryRow, SavedPlanRow } from "@/types/userData";

const PREVIEW_USER = {
  id: "mobile_preview_user",
  email: "mobile-preview@tennislevel.local"
};

function getPreviewBookmarkedItems() {
  const bookmarkedIds = [
    "content_xhs_gaiao_03",
    "content_xhs_lingxi_02",
    "content_xhs_mouratoglou_03",
    "content_gaiao_03"
  ];
  const itemById = new Map(contents.map((item) => [item.id, item]));

  return bookmarkedIds
    .map((id) => itemById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
}

export function getProfileMobilePreviewFixture(locale: LocaleValue): {
  user: typeof PREVIEW_USER;
  diagnosisHistory: DiagnosisHistoryRow[];
  savedPlans: SavedPlanRow[];
  bookmarkedItems: ContentItem[];
} {
  const diagnosisInput = locale === "en"
    ? "On key points my second serve keeps dropping into the net and I tighten up."
    : "比赛里关键分时我的二发总是下网，而且会发紧。";
  const primaryNextStep = locale === "en"
    ? "Stabilize the second-serve rhythm first"
    : "先稳住二发节奏";
  const planContext = buildDiagnosisPlanContext({
    problemTag: "second-serve-reliability",
    diagnosisInput,
    primaryNextStep
  });
  const guidanceContext = buildDiagnosisGuidanceContext({
    problemTag: "second-serve-reliability",
    level: "3.5",
    locale,
    diagnosisInput,
    primaryNextStep,
    planContext
  });
  const plan = getPlanTemplate("second-serve-reliability", "3.5", locale, [], {
    primaryNextStep,
    planContext,
    guidanceContext
  });
  const savedPlan: SavedPlanRow = {
    id: "mobile_preview_saved_plan",
    user_id: PREVIEW_USER.id,
    source_type: "diagnosis",
    source_label: "mobile-preview",
    created_at: "2026-04-14T12:00:00.000Z",
    plan_data: {
      ...plan,
      resume: buildPlanResume({
        problemTag: plan.problemTag,
        level: plan.level,
        preferredContentIds: [],
        sourceType: "diagnosis",
        primaryNextStep,
        planContext,
        guidanceContext
      })
    }
  };

  return {
    user: PREVIEW_USER,
    diagnosisHistory: [
      {
        id: "mobile_preview_diagnosis",
        user_id: PREVIEW_USER.id,
        input_text: diagnosisInput,
        matched_rule_id: "rule_second_serve_reliability",
        problem_label: locale === "en" ? "Second serve under pressure" : "关键分二发不稳",
        created_at: "2026-04-14T11:45:00.000Z"
      }
    ],
    savedPlans: [savedPlan],
    bookmarkedItems: getPreviewBookmarkedItems()
  };
}
