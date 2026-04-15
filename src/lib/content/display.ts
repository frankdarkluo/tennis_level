import {
  CONTENT_ENGLISH_OVERRIDES,
  CREATOR_ENGLISH_OVERRIDES,
  CREATOR_TAG_LABELS_EN,
  CREATOR_TAG_LABELS_ZH
} from "@/lib/content/localization";
import { CREATOR_FEATURED_VIDEO_CHINESE_SUBTITLE_OVERRIDES } from "@/lib/content/chineseSubtitleOverrides";
import { canonicalizeTennisText } from "@/lib/i18n/tennisGlossary";
import { ContentItem, ContentPlatform, ContentSubtitleAvailability } from "@/types/content";
import { Creator, CreatorFeaturedVideo, CreatorPlatformName } from "@/types/creator";

type Locale = "zh" | "en";
export type ChineseSecondaryTitleSource = "manual" | "title_template" | "metadata" | "generic_skill";
export type FeaturedVideoChineseTitleSource = "manual" | "title_template" | "target" | "generic_skill";

export function hasCJK(value?: string | null) {
  return Boolean(value && /[\u3400-\u9fff]/.test(value));
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeChineseSentence(value: string) {
  return canonicalizeTennisText(normalizeText(value)
    .replace(/^适合作为/, "")
    .replace(/^适合/, "")
    .replace(/^针对[:：]\s*/, "")
    .replace(/。/g, "")
    .trim(), "zh");
}

function normalizeEnglishSentence(value: string) {
  return canonicalizeTennisText(normalizeText(value)
    .replace(/^Focus:\s*/i, "")
    .replace(/\.$/, "")
    .trim(), "en");
}

function getContentEnglishOverride(id?: string) {
  return id ? CONTENT_ENGLISH_OVERRIDES[id] : undefined;
}

function getCreatorEnglishOverride(creatorId?: string) {
  return creatorId ? CREATOR_ENGLISH_OVERRIDES[creatorId] : undefined;
}

function getCreatorFeaturedVideoEnglishOverride(creatorId?: string, videoId?: string) {
  if (!creatorId || !videoId) {
    return undefined;
  }

  return CREATOR_ENGLISH_OVERRIDES[creatorId]?.featuredVideos?.[videoId];
}

function getCreatorFeaturedVideoChineseSubtitleOverride(videoId?: string) {
  return videoId ? CREATOR_FEATURED_VIDEO_CHINESE_SUBTITLE_OVERRIDES[videoId] : undefined;
}

function getOriginalFeaturedVideoTitle(
  item: Pick<CreatorFeaturedVideo, "title" | "sourceTitle" | "originalTitle">
) {
  return normalizeText(item.originalTitle?.trim() || item.sourceTitle?.trim() || item.title);
}

export function normalizeBilibiliTitle(value: string) {
  return value
    .replace(/[|｜]\s*LeonTV(?:网球频道|频道)?\s*[|｜]?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHashtagTail(value: string) {
  return value.replace(/[＃#].*$/, "").trim();
}

function stripLeadingHashtag(value: string) {
  return value
    .replace(/^[＃#][^\s＃#]+\s*/, "")
    .replace(/[＃#].*$/, "")
    .trim();
}

export function getOriginalContentTitle(
  item: Pick<ContentItem, "title" | "sourceTitle" | "originalTitle" | "platform" | "language">
) {
  const baseTitle = item.originalTitle ?? item.sourceTitle ?? item.title;
  const rawTitle = (item.platform === "Bilibili" && item.language === "zh"
    ? normalizeBilibiliTitle(baseTitle)
    : baseTitle)
    .replace(/\s+/g, " ")
    .trim();

  const stripped = stripHashtagTail(rawTitle);
  if (stripped.length > 1) {
    return stripped;
  }

  const afterTag = stripLeadingHashtag(rawTitle);
  if (afterTag.length > 1) {
    return afterTag;
  }

  return rawTitle;
}

function englishSkillLabel(skill?: string) {
  const map: Record<string, string> = {
    forehand: "Forehand",
    backhand: "Backhand",
    serve: "Serve",
    movement: "Footwork",
    footwork: "Footwork",
    net: "Net play",
    doubles: "Doubles",
    return: "Return",
    topspin: "Topspin",
    slice: "Slice",
    grip: "Grip",
    training: "Practice structure",
    mental: "Mental game",
    matchplay: "Match play",
    consistency: "Consistency",
    defense: "Defense",
    basics: "Basics"
  };

  return skill ? map[skill] ?? "Tennis skills" : "Tennis skills";
}

function defaultEnglishFocusLabel(skills?: string[]) {
  return `${englishSkillLabel(skills?.[0])} work`;
}

function defaultEnglishFocusLine(skills?: string[]) {
  const map: Record<string, string> = {
    forehand: "For players working on forehand mechanics.",
    backhand: "For players working on backhand mechanics.",
    serve: "For players working on serve mechanics.",
    movement: "For players working on movement and recovery steps.",
    footwork: "For players working on movement and recovery steps.",
    net: "For players working on net play and volley control.",
    doubles: "For players working on doubles positioning and patterns.",
    return: "For players working on return timing and setup.",
    topspin: "For players working on topspin mechanics.",
    slice: "For players working on slice technique and control.",
    grip: "For players working on grips and setup details.",
    training: "For players trying to build a cleaner practice structure.",
    mental: "For players working on the mental side of match play.",
    matchplay: "For players working on match-play decisions and patterns.",
    consistency: "For players working on consistency and depth.",
    defense: "For players working on defense and neutralizing tough balls.",
    basics: "For players building clean fundamentals."
  };

  return skills?.[0] ? map[skills[0]] ?? "For players building clean tennis fundamentals." : "For players building clean tennis fundamentals.";
}

function chineseSkillLabel(skill?: string) {
  const map: Record<string, string> = {
    forehand: "正手技术",
    backhand: "反手技术",
    serve: "发球技术",
    movement: "步法训练",
    footwork: "步法训练",
    net: "网前技术",
    doubles: "双打战术",
    return: "接发球",
    topspin: "上旋技术",
    slice: "切球技术",
    grip: "握拍方式",
    training: "训练方法",
    mental: "比赛心态",
    matchplay: "比赛策略",
    consistency: "稳定性训练",
    defense: "防守技术",
    basics: "基础技术"
  };

  return skill ? map[skill] ?? "网球教学" : "网球教学";
}

function chineseSkillTopic(skill?: string) {
  const map: Record<string, string> = {
    forehand: "正手",
    backhand: "反手",
    serve: "发球",
    movement: "步法",
    footwork: "步法",
    net: "网前",
    doubles: "双打站位",
    return: "接发球",
    topspin: "上旋",
    slice: "切削",
    grip: "握拍",
    training: "训练方法",
    mental: "比赛心态",
    matchplay: "比赛策略",
    consistency: "稳定性",
    defense: "防守",
    basics: "基础技术"
  };

  return skill ? map[skill] ?? "网球技术" : "网球技术";
}

const englishTopicReplacements: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /groundstroke depth/i, replacement: "底线球深度控制" },
  { pattern: /backhand slice/i, replacement: "反手切削" },
  { pattern: /double faults?/i, replacement: "双误" },
  { pattern: /2nd serve|second serve/i, replacement: "二发" },
  { pattern: /kick serve/i, replacement: "上旋发球" },
  { pattern: /slice serve/i, replacement: "切削发球" },
  { pattern: /basic tennis serve|basic serve/i, replacement: "基础发球" },
  { pattern: /tennis serve|serve technique|serve/i, replacement: "网球发球" },
  { pattern: /return of serve|serve return/i, replacement: "接发球" },
  { pattern: /drop shot/i, replacement: "放短球" },
  { pattern: /volley/i, replacement: "截击" },
  { pattern: /footwork/i, replacement: "步法" },
  { pattern: /groundstroke/i, replacement: "底线球" },
  { pattern: /forehand/i, replacement: "正手" },
  { pattern: /backhand/i, replacement: "反手" },
  { pattern: /slice/i, replacement: "切削" },
  { pattern: /topspin/i, replacement: "上旋" },
  { pattern: /depth/i, replacement: "深度控制" },
  { pattern: /consistency/i, replacement: "稳定性" },
  { pattern: /racket drop/i, replacement: "拍头下沉" },
  { pattern: /pronation/i, replacement: "前臂内旋" }
];

const englishNameReplacements: Record<string, string> = {
  "venus williams": "维纳斯·威廉姆斯",
  "patrick mouratoglou": "帕特里克·莫拉托格鲁",
  "roger federer": "罗杰·费德勒",
  "novak djokovic": "诺瓦克·德约科维奇",
  "rafael nadal": "拉斐尔·纳达尔",
  "andy murray": "安迪·穆雷",
  "carlos alcaraz": "卡洛斯·阿尔卡拉斯",
  "andrey rublev": "安德烈·卢布列夫"
};

const REASON_EN: Record<string, string> = {
  "发球动作总不顺": "Serve mechanics feel off",
  "正手总发不上力": "Forehand lacks power",
  "练球总没结构": "Practice feels unstructured",
  "基础动作总立不住": "Fundamentals keep breaking down",
  "反手总打不扎实": "Backhand feels unreliable",
  "双打站位总发乱": "Doubles positioning is messy",
  "比赛思路总不够清楚": "Match strategy feels unclear",
  "网前总不敢主动上": "Hesitant to come to net",
  "脚步启动总慢半拍": "Footwork is a step behind",
  "上旋总转不起来": "Can't generate enough topspin",
  "握拍总不稳定": "Grip feels unstable",
  "切削总飘不压低": "Slice floats instead of staying low",
  "高球和防守总处理不好": "Struggling with lobs and defense",
  "相持球总不够稳": "Rallies lack consistency",
  "接发总被对手压住": "Return gets dominated",
  "比赛里总容易紧": "Tense under match pressure"
};

const SUMMARY_EN: Record<string, string> = {
  // ZH expanded content summaries
  "反手准备和脚步理顺": "Backhand preparation and footwork",
  "3.0-3.5 综合提升": "All-around improvement for 3.0–3.5",
  "进阶动作细节和纠错": "Advanced technique and error correction",
  "真实练球过程更有代入感": "Real practice sessions for immersion",
  "中文字幕整理型资料库，基础内容全": "Subtitled reference library with full fundamentals",
  "训练营视角，偏脚步和发球体系": "Camp-style focus on footwork and serve",
  "中文字幕教学整理，偏发球和击球点": "Subtitled drills on serve and contact point",
  "适合自练和训练框架搭建": "Solo practice and training framework",
  "职业视角拆解发球框架": "Pro-level serve breakdown",
  "系统化理顺正反手框架": "Systematic forehand and backhand framework",
  "慢动作与中字整理，适合看动作模板": "Slow-motion reference for form study",
  "双打实战和比赛执行": "Doubles tactics and match execution",
  "动作细节和击球点纠正": "Technique detail and contact point fixes",
  "适合新手练脚步和稳定": "Beginner footwork and stability",
  "握拍、站位和发力讲得细": "Detailed grip, stance, and power",
  "真人示范型教学，偏正反手和截击": "Live demo drills: groundstrokes and volleys",
  "训练结构和发球基础": "Training structure and serve basics",
  "课后复盘型内容，偏动力链和训练": "Post-lesson review: kinetic chain and drills",
  // Creator shortDescriptions (used as summary for featured videos)
  "偏训练方法和青少年课堂": "Training methods and junior coaching",
  "内容全面清晰，适合打基础和自学入门": "Clear and thorough, great for self-study basics",
  "分主题教学，基础动作很系统": "Organized by topic with systematic fundamentals",
  "前职业球员视角，发球和脚步讲得清楚": "Ex-pro perspective on serve and footwork",
  "双打和时机处理很有干货": "Doubles and timing insights",
  "发力和实战连接讲得很强": "Power mechanics connected to match play",
  "发球和击球原理拆得很细": "Detailed serve and stroke principles",
  "成人球友视角，纠错很直接": "Adult player perspective with direct fixes",
  "战术和基本功拆解很扎实": "Solid tactics and fundamentals breakdown",
  "暂未绑定单一博主": "Curated content selection",
  "比赛拆解清楚，策略含金量高": "Match breakdowns with high-value strategy",
  "比赛模式拆解细，双打也强": "Detailed match patterns and doubles",
  "真实上传源，暂不参与博主榜": "Original source content",
  "短平快纠错，偏小技巧和细节": "Quick fixes and technique tips",
  "零基础到进阶的慢节奏讲解": "Beginner-to-intermediate at a steady pace",
  // EN expanded content summaries
  "短平快讲清实战细节": "Quick, focused match-play tips",
  "lesson实拍多，发球和正手干货密": "Lesson footage packed with serve and forehand drills",
  "底线深度和比赛策略": "Baseline depth and match strategy",
  "细节拆解扎实，讲得很透": "Thorough technique breakdowns",
  "4.5 学员实拍纠正": "Real 4.5-level student corrections",
  "现代击球和实战细节": "Modern strokes and match-play detail",
  "世界级教练的系统拆解": "World-class coaching breakdowns",
  "短视频密度高，技术点很准": "Dense, precise short-form tips",
  "长线技术框架和重建": "Long-term technique rebuilds",
  "动作修正和移动基础": "Stroke fixes and movement basics",
  "适合重建基础动作框架": "Rebuilding fundamental technique",
  "发球脚步和实战训练": "Serve footwork and match drills",
  "基础动作和训练逻辑讲得扎实": "Solid fundamentals and training logic",
  "技术细节和比赛理解并重": "Technique detail meets match IQ",
  "系统化正反手教学": "Systematic groundstroke coaching",
  "现代正手和发球讲得很实用": "Practical modern forehand and serve",
  "职业球员分享比赛经验": "Pro player match experience sharing",
  "时机、眼睛和截击讲得很透": "Deep dives on timing, vision, and volleys"
};

function translateReasonToEnglish(value?: string | null) {
  return value ? REASON_EN[value.trim()] : undefined;
}

function translateSummaryToEnglish(value?: string | null) {
  return value ? SUMMARY_EN[value.trim()] : undefined;
}

function normalizeTitleForComparison(value?: string | null) {
  return normalizeText(value ?? "")
    .replace(/[^A-Za-z0-9\u3400-\u9fff]+/g, "")
    .toLowerCase();
}

function countChineseCharacters(value: string) {
  return (value.match(/[\u3400-\u9fff]/g) ?? []).length;
}

function translateKnownNameToChinese(value?: string) {
  if (!value) {
    return null;
  }

  return englishNameReplacements[normalizeText(value).toLowerCase()] ?? null;
}

function findKnownChineseNameInText(value?: string | null) {
  const normalized = normalizeText(value ?? "").toLowerCase();

  if (!normalized) {
    return null;
  }

  for (const [englishName, chineseName] of Object.entries(englishNameReplacements)) {
    if (normalized.includes(englishName)) {
      return chineseName;
    }
  }

  return null;
}

function getChineseTopicFromEnglishTitle(title: string, skills?: string[]) {
  const normalized = normalizeText(title);

  for (const { pattern, replacement } of englishTopicReplacements) {
    if (pattern.test(normalized)) {
      return replacement;
    }
  }

  return chineseSkillTopic(skills?.[0]);
}

function isUsableChineseSecondaryTitle(candidate: string | null | undefined, originalTitle: string) {
  if (!candidate) {
    return false;
  }

  const normalized = normalizeText(candidate)
    .replace(/[。！!]+$/g, "")
    .trim();

  if (!normalized || countChineseCharacters(normalized) < 4) {
    return false;
  }

  if (!hasCJK(normalized)) {
    return false;
  }

  const originalKey = normalizeTitleForComparison(originalTitle);
  const candidateKey = normalizeTitleForComparison(normalized);
  return Boolean(candidateKey) && candidateKey !== originalKey;
}

function formatGeneratedChineseSubtitle(value: string) {
  return normalizeText(value)
    .replace(/[：:]\s*[：:]+/g, "：")
    .replace(/\s+/g, " ")
    .trim();
}

function buildChineseSubtitleFromTitleTemplate(
  item: Pick<ContentItem, "title" | "sourceTitle" | "originalTitle" | "skills">
) {
  const original = getOriginalContentTitle({
    title: item.title,
    sourceTitle: item.sourceTitle,
    originalTitle: item.originalTitle,
    platform: "YouTube",
    language: "en"
  });
  const topic = getChineseTopicFromEnglishTitle(original, item.skills);

  if (!topic) {
    return null;
  }

  const personMatch = original.match(/\bwith\s+(.+)$/i);
  const translatedPerson = translateKnownNameToChinese(personMatch?.[1]);
  const ntrpMatch = original.match(/\bwith\s+(\d(?:\.\d)?)\s*NTRP student\b/i);
  const stepGuideMatch = original.match(/\b(\d+)\s*step guide\b/i);
  const topMatch = original.match(/\btop\s*(\d+)\b/i);

  if (/^how to hit a basic .* with /i.test(original) && translatedPerson) {
    return formatGeneratedChineseSubtitle(`跟${translatedPerson}学${topic}`);
  }

  if (/masterclass/i.test(original) && /for beginners/i.test(original)) {
    return formatGeneratedChineseSubtitle(`${topic}入门精讲`);
  }

  if (/masterclass/i.test(original)) {
    return formatGeneratedChineseSubtitle(`${topic}精讲`);
  }

  if (ntrpMatch?.[1] && /lesson/i.test(original)) {
    return formatGeneratedChineseSubtitle(`${ntrpMatch[1]}水平学员案例：${topic}纠正课`);
  }

  if (stepGuideMatch?.[1]) {
    return formatGeneratedChineseSubtitle(`${topic}${stepGuideMatch[1]}步完整指南`);
  }

  if (topMatch?.[1]) {
    return formatGeneratedChineseSubtitle(`${topic}${topMatch[1]}个重点讲解`);
  }

  if (/simple steps/i.test(original)) {
    return formatGeneratedChineseSubtitle(`${topic}分步讲解`);
  }

  if (/analysis/i.test(original)) {
    return formatGeneratedChineseSubtitle(`${topic}解析`);
  }

  if (/lesson/i.test(original)) {
    return formatGeneratedChineseSubtitle(`${topic}教学课`);
  }

  if (/^how to /i.test(original)) {
    return formatGeneratedChineseSubtitle(`${topic}讲解`);
  }

  return null;
}

function normalizeChineseIssue(value?: string | null, skill?: string) {
  if (!value) {
    return null;
  }

  const normalized = normalizeChineseSentence(value)
    .replace(/^这条/, "")
    .replace(/^重点(?:在|讲)/, "")
    .replace(/^教你/, "")
    .replace(/^如何/, "")
    .replace(/^总是/, "")
    .trim();

  if (!normalized) {
    return null;
  }

  const duplicatePrefixMap: Record<string, RegExp[]> = {
    serve: [/^发球/, /^一发/, /^二发/],
    forehand: [/^正手/],
    backhand: [/^反手/],
    slice: [/^反手切削/, /^切削/],
    footwork: [/^步伐/, /^步法/],
    movement: [/^步伐/, /^步法/],
    return: [/^接发球/]
  };

  const stripped = (duplicatePrefixMap[skill ?? ""] ?? []).reduce((current, pattern) => {
    return current.replace(pattern, "").trim();
  }, normalized);

  return stripped || normalized;
}

function buildChineseSubtitleFromMetadata(
  item: Pick<ContentItem, "title" | "sourceTitle" | "originalTitle" | "skills" | "summary" | "reason" | "useCases">
) {
  const original = getOriginalContentTitle({
    title: item.title,
    sourceTitle: item.sourceTitle,
    originalTitle: item.originalTitle,
    platform: "YouTube",
    language: "en"
  });
  const topic = getChineseTopicFromEnglishTitle(original, item.skills) ?? chineseSkillTopic(item.skills?.[0]);
  const issue = normalizeChineseIssue(item.useCases[0]?.trim(), item.skills?.[0]);
  const reason = normalizeChineseIssue(item.reason?.trim(), item.skills?.[0]);
  const summary = normalizeChineseIssue(item.summary?.trim(), item.skills?.[0]);

  if (topic && issue) {
    return formatGeneratedChineseSubtitle(`${topic}：重点解决${issue}`);
  }

  if (topic && reason) {
    return formatGeneratedChineseSubtitle(`${topic}：${reason}`);
  }

  if (topic && summary) {
    return formatGeneratedChineseSubtitle(`${topic}：${summary}`);
  }

  if (issue) {
    return formatGeneratedChineseSubtitle(`针对${issue}的网球讲解`);
  }

  return null;
}

export function resolveChineseSecondaryTitleForEnglishContent(
  item: Pick<
    ContentItem,
    | "title"
    | "sourceTitle"
    | "originalTitle"
    | "secondaryTitleZh"
    | "skills"
    | "summary"
    | "reason"
    | "useCases"
  >
): { title: string; source: ChineseSecondaryTitleSource } {
  const original = getOriginalContentTitle({
    title: item.title,
    sourceTitle: item.sourceTitle,
    originalTitle: item.originalTitle,
    platform: "YouTube",
    language: "en"
  });
  const manual = item.secondaryTitleZh?.trim();
  if (isUsableChineseSecondaryTitle(manual, original)) {
    return { title: manual!, source: "manual" };
  }

  const fromTitleTemplate = buildChineseSubtitleFromTitleTemplate(item);
  if (isUsableChineseSecondaryTitle(fromTitleTemplate, original)) {
    return { title: fromTitleTemplate!, source: "title_template" };
  }

  const fromMetadata = buildChineseSubtitleFromMetadata(item);
  if (isUsableChineseSecondaryTitle(fromMetadata, original)) {
    return { title: fromMetadata!, source: "metadata" };
  }

  return {
    title: chineseSkillLabel(item.skills?.[0]),
    source: "generic_skill"
  };
}

function cleanFeaturedVideoTitleForSuggestion(title: string) {
  return normalizeText(title)
    .replace(/\s*[|｜]\s*[^|｜]+$/g, "")
    .replace(/[🎾🚀💪🔨✨🧐🐐🇪🇸🤔🔥✅❗️‼️]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getFeaturedVideoSkillHints(
  item: Pick<CreatorFeaturedVideo, "title" | "sourceTitle" | "originalTitle" | "target">,
  creator?: Pick<Creator, "specialties">
) {
  const hints = creator?.specialties?.length ? [...creator.specialties] : [];
  const target = item.target ?? "";
  const original = getOriginalFeaturedVideoTitle(item).toLowerCase();

  if (/forehand/.test(original) && !hints.includes("forehand")) {
    hints.unshift("forehand");
  }
  if (/backhand/.test(original) && !hints.includes("backhand")) {
    hints.unshift("backhand");
  }
  if (/serve|kick serve|slice serve|2nd serve|second serve/.test(original) && !hints.includes("serve")) {
    hints.unshift("serve");
  }
  if (/footwork|split step/.test(original) && !hints.includes("footwork")) {
    hints.unshift("footwork");
  }
  if (/return/.test(original) && !hints.includes("return")) {
    hints.unshift("return");
  }
  if (/volley|net/.test(original) && !hints.includes("net")) {
    hints.unshift("net");
  }
  if (/doubles/.test(original) && !hints.includes("doubles")) {
    hints.unshift("doubles");
  }
  if (/slice/.test(original) && !hints.includes("slice")) {
    hints.unshift("slice");
  }
  if (/topspin/.test(original) && !hints.includes("topspin")) {
    hints.unshift("topspin");
  }

  if (/发球|一发|二发|抛球/.test(target) && !hints.includes("serve")) {
    hints.unshift("serve");
  }
  if (/正手/.test(target) && !hints.includes("forehand")) {
    hints.unshift("forehand");
  }
  if (/反手/.test(target) && !hints.includes("backhand")) {
    hints.unshift("backhand");
  }
  if (/切削/.test(target) && !hints.includes("slice")) {
    hints.unshift("slice");
  }
  if (/脚步|步法/.test(target) && !hints.includes("footwork")) {
    hints.unshift("footwork");
  }
  if (/双打/.test(target) && !hints.includes("doubles")) {
    hints.unshift("doubles");
  }
  if (/接发/.test(target) && !hints.includes("return")) {
    hints.unshift("return");
  }
  if (/截击|网前/.test(target) && !hints.includes("net")) {
    hints.unshift("net");
  }

  return Array.from(new Set(hints));
}

function buildFeaturedVideoChineseTitleFromTemplate(
  item: Pick<CreatorFeaturedVideo, "title" | "sourceTitle" | "originalTitle" | "target">,
  creator?: Pick<Creator, "name" | "specialties">
) {
  const original = cleanFeaturedVideoTitleForSuggestion(getOriginalFeaturedVideoTitle(item));
  const skillHints = getFeaturedVideoSkillHints(item, creator);
  const topic = getChineseTopicFromEnglishTitle(original, skillHints);
  const creatorNameZh = findKnownChineseNameInText(original) || translateKnownNameToChinese(creator?.name);
  const episode = original.match(/\bepisode\s*(\d+)\b/i)?.[1];
  const minute = original.match(/\b(\d+)[-\s]*minute\b/i)?.[1];
  const stepCount = original.match(/\b(\d+)\s*(?:simple\s*)?steps?\b/i)?.[1]
    || original.match(/\b(\d+)\s*step guide\b/i)?.[1];
  const topCount = original.match(/\btop\s*(\d+)\b/i)?.[1];
  const versusMatch = original.match(/\b([A-Za-z]+)\s+vs\s+([A-Za-z]+)\b/i);
  const translatedLeft = findKnownChineseNameInText(versusMatch?.[1]);
  const translatedRight = findKnownChineseNameInText(versusMatch?.[2]);

  if (/^how to hit a basic .* with /i.test(original) && creatorNameZh) {
    return `跟${creatorNameZh}学网球基础发球`;
  }

  if (/^how to hit a 2nd serve/i.test(original) && creatorNameZh) {
    return `跟${creatorNameZh}学网球二发`;
  }

  if (/^how to hit forehand/i.test(original) && creatorNameZh) {
    return `跟${creatorNameZh}学网球正手`;
  }

  if (/^how to hit a tennis backhand/i.test(original) && creatorNameZh) {
    return `跟${creatorNameZh}学网球反手`;
  }

  if (/^how to improve your footwork/i.test(original) && creatorNameZh) {
    return `跟${creatorNameZh}提升场上步法`;
  }

  if (/let.?s level up your serve/i.test(original)) {
    return "让你的发球整体升级";
  }

  if (/stop over-rotating your forehand/i.test(original)) {
    return "正手别再过度转体";
  }

  if (/avoid late contact when hitting/i.test(original)) {
    return "避免击球点过晚";
  }

  if (/return of serve:.*masterclass/i.test(original)) {
    return `接发球精讲：莫拉托格鲁大师课${episode ? `第${episode}集` : ""}`;
  }

  if (/serve and volley:.*masterclass/i.test(original)) {
    return `发球上网精讲：莫拉托格鲁大师课${episode ? `第${episode}集` : ""}`;
  }

  if (/get rid of double faults/i.test(original)) {
    return "摆脱双误：发球纠正课";
  }

  if (minute && /slice serve/i.test(original)) {
    return `${minute}分钟学会切削发球`;
  }

  if (/serve more accurately/i.test(original)) {
    return "提升发球落点准确性";
  }

  if (/powerful kick serve/i.test(original) && stepCount) {
    return `大力上旋发球：${stepCount}步完整指南`;
  }

  if (/master your tennis serve/i.test(original) && topCount) {
    return `让发球动作更流畅：${topCount}个必练动作`;
  }

  if (/drop shot/i.test(original)) {
    return "放短球技巧讲解";
  }

  if (/carlos alcaraz forehand analysis/i.test(original)) {
    return "阿尔卡拉斯正手解析";
  }

  if (/forehand transformation of us college player/i.test(original)) {
    return "美国大学球员正手改造案例";
  }

  if (/forehand power unlocked/i.test(original)) {
    return "解锁正手力量：这样打出球速";
  }

  if (/hammer your serve for more power/i.test(original)) {
    return "增强发球力量：关键动作讲解";
  }

  if (/how to make real serve improvement/i.test(original)) {
    return "真正提升发球，而不只是小修小补";
  }

  if (/how to control groundstroke depth/i.test(original)) {
    return "如何把底线球打得更深：深度控制讲解";
  }

  if (/hit up on kick with bent arm/i.test(original)) {
    return "4.5学员上旋发球发力路径纠正";
  }

  if (/kick serve vs slice serve/i.test(original)) {
    return "上旋发球和切削发球区别讲解";
  }

  if (/wrong place/i.test(original) && /doubles/i.test(original)) {
    return "双打站位别再站错：实战站位策略";
  }

  if (/flat and slice serves/i.test(original)) {
    return "平击发球和切削发球提升讲解";
  }

  if (/bad tennis habits/i.test(original)) {
    return "为什么你总改不掉坏习惯";
  }

  if (/andrey rublev/i.test(original) && /forehand/i.test(original)) {
    return "像卢布列夫那样打出有冲击力的正手";
  }

  if (/roger federer/i.test(original) && /forehand/i.test(original)) {
    return "解锁费德勒正手的关键秘诀";
  }

  if (/pro forehand/i.test(original) && stepCount) {
    return `职业级正手：${stepCount}步讲清动作要点`;
  }

  if (/professional volley technique explained/i.test(original)) {
    return "截击技术详解：职业级网前动作课";
  }

  if (/serve pronation/i.test(original) && topCount) {
    return `${topCount}个练习学会轻松发球内旋`;
  }

  if (/master the kick serve/i.test(original)) {
    return "上旋发球精讲：职业示范版";
  }

  if (/spanish drill/i.test(original)) {
    return "提升稳定性的经典西班牙训练";
  }

  if (/open vs closed/i.test(original) && /forehand stance/i.test(original)) {
    return "正手站位别再用错：开放式与关闭式讲解";
  }

  if (/learning lag/i.test(original)) {
    return "学会拍头滞后：轻松加速的关键";
  }

  if (/how to handle high balls/i.test(original)) {
    return "高球处理讲解";
  }

  if (/perfect return/i.test(original)) {
    return "接发球关键动作讲解";
  }

  if (/5 biggest forehand mistakes/i.test(original)) {
    return "正手最常见的5个错误";
  }

  if (/3 return tips/i.test(original)) {
    return "安迪·穆雷的3个接发建议";
  }

  if (/open stance backhand/i.test(original)) {
    return "开放式反手教学";
  }

  if (/5 footwork fundamentals/i.test(original)) {
    return "每个网球选手都该掌握的5个步法基础";
  }

  if (/singles tennis strategy and shot selection - the four zones/i.test(original)) {
    return "单打选球与战术：四个分区思路";
  }

  if (/why you trust your backhand more than your forehand/i.test(original)) {
    return "为什么你更信任反手而不是正手";
  }

  if (/evolution of the split step/i.test(original)) {
    return "分腿垫步的演变：为什么职业球员会做二次分腿";
  }

  if (/hidden detail in tennis: 3 different ready positions/i.test(original)) {
    return "准备姿势的隐藏细节：3种 ready position";
  }

  if (/why pros have effortless power/i.test(original)) {
    return "为什么职业球员能轻松发力：拍头滞后测试";
  }

  if (/forehand - topspin and flat swing path/i.test(original)) {
    return "正手上旋与平击挥拍路径讲解";
  }

  if (/burst and glide/i.test(original)) {
    return "启动与滑步衔接讲解";
  }

  if (/subscriber serve vs federer/i.test(original)) {
    return "业余发球 vs 费德勒发球：差别在哪";
  }

  if (/this point is a perfect example of how (.+) broke (.+)'s game/i.test(original)) {
    const match = original.match(/this point is a perfect example of how (.+) broke (.+)'s game/i);
    const left = findKnownChineseNameInText(match?.[1]) || match?.[1];
    const right = findKnownChineseNameInText(match?.[2]) || match?.[2];
    return `${left}如何破解${right}打法：经典回合解析`;
  }

  if (/the weirdest (.+) vs (.+) rally you missed/i.test(original) && translatedLeft && translatedRight) {
    return `你可能错过的${translatedLeft} vs ${translatedRight}神奇回合`;
  }

  if (/did this play make (.+) the goat/i.test(original)) {
    const player = findKnownChineseNameInText(original) || "这位球员";
    return `这一分让${player}更像GOAT吗`;
  }

  if (/beat (.+) with a shot pros almost never hit/i.test(original)) {
    const opponent = findKnownChineseNameInText(original);
    return opponent ? `靠这一拍击败${opponent}：少见却高效的得分思路` : "少见却高效的得分回合解析";
  }

  if (translatedLeft && translatedRight) {
    return `${translatedLeft} vs ${translatedRight}回合解析`;
  }

  if (/top\s*(\d+)\s+beginner tennis drills/i.test(original)) {
    const count = original.match(/top\s*(\d+)/i)?.[1] ?? "10";
    return `新手最值得练的${count}个网球训练`;
  }

  if (/expectation vs reality/i.test(original)) {
    return "理想与现实：动作效果对比";
  }

  if (/overhead/i.test(original) && /mistakes/i.test(original) && topCount) {
    return `高压球最常见的${topCount}个错误`;
  }

  if (/bounce vs out of the air/i.test(original)) {
    return "高压球该等落地还是直接截击";
  }

  if (/overhead technique/i.test(original)) {
    return "高压球技术详解";
  }

  if (/overhead positioning/i.test(original)) {
    return "高压球站位讲解";
  }

  if (/overhead prep/i.test(original)) {
    return "高压球准备动作讲解";
  }

  if (/swing volley/i.test(original)) {
    return "挥拍截击讲解";
  }

  if (/drop shot/i.test(original) && /punish slow balls/i.test(original)) {
    return "慢球处理：放短球得分思路";
  }

  if (/volley/i.test(original) && /punish slow balls/i.test(original)) {
    return "慢球处理：截击得分思路";
  }

  if (/serve return/i.test(original) && /punish slow balls/i.test(original)) {
    return "慢球处理：接发抢攻思路";
  }

  if (/how to beat left-handed tennis players/i.test(original)) {
    return "如何应对左手球员：赢球套路";
  }

  if (/how to attack deep balls/i.test(original)) {
    return "如何进攻深球";
  }

  if (/become one with the ball/i.test(original)) {
    return "提升球感：让击球更顺";
  }

  if (/why/i.test(original) && topic) {
    return `${topic}问题解析`;
  }

  if (/mistakes?|myths?/i.test(original) && topic) {
    return `${topic}常见误区解析`;
  }

  if (/analysis/i.test(original) && topic) {
    const player = findKnownChineseNameInText(original);
    return player ? `${player}${topic}解析` : `${topic}解析`;
  }

  if (/masterclass/i.test(original) && topic) {
    return `${topic}精讲${episode ? `：大师课第${episode}集` : ""}`;
  }

  if (/explained/i.test(original) && topic) {
    return `${topic}详解`;
  }

  if (/tips?/i.test(original) && topic) {
    return `${topic}技巧讲解`;
  }

  if (/drills?/i.test(original) && topic) {
    return `${topic}训练方法`;
  }

  if ((/strategy|strategies|tactics|patterns/i.test(original)) && topic) {
    return `${topic}实战套路`;
  }

  if (/fundamentals/i.test(original) && topic) {
    return `${topic}基础要点`;
  }

  if (/demo/i.test(original) && topic) {
    return `${topic}示范讲解`;
  }

  if ((stepCount || topCount) && topic) {
    const count = stepCount || topCount;
    return `${topic}${count}个重点讲解`;
  }

  if (/lesson/i.test(original) && topic) {
    return `${topic}教学课`;
  }

  if (/how to |how /i.test(original) && topic) {
    if (/improve|better|level up|make /i.test(original)) {
      return `${topic}提升讲解`;
    }

    if (/fix|avoid|prevent|stop|get rid/i.test(original)) {
      return `${topic}纠正讲解`;
    }

    if (/control/i.test(original)) {
      if (topic.endsWith("控制")) {
        return `${topic}讲解`;
      }
      return `${topic}控制讲解`;
    }

    return `${topic}讲解`;
  }

  return null;
}

function buildFeaturedVideoChineseTitleFromTarget(
  item: Pick<CreatorFeaturedVideo, "target" | "title" | "sourceTitle" | "originalTitle">,
  creator?: Pick<Creator, "specialties">
) {
  const target = normalizeChineseSentence(item.target?.trim() ?? "");
  const skillHints = getFeaturedVideoSkillHints(item, creator);
  const topic = getChineseTopicFromEnglishTitle(getOriginalFeaturedVideoTitle(item), skillHints)
    || chineseSkillTopic(skillHints[0]);

  if (topic && target) {
    const issue = normalizeChineseIssue(target, skillHints[0]) ?? target;
    if (issue.startsWith("为何") || issue.startsWith("怎么")) {
      return `${topic}：${issue}`;
    }

    return `${topic}：重点解决${issue}`;
  }

  return target || null;
}

export function resolveFeaturedVideoChineseTitleSuggestion(
  item: Pick<CreatorFeaturedVideo, "id" | "title" | "sourceTitle" | "originalTitle" | "displayTitleZh" | "target">,
  creator?: Pick<Creator, "name" | "specialties">
): { title: string; source: FeaturedVideoChineseTitleSource } {
  const original = getOriginalFeaturedVideoTitle(item);
  const manual = item.displayTitleZh?.trim() || getCreatorFeaturedVideoChineseSubtitleOverride(item.id)?.trim();
  if (isUsableChineseSecondaryTitle(manual, original)) {
    return { title: manual!, source: "manual" };
  }

  const fromTemplate = buildFeaturedVideoChineseTitleFromTemplate(item, creator);
  if (isUsableChineseSecondaryTitle(fromTemplate, original)) {
    return { title: fromTemplate!, source: "title_template" };
  }

  const fromTarget = buildFeaturedVideoChineseTitleFromTarget(item, creator);
  if (isUsableChineseSecondaryTitle(fromTarget, original)) {
    return { title: fromTarget!, source: "target" };
  }

  const skillHints = getFeaturedVideoSkillHints(item, creator);
  return {
    title: chineseSkillLabel(skillHints[0]),
    source: "generic_skill"
  };
}

function getContentDisplayTitleEn(
  item: Pick<ContentItem, "id" | "displayTitleEn" | "skills" | "useCases" | "reason">
) {
  return item.displayTitleEn?.trim() || getContentEnglishOverride(item.id)?.displayTitleEn?.trim();
}

function getContentFocusLineEn(
  item: Pick<ContentItem, "id" | "focusLineEn" | "skills" | "useCases" | "reason" | "summary">
) {
  const explicit = item.focusLineEn?.trim() || getContentEnglishOverride(item.id)?.focusLineEn?.trim();
  if (explicit) {
    return explicit;
  }

  const useCase = item.useCases[0]?.trim();
  if (useCase && !hasCJK(useCase)) {
    return normalizeEnglishSentence(useCase);
  }

  if (item.reason?.trim() && !hasCJK(item.reason)) {
    return normalizeEnglishSentence(item.reason);
  }

  if (item.summary?.trim() && !hasCJK(item.summary)) {
    return normalizeEnglishSentence(item.summary);
  }

  const translatedSummary = translateSummaryToEnglish(item.summary);
  if (translatedSummary) {
    return translatedSummary;
  }

  const translatedReason = translateReasonToEnglish(useCase) ?? translateReasonToEnglish(item.reason);
  if (translatedReason) {
    return translatedReason;
  }

  return defaultEnglishFocusLine(item.skills);
}

export function getContentLanguageTag(item: Pick<ContentItem, "contentLanguage" | "language">) {
  return item.contentLanguage ?? item.language;
}

export function getPlatformDisplayName(
  platform: ContentPlatform | CreatorPlatformName,
  locale: Locale
) {
  if (platform === "Xiaohongshu") {
    return locale === "zh" ? "小红书" : "RedNote";
  }

  return platform;
}

export function getSubtitleAvailability(
  item: Pick<ContentItem, "subtitleAvailability" | "language" | "platform">
): ContentSubtitleAvailability {
  if (item.subtitleAvailability) {
    return item.subtitleAvailability;
  }

  if (item.language === "en") {
    return "not_needed";
  }

  if (item.platform === "Bilibili") {
    return "none";
  }

  return "unknown";
}

export function getSubtitleAvailabilityTranslationKey(subtitleAvailability: ContentSubtitleAvailability) {
  if (subtitleAvailability === "english") {
    return "content.subtitle.yes";
  }

  if (subtitleAvailability === "zh") {
    return "content.subtitle.zh";
  }

  if (subtitleAvailability === "zh_en") {
    return "content.subtitle.zhEn";
  }

  if (subtitleAvailability === "none") {
    return "content.subtitle.no";
  }

  if (subtitleAvailability === "not_needed") {
    return "content.subtitle.notNeeded";
  }

  return "content.subtitle.unknown";
}

export function getEnglishGloss(
  item: Pick<ContentItem, "id" | "displayTitleEn" | "skills" | "useCases" | "reason">
) {
  const explicit = getContentDisplayTitleEn(item);
  if (explicit) {
    return explicit;
  }

  const skill = englishSkillLabel(item.skills[0]);
  const target = item.useCases[0]?.trim() || item.reason.trim();

  if (!target) {
    return `${skill} lesson`;
  }

  if (!hasCJK(target)) {
    return `${skill}: ${normalizeEnglishSentence(target)}`;
  }

  const translated = translateReasonToEnglish(target);
  if (translated) {
    return translated;
  }

  return `${skill} lesson`;
}

export function getChineseDisplayTitle(
  item: Pick<ContentItem, "title" | "sourceTitle" | "originalTitle" | "displayTitleZh" | "platform" | "language">
) {
  if (item.displayTitleZh?.trim()) {
    return item.displayTitleZh.trim();
  }

  return getOriginalContentTitle(item);
}

export function getContentPrimaryTitle(
  item: Pick<
    ContentItem,
    | "id"
    | "title"
    | "sourceTitle"
    | "originalTitle"
    | "displayTitleZh"
    | "displayTitleEn"
    | "platform"
    | "language"
    | "contentLanguage"
    | "skills"
    | "useCases"
    | "reason"
  >,
  locale: Locale
) {
  if (locale === "en") {
    const explicit = getContentDisplayTitleEn(item);
    if (explicit) {
      return explicit;
    }

    const original = getOriginalContentTitle(item);
    if (!hasCJK(original)) {
      return original;
    }

    return getEnglishGloss(item);
  }

  if (getContentLanguageTag(item) === "en") {
    return getOriginalContentTitle(item);
  }

  return getChineseDisplayTitle(item);
}

export function getContentSecondaryTitle(
  item: Pick<
    ContentItem,
    | "id"
    | "title"
    | "sourceTitle"
    | "originalTitle"
    | "displayTitleZh"
    | "secondaryTitleZh"
    | "displayTitleEn"
    | "platform"
    | "language"
    | "contentLanguage"
    | "skills"
    | "summary"
    | "reason"
    | "useCases"
  >,
  locale: Locale
) {
  const original = getOriginalContentTitle(item);
  const zhTitle = item.displayTitleZh?.trim() || original;
  const enTitle = getContentDisplayTitleEn({
    id: item.id,
    displayTitleEn: item.displayTitleEn,
    skills: [],
    useCases: [""],
    reason: ""
  });

  if (locale === "en" && getContentLanguageTag(item) === "zh") {
    return zhTitle !== enTitle ? zhTitle : null;
  }

  if (locale === "zh" && getContentLanguageTag(item) === "en") {
    return resolveChineseSecondaryTitleForEnglishContent(item).title;
  }

  return null;
}

export function getContentFocusLine(
  item: Pick<ContentItem, "id" | "focusLineEn" | "skills" | "useCases" | "reason" | "summary">,
  locale: Locale
) {
  if (locale === "en") {
    return getContentFocusLineEn(item);
  }

  const useCase = item.useCases[0]?.trim();
  if (useCase) {
    return normalizeChineseSentence(useCase);
  }

  if (item.reason?.trim()) {
    return normalizeChineseSentence(item.reason);
  }

  return normalizeChineseSentence(item.summary);
}

export function getContentCoachNote(
  item: Pick<ContentItem, "coachReason">,
  locale: Locale
) {
  const note = item.coachReason?.trim();
  if (!note) {
    return null;
  }

  if (locale === "en" && hasCJK(note)) {
    return null;
  }

  return canonicalizeTennisText(note, locale);
}

export function formatCompactViewCount(value: number | undefined, locale: Locale = "zh") {
  if (!value || value <= 0) {
    return null;
  }

  if (locale === "en") {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);
  }

  if (value < 10000) {
    return String(Math.round(value));
  }

  const wan = Math.round((value / 10000) * 10) / 10;
  return `${wan.toFixed(1)}万`;
}

export function getCreatorSecondaryName(creator: Creator, locale: Locale): string | null {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    const nameEn = creator.nameEn?.trim() || override?.nameEn;
    if (nameEn && nameEn !== creator.name) {
      return creator.name;
    }
    return null;
  }

  const nameZh = creator.nameZh?.trim() || override?.nameZh;
  return nameZh && nameZh !== creator.name ? nameZh : null;
}

export function getCreatorPrimaryName(creator: Creator, locale: Locale): string {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    return creator.nameEn?.trim() || override?.nameEn || creator.name;
  }

  return creator.name;
}

export function getCreatorShortDescription(creator: Creator, locale: Locale) {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    return creator.shortDescriptionEn?.trim() || override?.shortDescriptionEn || creator.shortDescription;
  }

  return creator.shortDescription;
}

export function getCreatorBio(creator: Creator, locale: Locale) {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    return creator.bioEn?.trim() || override?.bioEn || creator.bio;
  }

  return creator.bio;
}

export function getCreatorSuitableFor(creator: Creator, locale: Locale) {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    return creator.suitableForEn?.length ? creator.suitableForEn : override?.suitableForEn ?? creator.suitableFor;
  }

  return creator.suitableFor;
}

export function getCreatorTagLabel(tag: string, locale: Locale) {
  if (locale === "en") {
    return CREATOR_TAG_LABELS_EN[tag] ?? tag;
  }

  return CREATOR_TAG_LABELS_ZH[tag] ?? tag;
}

export function getCreatorTags(tags: string[], locale: Locale) {
  return tags.map((tag) => getCreatorTagLabel(tag, locale));
}

function getFeaturedVideoExplicitTitle(
  item: Pick<CreatorFeaturedVideo, "id" | "displayTitleEn" | "title">,
  creator?: Pick<Creator, "id">
) {
  return item.displayTitleEn?.trim() || getCreatorFeaturedVideoEnglishOverride(creator?.id, item.id)?.displayTitleEn?.trim();
}

function getFeaturedVideoExplicitTarget(
  item: Pick<CreatorFeaturedVideo, "id" | "target" | "targetEn">,
  creator?: Pick<Creator, "id">
) {
  return item.targetEn?.trim() || getCreatorFeaturedVideoEnglishOverride(creator?.id, item.id)?.targetEn?.trim();
}

function getFeaturedVideoFallbackTarget(creator?: Pick<Creator, "specialties">) {
  return defaultEnglishFocusLabel(creator?.specialties);
}

export function getFeaturedVideoPrimaryTitle(
  item: Pick<
    CreatorFeaturedVideo,
    "id" | "title" | "sourceTitle" | "originalTitle" | "displayTitleEn" | "displayTitleZh" | "target" | "targetEn" | "contentLanguage"
  >,
  locale: Locale,
  creator?: Pick<Creator, "id" | "specialties">
) {
  if (locale === "en") {
    const explicit = getFeaturedVideoExplicitTitle(item, creator);
    if (explicit) {
      return explicit;
    }

    if (!hasCJK(item.title) || item.contentLanguage === "en") {
      return item.title;
    }

    return getFeaturedVideoExplicitTarget(item, creator) || getFeaturedVideoFallbackTarget(creator);
  }

  return item.displayTitleZh?.trim() || item.originalTitle?.trim() || item.sourceTitle?.trim() || item.title;
}

export function getFeaturedVideoSecondaryTitle(
  item: Pick<
    CreatorFeaturedVideo,
    "id" | "title" | "sourceTitle" | "originalTitle" | "displayTitleEn" | "displayTitleZh" | "contentLanguage" | "target"
  >,
  locale: Locale,
  creator?: Pick<Creator, "id" | "name" | "specialties">
) {
  const original = getOriginalFeaturedVideoTitle(item);
  const enTitle = getFeaturedVideoExplicitTitle({
    id: item.id,
    displayTitleEn: item.displayTitleEn,
    title: item.title
  }, creator);

  if (locale === "en" && hasCJK(original)) {
    return original !== enTitle ? original : null;
  }

  if (locale === "zh" && enTitle && !hasCJK(item.title)) {
    return enTitle !== original ? enTitle : null;
  }

  if (locale === "zh" && !hasCJK(original)) {
    const manualZh = item.displayTitleZh?.trim() || getCreatorFeaturedVideoChineseSubtitleOverride(item.id)?.trim();

    if (manualZh) {
      return manualZh;
    }

    return resolveFeaturedVideoChineseTitleSuggestion(item, creator).title;
  }

  return null;
}

export function getFeaturedVideoTarget(
  item: Pick<CreatorFeaturedVideo, "id" | "target" | "targetEn">,
  locale: Locale,
  creator?: Pick<Creator, "id" | "specialties">
) {
  if (locale === "en") {
    return getFeaturedVideoExplicitTarget(item, creator) || getFeaturedVideoFallbackTarget(creator);
  }

  return item.target;
}
