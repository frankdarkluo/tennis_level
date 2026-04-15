import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import { diagnosisRules } from "@/data/diagnosisRules";
import {
  buildDiagnosisCategoryConflict,
  buildDiagnosisCategoryGate,
  isDiagnosisResultConsistentWithHandoff,
  ruleMatchesDiagnosisCategoryGate
} from "@/lib/diagnose/categoryGate";
import {
  ASSESSMENT_DIMENSION_HINTS,
  DEFAULT_PROBLEM_TAG,
  DIAGNOSIS_CONTENT_PROBLEM_TAG_ALIASES
} from "@/lib/diagnose/problemTagSupport";
import { retrieveCatalogContentsByIds, retrieveCatalogRecommendations } from "@/lib/content-catalog/retrieve";
import { filterByEnvironment } from "@/lib/environment";
import { buildDiagnosisGuidanceContext } from "@/lib/guidance-context/build";
import { recommendAttachedVideos } from "@/lib/recommendations/attached/recommend";
import { AssessmentResult } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import { AppEnvironment } from "@/types/environment";
import { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import { ProblemTag } from "@/types/problemTag";
import {
  DiagnosisAlias,
  DiagnosisConfidence,
  DiagnosisClause,
  DiagnosisEffortMode,
  DiagnosisEvidenceLevel,
  DiagnoseOptions,
  DiagnosisInternalSignal,
  DiagnosisLayeredSignals,
  DiagnosisModifier,
  DiagnosisNarrowingSuggestion,
  DiagnosisRefusalReasonCode,
  DiagnosisResult,
  DiagnosisRule,
  DiagnosisSignalBundle,
  DiagnosisSignalSegment,
  DiagnosisSlot,
  DiagnosisSlotType,
  DiagnosisSupportSignal
} from "@/types/diagnosis";

export type ProblemPreviewOption = {
  label: string;
  label_en: string;
  problemTag: ProblemTag;
};

const DEFAULT_SUMMARY =
  "我们先给你一个基础方向：先找最影响你的 1 个问题，先把稳定性和准备节奏建立起来，再逐步加强力量和变化。";
const DEFAULT_SUMMARY_EN =
  "Start by finding the one thing that affects you the most. Build stability and timing first, then gradually add pace and variety.";

const DEFAULT_CAUSES = [
  "问题描述还比较宽泛，暂时无法精确定位到单一技术环节",
  "大多数初中级问题都和准备时机、击球点和动作节奏有关",
  "当前更需要先把问题缩小到一个具体场景"
];
const DEFAULT_CAUSES_EN = [
  "The description is still broad — hard to pinpoint a single technical issue",
  "Most beginner-to-intermediate problems relate to preparation timing, contact point, and swing rhythm",
  "The next step is narrowing the problem to a specific scenario"
];

const DEFAULT_FIXES = [
  "先只解决一个问题，不要同时改太多动作",
  "先追求稳定过网和更清楚的击球点",
  "下次描述问题时尽量带上场景，比如'反手总下网'或'二发没信心'"
];
const DEFAULT_FIXES_EN = [
  "Focus on one problem at a time — do not try to fix everything at once",
  "Aim for consistent clearance over the net and a cleaner contact point first",
  "Next time, describe the situation more specifically — e.g. 'my backhand keeps going into the net'"
];

const DEFAULT_DRILLS = [
  "每次训练只设 1 个主目标",
  "影子挥拍 20 次，感受准备和节奏",
  "慢节奏定点击球 20 球，先保证稳定过网"
];
const DEFAULT_DRILLS_EN = [
  "Set just one main goal per practice session",
  "20 shadow swings — focus on preparation and rhythm",
  "20 slow-feed target hits — prioritize clearing the net consistently"
];

const DEFAULT_CONTENT_IDS = ["content_cn_c_01", "content_cn_f_02", "content_gaiao_01"];
const ALL_DIAGNOSIS_CONTENTS = [...contents, ...expandedContents];
const EXPANDED_CONTENT_ID_SET = new Set(expandedContents.map((item) => item.id));

const SUMMARY_CHAR_BUDGET: Record<"zh" | "en", number> = {
  zh: 86,
  en: 180
};

const QUICK_SUMMARY_CHAR_BUDGET: Record<"zh" | "en", number> = {
  zh: 64,
  en: 132
};

const SUMMARY_FIX_CHAR_BUDGET: Record<"zh" | "en", number> = {
  zh: 28,
  en: 60
};

const SUPPORT_SIGNAL_CONTENT_IDS: Record<string, string[]> = {
  cant_self_practice: ["content_cn_c_03", "content_cn_f_02", "content_cn_f_03"],
  plateau_no_progress: ["content_cn_f_03", "content_cn_f_02", "content_cn_c_03"]
};

const PROBLEM_PREVIEW_OPTIONS: ProblemPreviewOption[] = [
  { label: "反手总是下网", label_en: "Backhand keeps going into the net", problemTag: "backhand-into-net" },
  { label: "二发总双误", label_en: "Second serve keeps double faulting", problemTag: "second-serve-reliability" },
  { label: "多拍对拉总不稳", label_en: "Rally breaks down after a few balls", problemTag: "rally-consistency" },
  { label: "正手一发力就出界", label_en: "Forehand flies out when I swing harder", problemTag: "forehand-out" },
  { label: "双打不知道站哪", label_en: "Not sure where to stand in doubles", problemTag: "doubles-positioning" },
  { label: "脚步总慢半拍", label_en: "Footwork is always half a beat late", problemTag: "movement-slow" },
  { label: "比赛一紧张就乱", label_en: "Execution tightens up under pressure", problemTag: "pressure-tightness" },
  { label: "年纪大了跑不太动", label_en: "I cannot move as well anymore", problemTag: "mobility-limit" }
];

const LEVEL_PREFERENCE_MAP: Record<string, string[]> = {
  "2.5": ["2.5", "3.0"],
  "3.0": ["2.5", "3.0"],
  "3.5": ["3.0", "3.5"],
  "4.0": ["3.5", "4.0", "4.5"],
  "4.0+": ["4.0", "4.5"],
  "4.5": ["4.0", "4.5"]
};


const TITLE_MAP_ZH: Record<string, string> = {
  "backhand-into-net": "反手稳定性不足",
  "rally-consistency": "多拍对拉稳定性不足",
  "forehand-out": "正手控制不足",
  "first-serve-in": "一发进区率不足",
  "second-serve-reliability": "二发稳定性不足",
  "serve-toss-consistency": "发球抛球稳定性不足",
  "serve-timing": "发球节奏与触球时机不足",
  "late-contact": "准备偏慢 / 击球点偏晚",
  "net-confidence": "网前信心和动作控制不足",
  "volley-floating": "截击控制不稳，回球容易冒高",
  "volley-into-net": "截击过网稳定性不足",
  "volley-contact-instability": "网前第一拍处理不干净",
  "half-volley-late-contact": "半截击低球处理和前点击球不足",
  "overhead-timing": "高压球时机和调步不足",
  "overhead-spacing": "高压球退位和站到球后不足",
  "match-anxiety": "比赛紧张导致执行下降",
  "pressure-tightness": "压力下执行变形",
  "safe-short-collapse": "压力下只敢搓短球，主动权丢失",
  "key-point-indecision": "关键分处理犹豫，决策不清晰",
  "forehand-no-power": "正手发力链条不顺",
  "running-forehand": "跑动中正手稳定性不足",
  "running-backhand": "跑动中反手稳定性不足",
  "on-the-run-late-contact": "跑动中准备慢，触球点总偏晚",
  "recovery-delay": "跑动击球后回位与还原偏慢",
  "balls-too-short": "击球深度不足",
  "return-under-pressure": "接发球准备和策略不足",
  "backhand-slice-floating": "反手切削控制不足",
  "slice-depth-control": "切削落点和深度控制不足",
  "topspin-low": "正手上旋和弧线不足",
  "serve-accuracy": "发球进区率和落点控制不足",
  "movement-slow": "脚步启动和到位偏慢",
  "mobility-limit": "移动范围和到位能力受限",
  "stamina-drop": "体能下降后动作稳定性下滑",
  "doubles-positioning": "双打站位和轮转不清晰",
  "doubles-poach-hesitation": "双打抢网时机和压网决定不足",
  "doubles-formation-confusion": "双打发接发阵型和轮转规则不清楚",
  "incoming-slice-trouble": "对手削球来球处理不顺",
  "moonball-trouble": "高吊球 / 月亮球来球处理不顺",
  "cant-hit-lob": "防守高球选择不足",
  "passive-point-construction": "分点组织被动，没有建立下一拍结构",
  "plateau-no-progress": "训练聚焦不够，进入平台期",
  "cant-self-practice": "训练规划不清晰",
  "general-improvement": "通用提升方向"
};

const TITLE_MAP_EN: Record<string, string> = {
  "backhand-into-net": "Backhand consistency",
  "rally-consistency": "Rally consistency",
  "forehand-out": "Forehand control",
  "first-serve-in": "First-serve make rate",
  "second-serve-reliability": "Second-serve reliability",
  "serve-toss-consistency": "Serve toss consistency",
  "serve-timing": "Serve timing and rhythm",
  "late-contact": "Late preparation and contact point",
  "net-confidence": "Net play confidence and control",
  "volley-floating": "Volley height control",
  "volley-into-net": "Volley net clearance",
  "volley-contact-instability": "First-volley contact stability",
  "half-volley-late-contact": "Half-volley pickup and timing",
  "overhead-timing": "Overhead timing",
  "overhead-spacing": "Overhead spacing and positioning",
  "match-anxiety": "Match nerves affecting execution",
  "pressure-tightness": "Execution tightening under pressure",
  "safe-short-collapse": "Pressure collapse into safe short balls",
  "key-point-indecision": "Indecision on key points",
  "forehand-no-power": "Forehand power chain",
  "running-forehand": "Running forehand stability",
  "running-backhand": "Running backhand stability",
  "on-the-run-late-contact": "Late contact on the run",
  "recovery-delay": "Recovery delay after movement",
  "balls-too-short": "Depth and penetration",
  "return-under-pressure": "Return of serve under pressure",
  "backhand-slice-floating": "Backhand slice control",
  "slice-depth-control": "Slice depth control",
  "topspin-low": "Forehand topspin and arc",
  "serve-accuracy": "Serve accuracy and placement",
  "movement-slow": "Footwork start and court coverage",
  "mobility-limit": "Mobility and court coverage limits",
  "stamina-drop": "Stamina drop-off",
  "doubles-positioning": "Doubles positioning and rotation",
  "doubles-poach-hesitation": "Doubles poach hesitation",
  "doubles-formation-confusion": "Doubles formation confusion",
  "incoming-slice-trouble": "Handling incoming slice",
  "moonball-trouble": "Handling moonballs",
  "cant-hit-lob": "Defensive lob selection",
  "passive-point-construction": "Passive point construction",
  "plateau-no-progress": "Training focus — breaking through a plateau",
  "cant-self-practice": "Practice planning",
  "general-improvement": "General improvement direction"
};

const CONFIDENCE_MAP: Record<DiagnosisConfidence, Record<"zh" | "en", string>> = {
  "较高": { zh: "较高", en: "Higher" },
  "中等": { zh: "中等", en: "Medium" },
  "较低": { zh: "较低", en: "Lower" }
};

const DIAGNOSIS_ALIAS_PATTERNS: Array<{ alias: DiagnosisAlias; patterns: RegExp[] }> = [
  { alias: "first_serve", patterns: [/(?:一发(?!力)|first serve|first-serve|firstserve)/i] },
  { alias: "second_serve", patterns: [/(?:二发|second serve|second-serve|secondserve)/i] },
  { alias: "overhead", patterns: [/(?:高压|overhead|smash|杀高球|高球处理)/i] },
  { alias: "moonball", patterns: [/(?:月亮球|moon ball|moonball|高吊球|高挑球|挑高球)/i] },
  { alias: "slice", patterns: [/(?:切削|slice|下旋)/i] },
  {
    alias: "key_point",
    patterns: [
      /(?:关键分|关键球|pressure point|big point|break point|game point|match point|deuce|tie ?break|tiebreak|30\s*30|30\s*40|40\s*30|40\s*40|\b(?:bp|gp|mp|tb)\b)/i
    ]
  },
  {
    alias: "mobility_limit",
    patterns: [/(?:左右追球跟不上|追球跟不上|移动跟不上|左右移动跟不上|脚步慢|移动受限|跑不动|movement slow|cover the court)/i]
  }
];

const DIAGNOSIS_MODIFIER_PATTERNS: Array<{ modifier: DiagnosisModifier; patterns: RegExp[] }> = [
  {
    modifier: "tight",
    patterns: [
      /(?:关键分|关键球|压力大|一紧张|紧张|手紧|pressure point|big point|break point|game point|match point|deuce|tie ?break|tiebreak|30\s*30|30\s*40|40\s*30|40\s*40|\b(?:bp|gp|mp|tb)\b|chok(?:e|ing)|tense up)/i
    ]
  },
  { modifier: "age", patterns: [/(?:年纪大了|年纪大|上年纪|年龄大|老了)/i] }
];

const DIAGNOSIS_SUPPORT_SIGNAL_PATTERNS: Array<{ signal: DiagnosisSupportSignal; patterns: RegExp[] }> = [
  {
    signal: "plateau_no_progress",
    patterns: [/(?:练了很久没进步|练了很多还是老样子|总在原地踏步|平台期|瓶颈|not improving|never get better|hit a plateau|stuck and not improving)/i]
  },
  {
    signal: "cant_self_practice",
    patterns: [/(?:不知道自己该练什么|不知道练什么|不会自己练|训练没计划|每次都乱练|what to practice|do not know what to practice|cannot plan my own practice|practice randomly)/i]
  }
];

const DIAGNOSIS_CLAUSE_SPLITTER = /[，。！？、；;]+|如果|但是|但/g;

const DIAGNOSIS_TRIGGER_PATTERNS: Array<{ signal: string; patterns: RegExp[] }> = [
  {
    signal: "opponent_at_net",
    patterns: [/(?:对手在网前|对手一上网|对手抢网|对手封网|opponent at net|they poach|poach(?:ing)? at net|rush(?:es)? the net|serve and volley)/i]
  },
  { signal: "net_pressure", patterns: [/(?:压网|上网压迫|net pressure|poach(?:ing)?|closing at net)/i] },
  { signal: "overhit", patterns: [/(?:一发力就|发力就飞|swing harder.*long|hit harder.*out)/i] },
  { signal: "hesitation", patterns: [/(?:犹豫|不敢打|hesitat)/i] }
];

const DIAGNOSIS_TYPO_NORMALIZATIONS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bduece\b/g, replacement: "deuce" },
  { pattern: /\bdueuse\b/g, replacement: "deuce" },
  { pattern: /\bduese\b/g, replacement: "deuce" },
  { pattern: /\btiebrake\b/g, replacement: "tiebreak" },
  { pattern: /\btiebrak\b/g, replacement: "tiebreak" },
  { pattern: /\btiebrkae\b/g, replacement: "tiebreak" },
  { pattern: /\btie\s*brake\b/g, replacement: "tiebreak" },
  { pattern: /\bbrek\s*point\b/g, replacement: "break point" },
  { pattern: /\bbrekpoint\b/g, replacement: "break point" },
  { pattern: /\bbreakpiont\b/g, replacement: "break point" },
  { pattern: /\bgamepiont\b/g, replacement: "game point" },
  { pattern: /\bmatchpiont\b/g, replacement: "match point" },
  { pattern: /\bsecnd\s*serve\b/g, replacement: "second serve" },
  { pattern: /\bseond\s*serve\b/g, replacement: "second serve" },
  { pattern: /\bsecond\s*seve\b/g, replacement: "second serve" },
  { pattern: /\bforehnad\b/g, replacement: "forehand" },
  { pattern: /\bbackhnad\b/g, replacement: "backhand" },
  { pattern: /\bnervious\b/g, replacement: "nervous" },
  { pattern: /\bpressue\b/g, replacement: "pressure" },
  { pattern: /\bpoching\b/g, replacement: "poaching" },
  { pattern: /\bdouble\s*fualt(s|ing)?\b/g, replacement: "double fault$1" },
  { pattern: /\bdoulbe\s*fault(s|ing)?\b/g, replacement: "double fault$1" },
  { pattern: /\bdoble\s*fault(s|ing)?\b/g, replacement: "double fault$1" },
  { pattern: /\bdoublefualt(s|ing)?\b/g, replacement: "doublefault$1" },
  { pattern: /\bdoulbefault(s|ing)?\b/g, replacement: "doublefault$1" },
  { pattern: /\bdoublefaut(s|ing)?\b/g, replacement: "doublefault$1" }
];

type DiagnosisPriorityLane =
  | "none"
  | "stroke_outcome"
  | "stroke_context"
  | "tactical_primary"
  | "physical_primary"
  | "mental_fallback";

type DiagnosisRuleSlotProfile = {
  lane: DiagnosisPriorityLane;
  required?: DiagnosisInternalSignal[];
  optional?: DiagnosisInternalSignal[];
};

type DiagnosisRuleCandidate = {
  rule: DiagnosisRule;
  matchedKeywords: string[];
  matchedSynonyms: string[];
  lexicalScore: number;
  slotScore: number;
  priorityWeight: number;
  layeredPrimaryBonus: number;
  clauseCoverageBonus: number;
  matchedClauseCount: number;
  laneConflictPenalty: number;
  score: number;
};

const DIAGNOSIS_SLOT_PATTERNS: Array<{ type: DiagnosisSlotType; value: string; patterns: RegExp[] }> = [
  { type: "stroke", value: "forehand", patterns: [/(?:正手|forehand)/i] },
  { type: "stroke", value: "backhand", patterns: [/(?:反手|backhand)/i] },
  { type: "stroke", value: "serve", patterns: [/(?:发球|一发(?!力)|二发|first serve|second serve|first_serve|second_serve|serve)/i] },
  { type: "stroke", value: "slice", patterns: [/(?:切削|切球|slice)/i] },
  { type: "stroke", value: "volley", patterns: [/(?:截击|截球|网前|volley)/i] },
  { type: "stroke", value: "half_volley", patterns: [/(?:半截击|half-?volley|short hop)/i] },
  { type: "stroke", value: "overhead", patterns: [/(?:高压|smash|overhead)/i] },
  { type: "outcome", value: "net", patterns: [/(?:下网|挂网|不过网|into the net|cannot clear the net)/i] },
  { type: "outcome", value: "out", patterns: [/(?:出界|出底线|老飞|一抡就飞|long|flying long|going out|goes long)/i] },
  { type: "outcome", value: "float", patterns: [/(?:冒高|总浮|总飘|飘起来|floating|keeps floating|sits up)/i] },
  { type: "outcome", value: "short", patterns: [/(?:很短|太短|落点浅|没有深度|只敢搓短|short|lands short|drops short)/i] },
  { type: "outcome", value: "dirty_contact", patterns: [/(?:处理不干净|处理不实|打不扎实|处理不利索|not clean|not solid|shank)/i] },
  { type: "outcome", value: "pickup_fail", patterns: [/(?:挑不起来|撩不起来|带不起来|get it up|pick it up)/i] },
  { type: "outcome", value: "late_contact", patterns: [/(?:晚点|晚一拍|总晚一点|late contact)/i] },
  { type: "outcome", value: "double_fault", patterns: [/(?:双误|double fault|double faults|double faulting|doublefault|doublefaults|doublefaulting)/i] },
  { type: "outcome", value: "miss_in", patterns: [/(?:发不进|进区率太低|will not go in|keeps missing)/i] },
  {
    type: "context",
    value: "pressure",
    patterns: [
      /(?:关键分|关键球|pressure point|big point|under pressure|一紧张|紧张|记分|score matters|nervous|nerves|key_point|手硬|手紧|不敢打|break point|game point|match point|deuce|tie ?break|tiebreak|30\s*30|30\s*40|40\s*30|40\s*40|\b(?:bp|gp|mp|tb)\b|chok(?:e|ing)|tense up)/i
    ]
  },
  { type: "context", value: "rally", patterns: [/(?:多拍|回合|对拉|相持|拉锯|rally|baseline exchange|long exchange)/i] },
  { type: "context", value: "movement", patterns: [/(?:左右移动|移动时|移动中|跑动中|宽球|追球|wide|move wide|running|on the stretch)/i] },
  { type: "context", value: "incoming_slice", patterns: [/(?:对方切过来|对手切过来|遇到下旋|下旋来球|对方一切球|against slice|opponents slice|incoming slice|low skidding balls)/i] },
  { type: "context", value: "incoming_moonball", patterns: [/(?:月亮球|moonball|moon ball|高吊球|高挑球|挑高球)/i] },
  { type: "context", value: "doubles", patterns: [/(?:双打|doubles)/i] },
  { type: "condition", value: "mobility_limit", patterns: [/(?:年纪大了|年纪大|上年纪|年龄大|老了|跑不太动|跑不动|跟不上|movement range feels limited|cannot move well anymore|cover the court anymore|mobility_limit)/i] },
  { type: "condition", value: "tight", patterns: [/(?:手紧|tight|freeze|缩手缩脚|动作就变形|swing tighten)/i] },
  { type: "condition", value: "hesitation", patterns: [/(?:不敢抢|不敢压|犹豫|迟疑|拿不准|不知道.*该|hesitat|freeze at net|cannot decide|do not know what to do)/i] }
];

const DIAGNOSIS_LANE_WEIGHTS: Record<DiagnosisPriorityLane, number> = {
  none: 0,
  stroke_outcome: 12,
  stroke_context: 9,
  tactical_primary: 7,
  physical_primary: 6,
  mental_fallback: 4
};

const REQUIRED_SLOT_WEIGHT = 4;
const OPTIONAL_SLOT_WEIGHT = 2;

const DIAGNOSIS_RULE_SLOT_PROFILES: Partial<Record<string, DiagnosisRuleSlotProfile>> = {
  "backhand-into-net": {
    lane: "stroke_outcome",
    required: ["slot_stroke_backhand", "slot_outcome_net"]
  },
  "forehand-out": {
    lane: "stroke_outcome",
    required: ["slot_stroke_forehand", "slot_outcome_out"]
  },
  "first-serve-in": {
    lane: "stroke_outcome",
    required: ["slot_stroke_serve", "slot_outcome_miss_in"]
  },
  "second-serve-reliability": {
    lane: "stroke_outcome",
    required: ["slot_stroke_serve", "slot_outcome_double_fault"],
    optional: ["slot_context_pressure"]
  },
  "volley-floating": {
    lane: "stroke_outcome",
    required: ["slot_stroke_volley", "slot_outcome_float"]
  },
  "volley-into-net": {
    lane: "stroke_outcome",
    required: ["slot_stroke_volley", "slot_outcome_net"]
  },
  "volley-contact-instability": {
    lane: "stroke_outcome",
    required: ["slot_stroke_volley", "slot_outcome_dirty_contact"]
  },
  "half-volley-late-contact": {
    lane: "stroke_context",
    required: ["slot_stroke_half_volley"],
    optional: ["slot_outcome_pickup_fail", "slot_outcome_late_contact"]
  },
  "backhand-slice-floating": {
    lane: "stroke_outcome",
    required: ["slot_stroke_slice", "slot_outcome_float"],
    optional: ["slot_stroke_backhand"]
  },
  "slice-depth-control": {
    lane: "stroke_outcome",
    required: ["slot_stroke_slice", "slot_outcome_short"],
    optional: ["slot_outcome_float"]
  },
  "overhead-spacing": {
    lane: "stroke_context",
    required: ["slot_stroke_overhead"],
    optional: ["slot_outcome_late_contact"]
  },
  "running-forehand": {
    lane: "stroke_context",
    required: ["slot_stroke_forehand", "slot_context_movement"]
  },
  "running-backhand": {
    lane: "stroke_context",
    required: ["slot_stroke_backhand", "slot_context_movement"]
  },
  "on-the-run-late-contact": {
    lane: "stroke_context",
    required: ["slot_context_movement", "slot_outcome_late_contact"]
  },
  "recovery-delay": {
    lane: "physical_primary",
    required: ["slot_context_movement"]
  },
  "rally-consistency": {
    lane: "stroke_context",
    required: ["slot_context_rally"],
    optional: ["slot_outcome_net", "slot_outcome_out", "slot_context_movement"]
  },
  "incoming-slice-trouble": {
    lane: "stroke_context",
    required: ["slot_context_incoming_slice"],
    optional: ["slot_stroke_backhand"]
  },
  "moonball-trouble": {
    lane: "stroke_context",
    required: ["slot_context_incoming_moonball"],
    optional: ["slot_stroke_forehand", "slot_stroke_backhand"]
  },
  "doubles-positioning": {
    lane: "tactical_primary",
    required: ["slot_context_doubles"]
  },
  "doubles-poach-hesitation": {
    lane: "tactical_primary",
    required: ["slot_context_doubles", "slot_condition_hesitation"]
  },
  "doubles-formation-confusion": {
    lane: "tactical_primary",
    required: ["slot_context_doubles"]
  },
  "passive-point-construction": {
    lane: "tactical_primary"
  },
  "mobility-limit": {
    lane: "physical_primary",
    required: ["slot_condition_mobility_limit"]
  },
  "movement-slow": {
    lane: "none",
    optional: ["slot_context_movement"]
  },
  "pressure-tightness": {
    lane: "mental_fallback",
    required: ["slot_context_pressure"],
    optional: ["slot_condition_tight"]
  },
  "safe-short-collapse": {
    lane: "mental_fallback",
    required: ["slot_context_pressure", "slot_outcome_short"]
  },
  "key-point-indecision": {
    lane: "tactical_primary",
    required: ["slot_context_pressure", "slot_condition_hesitation"]
  },
  "match-anxiety": {
    lane: "mental_fallback",
    required: ["slot_context_pressure"]
  }
};

function buildUniqueSignalList<T extends string>(values: T[]): T[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function matchesAny(normalizedInput: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(normalizedInput));
}

function splitDiagnosisClauseAnchors(text: string): string[] {
  const trimmed = text.trim();

  if (!trimmed) return [];

  const anchoredSceneMatch = trimmed.match(/^(.+?)在(关键分的时候|关键分时|比赛的时候|比赛时|比赛里|跑动中)$/);

  if (anchoredSceneMatch) {
    return [anchoredSceneMatch[1].trim(), anchoredSceneMatch[2].trim()].filter(Boolean);
  }

  return [trimmed];
}

function splitDiagnosisClauses(input: string): DiagnosisClause[] {
  return input
    .split(DIAGNOSIS_CLAUSE_SPLITTER)
    .flatMap((text) => splitDiagnosisClauseAnchors(text))
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      text,
      normalizedText: normalizeDiagnosisInput(text)
    }));
}

function extractTriggerSignals(normalizedText: string): string[] {
  return buildUniqueSignalList(
    DIAGNOSIS_TRIGGER_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedText, patterns))
      .map(({ signal }) => signal)
  );
}

function buildLayeredSignals(
  clauses: DiagnosisClause[],
  aliases: DiagnosisAlias[],
  modifiers: DiagnosisModifier[],
  supportSignals: DiagnosisSupportSignal[],
  slots: DiagnosisSlot[]
): DiagnosisLayeredSignals {
  const slotSignals = new Set(slots.map((slot) => slot.signal));
  const primaryCandidates = buildUniqueSignalList(
    Object.entries(DIAGNOSIS_RULE_SLOT_PROFILES)
      .filter(([, profile]) => {
        if (!profile || profile.lane === "mental_fallback") return false;
        const requiredSignals = profile.required ?? [];
        return requiredSignals.length > 0 && requiredSignals.every((signal) => slotSignals.has(signal));
      })
      .map(([problemTag]) => problemTag)
  );

  const modifierAliases = aliases.filter((alias) => ["key_point", "moonball", "slice"].includes(alias));
  const triggers = buildUniqueSignalList(clauses.flatMap((clause) => extractTriggerSignals(clause.normalizedText)));

  return {
    primaryCandidates,
    modifiers: buildUniqueSignalList(
      [...modifierAliases, ...modifiers].filter((signal) => !supportSignals.includes(signal as DiagnosisSupportSignal))
    ),
    triggers
  };
}

function buildDiagnosisSlots(normalizedInput: string, aliases: DiagnosisAlias[]): DiagnosisSlot[] {
  const slotText = [normalizedInput, ...aliases].join(" ");

  return buildUniqueSignalList(
    DIAGNOSIS_SLOT_PATTERNS
      .filter(({ patterns }) => matchesAny(slotText, patterns))
      .map(({ type, value }) => `slot_${type}_${value}` as DiagnosisInternalSignal)
  ).map((signal) => {
    const [, type, ...valueParts] = signal.split("_");

    return {
      type: type as DiagnosisSlotType,
      value: valueParts.join("_"),
      signal
    };
  });
}

function buildSignalSegments(
  rawInput: string,
  aliases: DiagnosisAlias[],
  modifiers: DiagnosisModifier[],
  supportSignals: DiagnosisSupportSignal[],
  slots: DiagnosisSlot[]
): DiagnosisSignalSegment[] {
  const segments: DiagnosisSignalSegment[] = [{ source: "raw", value: rawInput }];

  for (const alias of aliases) {
    segments.push({ source: "alias", value: alias });
  }

  for (const modifier of modifiers) {
    segments.push({ source: "modifier", value: modifier });
  }

  for (const supportSignal of supportSignals) {
    segments.push({ source: "support", value: supportSignal });
  }

  for (const slot of slots) {
    segments.push({ source: "internal", value: slot.signal });
  }

  return segments;
}

function buildMatchableText(segments: DiagnosisSignalSegment[]): string {
  return segments
    .filter((segment) => segment.source === "raw" || segment.source === "alias" || segment.source === "modifier")
    .map((segment) => segment.value)
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function extractDiagnosisSignalBundle(input: string): DiagnosisSignalBundle {
  const normalizedInput = normalizeDiagnosisInput(input);
  const clauses = splitDiagnosisClauses(input);

  const aliases = buildUniqueSignalList(
    DIAGNOSIS_ALIAS_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedInput, patterns))
      .map(({ alias }) => alias)
  );

  const modifiers = buildUniqueSignalList(
    DIAGNOSIS_MODIFIER_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedInput, patterns))
      .map(({ modifier }) => modifier)
  );

  const supportSignals = buildUniqueSignalList(
    DIAGNOSIS_SUPPORT_SIGNAL_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedInput, patterns))
      .map(({ signal }) => signal)
  );
  const slots = buildDiagnosisSlots(normalizedInput, aliases);
  const internalSignals = slots.map((slot) => slot.signal);
  const layeredSignals = buildLayeredSignals(clauses, aliases, modifiers, supportSignals, slots);
  const segments = buildSignalSegments(normalizedInput, aliases, modifiers, supportSignals, slots);
  const matchableText = buildMatchableText(segments);

  return {
    rawInput: input,
    normalizedInput,
    matchableText,
    clauses,
    layeredSignals,
    segments,
    aliases,
    modifiers,
    supportSignals,
    slots,
    internalSignals
  };
}

export function getMatchableInput(input: string): DiagnosisSignalBundle {
  return extractDiagnosisSignalBundle(input);
}

export function normalizeDiagnosisInput(input: string): string {
  const lowered = input.toLowerCase();
  const typoNormalized = DIAGNOSIS_TYPO_NORMALIZATIONS.reduce(
    (value, entry) => value.replace(entry.pattern, entry.replacement),
    lowered
  );

  return typoNormalized
    .trim()
    .replace(/[，。！？、；：""''（）()【】\[\],.!?;:"'`~\-_/]+/g, " ")
    .replace(/\s+/g, " ");
}

export function getMatchedKeywords(input: string, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(getMatchableInput(input).matchableText);
  return rule.keywords.filter((keyword) => normalized.includes(normalizeDiagnosisInput(keyword)));
}

export function getMatchedSynonyms(input: string, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(getMatchableInput(input).matchableText);
  return (rule.synonyms ?? []).filter((phrase) => normalized.includes(normalizeDiagnosisInput(phrase)));
}

function getMatchedKeywordsFromBundle(signalBundle: DiagnosisSignalBundle, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(signalBundle.matchableText);
  return rule.keywords.filter((keyword) => normalized.includes(normalizeDiagnosisInput(keyword)));
}

function getMatchedSynonymsFromBundle(signalBundle: DiagnosisSignalBundle, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(signalBundle.matchableText);
  return (rule.synonyms ?? []).filter((phrase) => normalized.includes(normalizeDiagnosisInput(phrase)));
}

function getLexicalDiagnosisScore(rule: DiagnosisRule, matchedKeywords: string[], matchedSynonyms: string[]): number {
  if (matchedKeywords.length === 0 && matchedSynonyms.length === 0) return 0;

  const keywordScore = matchedKeywords.length * 10;
  const synonymScore = matchedSynonyms.length * 7;
  const allMatchedBonus = matchedKeywords.length === rule.keywords.length ? 3 : 0;

  return keywordScore + synonymScore + allMatchedBonus;
}

function scoreDiagnosisRuleSlots(rule: DiagnosisRule, slots: DiagnosisSlot[]) {
  const profile = DIAGNOSIS_RULE_SLOT_PROFILES[rule.problemTag];
  const slotSignals = new Set(slots.map((slot) => slot.signal));
  const requiredSignals = profile?.required ?? [];
  const optionalSignals = profile?.optional ?? [];
  const matchedRequired = requiredSignals.filter((signal) => slotSignals.has(signal));
  const matchedOptional = optionalSignals.filter((signal) => slotSignals.has(signal));
  const hasAllRequired = requiredSignals.length > 0 && matchedRequired.length === requiredSignals.length;
  const priorityWeight = hasAllRequired ? DIAGNOSIS_LANE_WEIGHTS[profile?.lane ?? "none"] : 0;
  const slotScore = matchedRequired.length * REQUIRED_SLOT_WEIGHT + matchedOptional.length * OPTIONAL_SLOT_WEIGHT;

  return {
    slotScore,
    priorityWeight
  };
}

function getLayeredPrimaryBonus(rule: DiagnosisRule, signalBundle: DiagnosisSignalBundle): number {
  if (signalBundle.layeredSignals.primaryCandidates.includes(rule.problemTag)) {
    return 4;
  }

  if (rule.problemTag === "pressure-tightness" && signalBundle.layeredSignals.modifiers.includes("tight")) {
    return signalBundle.layeredSignals.primaryCandidates.length === 0 ? 2 : 0;
  }

  return 0;
}

function getMatchedClauseCount(
  signalBundle: DiagnosisSignalBundle,
  matchedKeywords: string[],
  matchedSynonyms: string[]
): number {
  const lexicalTerms = buildUniqueSignalList([
    ...matchedKeywords,
    ...matchedSynonyms
  ])
    .map((term) => normalizeDiagnosisInput(term))
    .filter((term) => term.length >= 2);

  if (lexicalTerms.length === 0 || signalBundle.clauses.length === 0) {
    return 0;
  }

  return signalBundle.clauses.reduce((count, clause) => {
    return lexicalTerms.some((term) => clause.normalizedText.includes(term))
      ? count + 1
      : count;
  }, 0);
}

function getClauseCoverageBonus(
  signalBundle: DiagnosisSignalBundle,
  matchedKeywords: string[],
  matchedSynonyms: string[]
): { matchedClauseCount: number; clauseCoverageBonus: number } {
  const matchedClauseCount = getMatchedClauseCount(signalBundle, matchedKeywords, matchedSynonyms);
  const clauseCoverageBonus = matchedClauseCount <= 1
    ? 0
    : Math.min(3, matchedClauseCount - 1) * 2;

  return {
    matchedClauseCount,
    clauseCoverageBonus
  };
}

function getLaneConflictPenalty(rule: DiagnosisRule, signalBundle: DiagnosisSignalBundle): number {
  const lane = DIAGNOSIS_RULE_SLOT_PROFILES[rule.problemTag]?.lane;

  if (lane !== "mental_fallback") {
    return 0;
  }

  return signalBundle.layeredSignals.primaryCandidates.length > 0 ? 6 : 0;
}

function buildDiagnosisRuleCandidateFromBundle(
  signalBundle: DiagnosisSignalBundle,
  rule: DiagnosisRule
): DiagnosisRuleCandidate | null {
  const matchedKeywords = getMatchedKeywordsFromBundle(signalBundle, rule);
  const matchedSynonyms = getMatchedSynonymsFromBundle(signalBundle, rule);
  const lexicalScore = getLexicalDiagnosisScore(rule, matchedKeywords, matchedSynonyms);
  const slotProfile = DIAGNOSIS_RULE_SLOT_PROFILES[rule.problemTag];
  const requiredSignals = slotProfile?.required ?? [];
  const slotSignals = new Set(signalBundle.slots.map((slot) => slot.signal));
  const hasAllRequiredSignals =
    requiredSignals.length > 0 &&
    requiredSignals.every((signal) => slotSignals.has(signal));
  const { slotScore, priorityWeight } = scoreDiagnosisRuleSlots(rule, signalBundle.slots);
  const layeredPrimaryBonus = getLayeredPrimaryBonus(rule, signalBundle);
  const { matchedClauseCount, clauseCoverageBonus } = getClauseCoverageBonus(
    signalBundle,
    matchedKeywords,
    matchedSynonyms
  );
  const laneConflictPenalty = getLaneConflictPenalty(rule, signalBundle);

  if (lexicalScore <= 0 && !hasAllRequiredSignals && layeredPrimaryBonus <= 0) {
    return null;
  }

  if (slotProfile?.lane === "mental_fallback" && requiredSignals.length > 0 && !hasAllRequiredSignals) {
    return null;
  }

  const score =
    lexicalScore +
    slotScore +
    priorityWeight +
    layeredPrimaryBonus +
    clauseCoverageBonus -
    laneConflictPenalty;

  if (score <= 0 && !hasAllRequiredSignals) {
    return null;
  }

  return {
    rule,
    matchedKeywords,
    matchedSynonyms,
    lexicalScore,
    slotScore,
    priorityWeight,
    layeredPrimaryBonus,
    clauseCoverageBonus,
    matchedClauseCount,
    laneConflictPenalty,
    score
  };
}

function buildDiagnosisRuleCandidate(input: string, rule: DiagnosisRule): DiagnosisRuleCandidate | null {
  const signalBundle = extractDiagnosisSignalBundle(input);
  return buildDiagnosisRuleCandidateFromBundle(signalBundle, rule);
}

export function scoreDiagnosisRule(input: string, rule: DiagnosisRule): number {
  return buildDiagnosisRuleCandidate(input, rule)?.score ?? 0;
}

export function getDiagnosisConfidence(score: number): DiagnosisConfidence {
  if (score >= 24) return "较高";
  if (score >= 12) return "中等";
  return "较低";
}

export function getDiagnosisConfidenceLabel(confidence: DiagnosisConfidence, locale: "zh" | "en" = "zh"): string {
  return CONFIDENCE_MAP[confidence]?.[locale] ?? confidence;
}

export function findBestDiagnosisRule(
  input: string,
  rules: DiagnosisRule[] = diagnosisRules
): {
  rule: DiagnosisRule | null;
  matchedKeywords: string[];
  matchedSynonyms: string[];
  score: number;
} {
  const signalBundle = extractDiagnosisSignalBundle(input);
  let bestCandidate: DiagnosisRuleCandidate | null = null;

  for (const rule of rules) {
    const candidate = buildDiagnosisRuleCandidateFromBundle(signalBundle, rule);

    if (!candidate) {
      continue;
    }

    if (
      !bestCandidate ||
      candidate.score > bestCandidate.score ||
      (candidate.score === bestCandidate.score &&
        candidate.layeredPrimaryBonus > bestCandidate.layeredPrimaryBonus) ||
      (candidate.score === bestCandidate.score &&
        candidate.layeredPrimaryBonus === bestCandidate.layeredPrimaryBonus &&
        candidate.clauseCoverageBonus > bestCandidate.clauseCoverageBonus) ||
      (candidate.score === bestCandidate.score &&
        candidate.slotScore + candidate.priorityWeight > bestCandidate.slotScore + bestCandidate.priorityWeight) ||
      (candidate.score === bestCandidate.score &&
        candidate.slotScore + candidate.priorityWeight === bestCandidate.slotScore + bestCandidate.priorityWeight &&
        candidate.lexicalScore > bestCandidate.lexicalScore) ||
      (candidate.score === bestCandidate.score &&
        candidate.slotScore + candidate.priorityWeight === bestCandidate.slotScore + bestCandidate.priorityWeight &&
        candidate.lexicalScore === bestCandidate.lexicalScore &&
        candidate.matchedSynonyms.length > bestCandidate.matchedSynonyms.length)
    ) {
      bestCandidate = candidate;
    }
  }

  return {
    rule: bestCandidate?.rule ?? null,
    matchedKeywords: bestCandidate?.matchedKeywords ?? [],
    matchedSynonyms: bestCandidate?.matchedSynonyms ?? [],
    score: bestCandidate?.score ?? 0
  };
}

function scoreContentAgainstLevel(item: ContentItem, preferredLevels: string[], level?: string): number {
  if (!level) {
    return 0;
  }

  let score = 0;

  if (item.levels.includes(level)) {
    score += 4;
  }

  for (const preferredLevel of preferredLevels) {
    if (item.levels.includes(preferredLevel)) {
      score += 2;
    }
  }

  return score;
}

type DiagnosisRecommendationSignalBoost = {
  contentIds: string[];
  problemTags: ProblemTag[];
  skills: string[];
};

function overlapCount(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const rightSet = new Set(right);
  return left.reduce((count, value) => count + (rightSet.has(value) ? 1 : 0), 0);
}

function normalizeProblemTags(problemTags: ProblemTag[]): ProblemTag[] {
  const canonical = problemTags.flatMap((tag) => DIAGNOSIS_CONTENT_PROBLEM_TAG_ALIASES[tag] ?? []);
  return buildUniqueSignalList([...problemTags, ...(canonical as ProblemTag[])]);
}

function getNormalizedContentProblemTags(item: ContentItem): ProblemTag[] {
  return normalizeProblemTags(item.problemTags);
}

function getDiagnosisSignalBoost(signalBundle: DiagnosisSignalBundle): DiagnosisRecommendationSignalBoost {
  const contentIds: string[] = [];
  const problemTags: ProblemTag[] = [];
  const skills: string[] = [];

  const slotSignals = new Set(signalBundle.internalSignals);
  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;

  if (modifiers.includes("tight") || slotSignals.has("slot_context_pressure")) {
    contentIds.push("content_rb_03", "content_cn_f_02", "content_rb_02");
    problemTags.push("pressure-tightness", "match-anxiety", "return-under-pressure");
    skills.push("mental", "matchplay", "return");
  }

  if (triggers.includes("opponent_at_net") || triggers.includes("net_pressure")) {
    contentIds.push("content_rb_01", "content_rb_03", "content_rb_02");
    problemTags.push("net-confidence", "doubles-positioning", "volley-floating", "volley-into-net", "return-under-pressure");
    skills.push("net", "doubles", "matchplay");
  }

  if (slotSignals.has("slot_context_movement") || slotSignals.has("slot_condition_mobility_limit")) {
    contentIds.push("content_fr_02", "content_cn_c_02", "content_cn_a_03");
    problemTags.push("movement-slow", "late-contact", "mobility-limit");
    skills.push("movement", "footwork");
  }

  if (slotSignals.has("slot_context_rally")) {
    contentIds.push("content_fr_02", "content_fr_03", "content_fr_01");
    problemTags.push("rally-consistency", "balls-too-short", "late-contact");
    skills.push("consistency", "forehand", "backhand");
  }

  if (slotSignals.has("slot_context_incoming_slice")) {
    contentIds.push("content_fr_01", "content_fr_02");
    problemTags.push("incoming-slice-trouble", "backhand-slice-floating", "late-contact");
    skills.push("slice", "backhand", "movement");
  }

  if (slotSignals.has("slot_context_incoming_moonball")) {
    contentIds.push("content_fr_02", "content_rb_03");
    problemTags.push("moonball-trouble", "cant-hit-lob");
    skills.push("defense", "matchplay", "movement");
  }

  if (slotSignals.has("slot_context_doubles")) {
    contentIds.push("content_rb_01", "content_rb_03", "content_rb_02");
    problemTags.push("doubles-positioning", "net-confidence");
    skills.push("doubles", "net", "matchplay");
  }

  return {
    contentIds: buildUniqueSignalList(contentIds),
    problemTags: buildUniqueSignalList(problemTags),
    skills: buildUniqueSignalList(skills)
  };
}

function getDiagnosisContentSearchText(item: ContentItem): string {
  return [
    item.title,
    item.displayTitleEn,
    item.focusLineEn,
    item.summary,
    item.reason,
    item.coachReason,
    ...item.useCases
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function splitDiagnosisContentPools(contentPool: ContentItem[]) {
  return {
    curatedContentPool: contentPool.filter((item) => !EXPANDED_CONTENT_ID_SET.has(item.id)),
    expandedContentPool: contentPool.filter((item) => EXPANDED_CONTENT_ID_SET.has(item.id))
  };
}

type RankedDiagnosisContentCandidate = {
  item: ContentItem;
  index: number;
  score: number;
  seedIndex: number | undefined;
};

function selectDiagnosisRecommendationsWithDiversity(
  rankedCandidates: RankedDiagnosisContentCandidate[],
  maxRecommendations: number
): ContentItem[] {
  if (maxRecommendations <= 0 || rankedCandidates.length === 0) {
    return [];
  }

  const selected: RankedDiagnosisContentCandidate[] = [];
  const creatorUsageCounts = new Map<string, number>();
  const remaining = [...rankedCandidates];

  const first = remaining.shift();
  if (!first) {
    return [];
  }

  selected.push(first);
  creatorUsageCounts.set(first.item.creatorId, 1);

  while (selected.length < maxRecommendations && remaining.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const creatorRepeatCount = creatorUsageCounts.get(candidate.item.creatorId) ?? 0;
      const creatorPenalty = creatorRepeatCount * 14;
      const tagPenalty = selected.some((entry) => overlapCount(entry.item.problemTags, candidate.item.problemTags) >= 2)
        ? 4
        : 0;
      const adjustedScore = candidate.score - creatorPenalty - tagPenalty;
      const bestCandidate = remaining[bestIndex];

      if (
        adjustedScore > bestAdjustedScore ||
        (adjustedScore === bestAdjustedScore && candidate.score > bestCandidate.score) ||
        (adjustedScore === bestAdjustedScore && candidate.score === bestCandidate.score && candidate.index < bestCandidate.index)
      ) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    }

    const [picked] = remaining.splice(bestIndex, 1);
    selected.push(picked);
    creatorUsageCounts.set(
      picked.item.creatorId,
      (creatorUsageCounts.get(picked.item.creatorId) ?? 0) + 1
    );
  }

  return selected.map((entry) => entry.item);
}

function getDiagnosisRecommendedContents(input: {
  rule: DiagnosisRule;
  signalBundle: DiagnosisSignalBundle;
  seedContentIds: string[];
  preferredSeedContentIds?: string[];
  matchedKeywords: string[];
  matchedSynonyms: string[];
  contentPool: ContentItem[];
  maxRecommendations: number;
  level?: string;
  guidanceContext: NonNullable<DiagnosisResult["guidanceContext"]>;
}): ContentItem[] {
  const {
    rule,
    signalBundle,
    seedContentIds,
    preferredSeedContentIds,
    matchedKeywords,
    matchedSynonyms,
    contentPool,
    maxRecommendations,
    level,
    guidanceContext
  } = input;
  const { curatedContentPool, expandedContentPool } = splitDiagnosisContentPools(contentPool);

  const boost = getDiagnosisSignalBoost(signalBundle);
  const primarySeedIds = buildUniqueSignalList(seedContentIds);
  const preferredSeedIds = buildUniqueSignalList((preferredSeedContentIds ?? []).filter((id) => !primarySeedIds.includes(id)));
  const supportSeedIds = buildUniqueSignalList(boost.contentIds.filter((id) => !primarySeedIds.includes(id)));
  const seedIds = buildUniqueSignalList([...primarySeedIds, ...preferredSeedIds, ...supportSeedIds]);
  const seedItems = seedIds
    .map((id) => contentPool.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item));
  const seedProblemTags = buildUniqueSignalList([
    rule.problemTag,
    ...seedItems.flatMap((item) => getNormalizedContentProblemTags(item)),
    ...boost.problemTags
  ]);
  const seedSkills = buildUniqueSignalList([
    ...rule.category,
    ...seedItems.flatMap((item) => item.skills),
    ...boost.skills
  ]);
  const lexicalTerms = buildUniqueSignalList([
    ...matchedKeywords,
    ...matchedSynonyms,
    ...signalBundle.aliases,
    ...signalBundle.modifiers,
    ...signalBundle.layeredSignals.triggers,
    guidanceContext.trainingFocus,
    guidanceContext.planIntent.replace(/_/g, " "),
    guidanceContext.strokeFamily,
    guidanceContext.mechanismFamily
  ])
    .map((term) => normalizeDiagnosisInput(term))
    .filter((term) => term.length >= 3);

  return recommendAttachedVideos({
    source: "diagnosis",
    guidanceContext,
    contentPool: curatedContentPool,
    expandedContentPool,
    maxResults: maxRecommendations,
    requiredIds: primarySeedIds,
    preferredIds: seedIds,
    supportIds: supportSeedIds,
    lexicalTerms: buildUniqueSignalList([
      ...lexicalTerms,
      ...seedProblemTags,
      ...seedSkills
    ])
  }).map((entry) => entry.item);
}

function prioritizeContentsByLevel(
  items: ContentItem[],
  maxRecommendations: number,
  level?: string
): ContentItem[] {
  if (!level) {
    return items.slice(0, maxRecommendations);
  }

  const preferredLevels = LEVEL_PREFERENCE_MAP[level] ?? [level];

  return items
    .map((item, index) => ({
      item,
      index,
      score: scoreContentAgainstLevel(item, preferredLevels, level)
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.index - b.index;
    })
    .map(({ item }) => item)
    .slice(0, maxRecommendations);
}

function getGenericFallbackContents(
  contentPool: ContentItem[] = ALL_DIAGNOSIS_CONTENTS,
  maxRecommendations = 3,
  level?: string
): ContentItem[] {
  return retrieveCatalogContentsByIds({
    ids: DEFAULT_CONTENT_IDS,
    contentPool,
    maxResults: maxRecommendations,
    level
  });
}

function getWeakestAssessmentDimension(assessmentResult?: AssessmentResult | null) {
  if (!assessmentResult?.profileVector) {
    return null;
  }

  const primaryWeakness = assessmentResult.profileVector.primaryWeakness
    ?? assessmentResult.profileVector.weakDimensions[0]
    ?? assessmentResult.dimensionSummaries[0]?.key;

  if (!primaryWeakness) {
    return null;
  }

  return { key: primaryWeakness };
}

export function getContentsByIds(
  ids: string[],
  contentPool: ContentItem[] = ALL_DIAGNOSIS_CONTENTS,
  maxRecommendations = 3,
  level?: string
): ContentItem[] {
  return retrieveCatalogContentsByIds({
    ids,
    contentPool,
    maxResults: maxRecommendations,
    level
  });
}

export function getFallbackContents(
  _input: string,
  contentPool: ContentItem[] = ALL_DIAGNOSIS_CONTENTS,
  maxRecommendations = 3,
  level?: string,
  assessmentResult?: AssessmentResult | null
): ContentItem[] {
  const weakestDimension = getWeakestAssessmentDimension(assessmentResult);

  if (weakestDimension) {
    const hints = ASSESSMENT_DIMENSION_HINTS[weakestDimension.key];
    const candidates = retrieveCatalogRecommendations({
      source: "diagnosis",
      contentPool,
      problemTags: hints.problemTags,
      skillCategories: hints.skills,
      level,
      maxResults: maxRecommendations
    });

    if (candidates.length > 0) {
      return candidates;
    }
  }

  return getGenericFallbackContents(contentPool, maxRecommendations, level);
}

export function getDiagnosisTitle(problemTag: string, locale: "zh" | "en" = "zh"): string {
  const map = locale === "en" ? TITLE_MAP_EN : TITLE_MAP_ZH;
  const fallbackMap = locale === "en" ? TITLE_MAP_EN : TITLE_MAP_ZH;
  return map[problemTag] ?? fallbackMap[DEFAULT_PROBLEM_TAG] ?? problemTag;
}

function buildModifierAwareTitle(
  problemTag: string,
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en" = "zh"
): string {
  const baseTitle = getDiagnosisTitle(problemTag, locale);
  const modifiers = signalBundle.layeredSignals.modifiers;

  if (problemTag === "forehand-out" && modifiers.includes("key_point")) {
    return locale === "en" ? "Forehand errors show up more on key points" : "关键分下的正手出界更明显";
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    return locale === "en" ? "Second serve gets shakier on key points" : "关键分下二发更容易失稳";
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    return locale === "en" ? "Moonballs keep disrupting your timing" : "月亮球来球会明显打乱你的节奏";
  }

  return baseTitle;
}

function buildModifierAwareFixes(
  problemTag: string,
  fixes: string[],
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en" = "zh"
): string[] {
  if (fixes.length === 0) {
    return fixes;
  }

  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    const override =
      locale === "en"
        ? "When you see the opponent at net on a key point, play the forehand higher and deeper first — do not chase the winner immediately."
        : "关键分看到对手在网前时，先把正手打高一点、深一点，不要先追求一拍穿越。";

    return [override, ...fixes.slice(1)];
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    const override =
      locale === "en"
        ? "On key points, make the second serve your safest spin serve first — start by getting it in before adding pace."
        : "关键分时，把二发先当成最安全的上旋二发来发，先求进区，再谈球速。";

    return [override, ...fixes.slice(1)];
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    const override =
      locale === "en"
        ? "Shrink the movement radius first and protect the first recovery step instead of trying to cover every ball at full speed."
        : "先缩小移动半径，优先保住第一步和恢复步，不要一上来就想把所有球都全速追到。";

    return [override, ...fixes.slice(1)];
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    const override =
      locale === "en"
        ? "Read the landing spot earlier and decide sooner whether to back up or take the moonball on the rise."
        : "先更早判断月亮球的落点，再早点决定是后退让位还是上升期处理。";

    return [override, ...fixes.slice(1)];
  }

  return fixes;
}

function buildModifierAwareCauses(
  problemTag: string,
  causes: string[],
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en" = "zh"
): string[] {
  if (causes.length === 0) {
    return causes;
  }

  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    const override =
      locale === "en"
        ? "On key points with the opponent at net, your attention shifts to not missing, which flattens the swing path and makes forehands fly long."
        : "关键分且对手在网前时，你会把注意力放在“别失误”上，挥拍路径容易变平，正手更容易飞出底线。";

    return [override, ...causes.slice(1)];
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    const override =
      locale === "en"
        ? "On key points, fear of double faults can turn the second serve into a protective push, so toss rhythm and spin shape break down first."
        : "关键分怕双误时，二发容易变成保护性推送，抛球节奏和旋转形状会先散掉。";

    return [override, ...causes.slice(1)];
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    const override =
      locale === "en"
        ? "Age-related recovery speed loss makes the second and third movement steps harder, so position breaks after the first chase."
        : "年龄带来的恢复速度下降，会让第二步和第三步更吃力，因此第一拍追到后更容易失位。";

    return [override, ...causes.slice(1)];
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    const override =
      locale === "en"
        ? "Moonballs disrupt spacing decisions first; once that decision is late, contact timing breaks before swing mechanics do."
        : "月亮球会先打乱你的站位选择；一旦站位决策偏晚，击球时机会先于动作本身失控。";

    return [override, ...causes.slice(1)];
  }

  return causes;
}

function buildModifierAwareDrills(
  problemTag: string,
  drills: string[],
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en" = "zh"
): string[] {
  if (drills.length === 0) {
    return drills;
  }

  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    const override =
      locale === "en"
        ? "12-minute key-point plus opponent-at-net simulation: forehand must go high and deep through the middle before any aggressive change."
        : "12 分钟关键分+对手上网模拟：正手先打高弧线中路深球，再考虑变线压制。";

    return [override, ...drills.slice(1)];
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    const override =
      locale === "en"
        ? "12 key-point second-serve sequences: one reset breath plus one cue, then serve to a safe target before adding pace."
        : "关键分二发 12 组：每组先做一次呼吸重置并重复口令，先把安全目标区发进再加速。";

    return [override, ...drills.slice(1)];
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    const override =
      locale === "en"
        ? "8 sets of 20 seconds move plus 40 seconds reset: track only first-step initiation and one clean recovery step."
        : "20 秒移动 + 40 秒恢复，共 8 组：每组只盯第一步启动和一次干净回位。";

    return [override, ...drills.slice(1)];
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    const override =
      locale === "en"
        ? "15 moonball reads: call bounce depth first, then decide rise-or-drop contact before swinging."
        : "月亮球判断 15 次：先报落点深浅，再决定上升期或下降期处理后再出手。";

    return [override, ...drills.slice(1)];
  }

  return drills;
}

function buildModifierAwareRecommendedContentIds(
  problemTag: string,
  baseContentIds: string[],
  signalBundle: DiagnosisSignalBundle
): string[] {
  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;
  const extraContentIds: string[] = [];

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    extraContentIds.push("content_rb_03", "content_cn_f_01");
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    extraContentIds.push("content_cn_e_02", "content_cn_f_01");
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    extraContentIds.push("content_fr_02");
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    extraContentIds.push("content_common_01");
  }

  if (extraContentIds.length === 0) {
    return baseContentIds;
  }

  const [first, ...rest] = baseContentIds;

  return buildUniqueSignalList([first, ...extraContentIds, ...rest].filter(Boolean));
}

export function buildDiagnosisSummary(
  causes: string[],
  fixes: string[],
  fallbackUsed = false,
  locale: "zh" | "en" = "zh",
  problemTag?: string,
  signalBundle?: DiagnosisSignalBundle
): string {
  if (fallbackUsed) return locale === "en" ? DEFAULT_SUMMARY_EN : DEFAULT_SUMMARY;

  const modifiers = signalBundle?.layeredSignals.modifiers ?? [];
  const triggers = signalBundle?.layeredSignals.triggers ?? [];

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    if (locale === "en") {
      return "Your main issue is still the forehand flying long, but it shows up more on key points when the opponent is at net because pressure makes it easier to overhit and rush the finish.";
    }

    return "你的主问题还是正手发力后容易出界，但它在关键分、对手来到网前时会更明显，因为人一紧就更容易着急发力，把球打飞。";
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    if (locale === "en") {
      return "Your main issue is still second-serve reliability, but it shows up more clearly on key points because tension makes you protect the serve and lose your usual rhythm.";
    }

    return "你的主问题还是二发稳定性不足，但它在关键分时会更明显，因为一紧张就容易缩手缩脚，原本的发球节奏先散掉。";
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    if (locale === "en") {
      return "The main issue is still mobility and court coverage, but age and recovery speed now make wide balls and second movements harder to handle cleanly.";
    }

    return "你的主问题还是移动范围和到位能力受限，而且年纪上来以后，左右追球和连续恢复会更吃力，所以场地一拉开就更容易失位。";
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    if (locale === "en") {
      return "Your main issue is handling moonballs and other high looping balls because they disrupt your spacing and timing before you decide whether to move back or take them early.";
    }

    return "你的主问题还是月亮球来球处理不顺，因为这类高吊球会先打乱你的站位和节奏，让你来不及决定是后退让位还是提前上升期处理。";
  }

  const cause = causes[0] ?? (locale === "en" ? "preparation and timing need clearer structure" : "准备和节奏上还需要更清晰的定位");
  const fix = fixes[0] ?? (locale === "en" ? "narrow the problem to a specific action" : "先把问题缩小到一个更具体的动作点");

  if (locale === "en") {
    return `The most important thing right now is not to fix everything at once, but to work on "${cause}" first. Start with: "${fix}".`;
  }

  return `你现在最值得先改的，不是一次性解决所有问题，而是先围绕"${cause}"去处理。建议先从"${fix}"开始。`;
}

function selectRuleContent(rule: DiagnosisRule, locale: "zh" | "en") {
  if (locale === "en") {
    return {
      causes: rule.causes_en ?? rule.causes,
      fixes: rule.fixes_en ?? rule.fixes,
      drills: rule.drills_en ?? rule.drills
    };
  }

  return {
    causes: rule.causes,
    fixes: rule.fixes,
    drills: rule.drills
  };
}

function getSupportAwareFallbackContentIds(supportSignals: DiagnosisSupportSignal[]) {
  return buildUniqueSignalList(supportSignals.flatMap((signal) => SUPPORT_SIGNAL_CONTENT_IDS[signal] ?? []));
}

function getSupportAwareFallbackCopy(
  supportSignals: DiagnosisSupportSignal[],
  locale: "zh" | "en"
): Pick<DiagnosisResult, "title" | "summary" | "causes" | "fixes" | "drills"> | null {
  const hasCantSelfPractice = supportSignals.includes("cant_self_practice");
  const hasPlateau = supportSignals.includes("plateau_no_progress");

  if (!hasCantSelfPractice && !hasPlateau) {
    return null;
  }

  if (locale === "en") {
    if (hasCantSelfPractice && hasPlateau) {
      return {
        title: "Let's narrow the training focus before adding more volume",
        summary: "Your description sounds more like a planning/support issue than a single stroke diagnosis. Start by shrinking the focus to one priority and using a clearer solo-practice structure.",
        causes: ["Too many goals are competing for attention", "Practice structure is not clear enough to guide the next session", "Without one main metric, it is hard to feel progress"],
        fixes: ["Pick one issue to train for the next week", "Use a simple solo-practice template instead of improvising", "Track one metric per session so progress is visible"],
        drills: ["Write down one training priority for this week", "Build one 20-30 minute solo-practice block", "Record one success-rate metric after each practice"]
      };
    }

    if (hasCantSelfPractice) {
      return {
        title: "Let's build a clearer self-practice structure first",
        summary: "This sounds more like a practice-planning gap than a single stroke issue. Start with a simple structure you can repeat on your own.",
        causes: ["Practice sessions do not have one clear target", "The next session is being improvised from scratch", "Solo training does not have a repeatable structure yet"],
        fixes: ["Choose one goal for each session", "Use a fixed 20-30 minute practice template", "Track one item after every practice"],
        drills: ["Write one goal and one tracking item before practice", "Run one simple 20-minute solo session", "Review the result in one sentence afterward"]
      };
    }

    return {
      title: "Let's shrink the focus before trying to fix everything",
      summary: "This sounds more like a plateau or focus issue than a single technical diagnosis. Start by reducing the number of things you are trying to change at once.",
      causes: ["Too many changes are being attempted at the same time", "There is no single match problem guiding practice", "Progress is hard to notice without one stable metric"],
      fixes: ["Pick one priority for the next week", "Use match mistakes to choose the next practice focus", "Track one stable metric across sessions"],
      drills: ["Write down one main issue for the week", "Track one repeated error after practice", "Keep the next three sessions focused on the same problem"]
    };
  }

  if (hasCantSelfPractice && hasPlateau) {
    return {
      title: "先把训练重点和自练结构理顺",
      summary: "你的描述更像训练规划支持问题，而不是单一技术动作。先把训练目标缩到一个主问题，再用更清楚的自练结构去执行。",
      causes: ["训练目标太多，注意力被分散", "每次练习缺少清楚结构，很难承接到下一次", "没有固定记录项时，进步很难被看见"],
      fixes: ["接下来一周只选一个主问题", "先用简单固定的自练模版，而不是每次临场想", "每次训练只记录一个指标"],
      drills: ["写下本周唯一主问题", "安排一组 20-30 分钟自练模版", "训练后只记录一个成功率指标"]
    };
  }

  if (hasCantSelfPractice) {
    return {
      title: "先把自练结构搭起来",
      summary: "你的描述更像训练规划缺口，而不是单一技术问题。先建立一个能重复执行的自练结构。",
      causes: ["每次练习没有单一目标", "下一次训练总是从零开始想", "自练缺少稳定模版"],
      fixes: ["每次训练只保留一个目标", "固定 20-30 分钟的小模版", "训练后记录一项结果"],
      drills: ["训练前写 1 个目标和 1 个记录项", "完成一组 20 分钟自练", "训练后写一句复盘"]
    };
  }

  return {
    title: "先把训练重点缩小到一个主问题",
    summary: "你的描述更像平台期或训练聚焦问题，而不是单一技术动作。先减少同时改动的事情，重新建立连续反馈。",
    causes: ["同一阶段想改的问题太多", "练习没有被比赛里最常见的失误牵引", "没有稳定指标时很难感受到进步"],
    fixes: ["接下来一周只围绕一个重点训练", "用比赛里最常见失误决定训练主题", "连续几次训练都记录同一个指标"],
    drills: ["写下本周唯一主问题", "训练后记录一个重复失误", "连续 3 次训练保持同一重点"]
  };
}

function getDiagnosisEvidenceLevel(score: number): DiagnosisEvidenceLevel {
  if (score >= 24) return "high";
  if (score >= 12) return "medium";
  return "low";
}

function shouldExposeDiagnosisRecommendations(evidenceLevel: DiagnosisEvidenceLevel): boolean {
  return evidenceLevel !== "low";
}

function getNarrowingSeverityRank(severity: DiagnosisNarrowingSuggestion["severity"]): number {
  if (severity === "high") {
    return 3;
  }

  if (severity === "medium") {
    return 2;
  }

  return 1;
}

function buildNarrowingSuggestions(
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en"
): DiagnosisNarrowingSuggestion[] {
  const suggestions: DiagnosisNarrowingSuggestion[] = [];
  const slotTypes = new Set(signalBundle.slots.map((slot) => slot.type));
  const hasPlanningSignals = signalBundle.supportSignals.some((signal) =>
    signal === "cant_self_practice" || signal === "plateau_no_progress"
  );

  if (hasPlanningSignals) {
    suggestions.push({
      id: "narrowing-focus-target",
      severity: "medium",
      reason: locale === "en"
        ? "Your input sounds broad and planning-heavy, so we still need one concrete court problem to route training."
        : "你的描述偏训练规划和泛化感受，仍缺一个可执行的场上主问题。",
      nextAction: locale === "en"
        ? "Name one repeated match error from your last 2-3 sessions so we can lock a single training target."
        : "先说最近 2-3 次里最重复的一种比赛失误，我们先锁定一个训练主目标。"
    });
  }

  if (!slotTypes.has("stroke")) {
    suggestions.push({
      id: "narrowing-stroke-missing",
      severity: "high",
      reason: locale === "en"
        ? "The affected stroke is missing, so we cannot map this to one stable diagnosis lane yet."
        : "当前缺少受影响的技术环节，系统还无法稳定进入单一路由。",
      nextAction: locale === "en"
        ? "Which stroke is affected most right now: forehand, backhand, serve, volley, or movement?"
        : "先补一句主要是哪个环节：正手、反手、发球、网前还是脚步？"
    });
  }

  if (!slotTypes.has("outcome")) {
    suggestions.push({
      id: "narrowing-outcome-missing",
      severity: "high",
      reason: locale === "en"
        ? "Without a miss outcome, we cannot judge whether to prioritize timing, spacing, or control first."
        : "缺少失误结果时，系统无法判断该优先收紧时机、站位还是控制。",
      nextAction: locale === "en"
        ? "What is the most frequent miss outcome: into the net, long, no depth, or serve not going in?"
        : "再补一句最常见结果：下网、出界、没深度，还是发不进？"
    });
  }

  if (!hasSpecificContextCues(signalBundle.rawInput)) {
    suggestions.push({
      id: "narrowing-context-missing",
      severity: "medium",
      reason: locale === "en"
        ? "The match context is still vague, so we cannot choose one actionable scenario for immediate practice."
        : "问题场景还不够具体，暂时无法直接落到一个可执行训练场景。",
      nextAction: locale === "en"
        ? "Add one specific context where this gets worse (e.g. key points, under pressure, opponent at net, while moving)."
        : "再补一个更容易出问题的场景（如关键分、对手上网、跑动中）。"
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "narrowing-generic",
      severity: "low",
      reason: locale === "en"
        ? "Current evidence is still not strong enough for confident routing."
        : "当前证据仍不足以做高置信路由判断。",
      nextAction: locale === "en"
        ? "Rewrite this in one sentence with stroke + miss outcome + situation so we can narrow it first."
        : "请用“技术环节 + 失误结果 + 场景”重说一句，我们先把问题收窄。"
    });
  }

  return suggestions
    .sort((left, right) => getNarrowingSeverityRank(right.severity) - getNarrowingSeverityRank(left.severity))
    .slice(0, 3);
}

function buildNarrowingPrompts(suggestions: DiagnosisNarrowingSuggestion[]): string[] {
  return buildUniqueSignalList(suggestions.map((item) => item.nextAction)).slice(0, 2);
}

function buildRefusalMetadata(options: {
  needsNarrowing: boolean;
  score: number;
  signalBundle: DiagnosisSignalBundle;
}): {
  refusalReasonCodes: DiagnosisRefusalReasonCode[];
  missingEvidenceSlots: DiagnosisSlotType[];
} {
  const { needsNarrowing, score, signalBundle } = options;

  if (!needsNarrowing) {
    return {
      refusalReasonCodes: [],
      missingEvidenceSlots: []
    };
  }

  const slotTypes = new Set(signalBundle.slots.map((slot) => slot.type));
  const requiredSlots: DiagnosisSlotType[] = ["stroke", "outcome", "context"];
  const missingEvidenceSlots: DiagnosisSlotType[] = requiredSlots.filter(
    (slotType) => !slotTypes.has(slotType)
  );
  const refusalReasonCodes: DiagnosisRefusalReasonCode[] = [];

  if (missingEvidenceSlots.includes("stroke")) {
    refusalReasonCodes.push("missing_stroke");
  }

  if (missingEvidenceSlots.includes("outcome")) {
    refusalReasonCodes.push("missing_outcome");
  }

  if (missingEvidenceSlots.includes("context")) {
    refusalReasonCodes.push("missing_context");
  }

  if (score < 12) {
    refusalReasonCodes.push("low_match_score");
  }

  return {
    refusalReasonCodes: buildUniqueSignalList(refusalReasonCodes) as DiagnosisRefusalReasonCode[],
    missingEvidenceSlots
  };
}

function resolvePrimaryNextStep(
  options: {
    needsNarrowing: boolean;
    narrowingPrompts: string[];
    narrowingSuggestions: DiagnosisNarrowingSuggestion[];
    fixes: string[];
    summary: string;
    locale: "zh" | "en";
  }
): string {
  const { needsNarrowing, narrowingPrompts, narrowingSuggestions, fixes, summary, locale } = options;

  if (needsNarrowing) {
    return narrowingSuggestions[0]?.nextAction ??
      narrowingPrompts[0] ??
      (locale === "en"
        ? "Add one specific scenario first, then we will lock one next practice step."
        : "先补一个具体场景，我们再锁定单一下一步训练动作。");
  }

  return fixes[0] ?? summary;
}

function applyEffortModePayload(options: {
  effortMode: DiagnosisEffortMode;
  needsNarrowing: boolean;
  summary: string;
  causes: string[];
  fixes: string[];
  drills: string[];
  locale: "zh" | "en";
}): {
  summary: string;
  causes: string[];
  fixes: string[];
  drills: string[];
} {
  const {
    effortMode,
    needsNarrowing,
    summary,
    causes,
    fixes,
    drills,
    locale
  } = options;

  if (effortMode === "quick") {
    return {
      summary: needsNarrowing
        ? (locale === "en"
          ? "Evidence is still limited. Add one clear stroke + miss + situation before we diagnose further."
          : "当前证据还不够。先补充“技术环节 + 失误结果 + 场景”，再继续诊断。")
        : summary,
      causes: causes.slice(0, 1),
      fixes: fixes.slice(0, 1),
      drills: drills.slice(0, 1)
    };
  }

  if (effortMode === "deep") {
    return {
      summary,
      causes: causes.slice(0, 3),
      fixes: fixes.slice(0, 2),
      drills: drills.slice(0, 3)
    };
  }

  return {
    summary,
    causes: causes.slice(0, 2),
    fixes: fixes.slice(0, 1),
    drills: drills.slice(0, 2)
  };
}

function clampToChars(input: string, maxChars: number): string {
  if (maxChars <= 0) {
    return "";
  }

  const chars = Array.from(input.trim());
  if (chars.length <= maxChars) {
    return input.trim();
  }

  if (maxChars <= 1) {
    return "…";
  }

  return `${chars.slice(0, maxChars - 1).join("")}…`;
}

function getSummaryCharBudget(locale: "zh" | "en", effortMode: DiagnosisEffortMode): number {
  if (effortMode === "quick") {
    return QUICK_SUMMARY_CHAR_BUDGET[locale];
  }

  return SUMMARY_CHAR_BUDGET[locale];
}

function buildBudgetSummaryFromFix(fixes: string[], locale: "zh" | "en"): string {
  const firstFix = clampToChars(fixes[0] ?? "", SUMMARY_FIX_CHAR_BUDGET[locale]);

  if (locale === "en") {
    if (firstFix) {
      return `Primary next step: ${firstFix}.`;
    }

    return "Primary next step: start with one clear technical action and refine after feedback.";
  }

  if (firstFix) {
    return `先做主动作：${firstFix}。`;
  }

  return "先做一个明确主动作，再根据反馈细化。";
}

function applySummaryBudget(options: {
  summary: string;
  fixes: string[];
  locale: "zh" | "en";
  effortMode: DiagnosisEffortMode;
}): {
  summary: string;
  detailedSummary: string | null;
} {
  const { summary, fixes, locale, effortMode } = options;
  const normalizedSummary = summary.trim();
  const budget = getSummaryCharBudget(locale, effortMode);

  if (Array.from(normalizedSummary).length <= budget) {
    return {
      summary: normalizedSummary,
      detailedSummary: null
    };
  }

  const shortSummary = clampToChars(buildBudgetSummaryFromFix(fixes, locale), budget);

  return {
    summary: shortSummary,
    detailedSummary: normalizedSummary
  };
}

function applyEvidenceCalibratedNarrative(options: {
  evidenceLevel: DiagnosisEvidenceLevel;
  title: string;
  summary: string;
  locale: "zh" | "en";
}): {
  title: string;
  summary: string;
} {
  const {
    evidenceLevel,
    title,
    summary,
    locale
  } = options;

  if (evidenceLevel === "low") {
    if (locale === "en") {
      return {
        title: "Collect one more clue before locking the diagnosis",
        summary: `Current signals point toward "${title}", but evidence is still low. Add stroke + miss outcome + situation first, then we will lock one confident training route.`
      };
    }

    return {
      title: "先补一条关键线索，再锁定诊断",
      summary: `当前更接近“${title}”方向，但证据仍偏弱。先补“技术环节 + 失误结果 + 场景”后，我们再锁定高置信训练路线。`
    };
  }
  return {
    title,
    summary
  };
}

function getSkillCategoryLabel(skillCategory: string, locale: "zh" | "en") {
  if (locale === "en") {
    if (skillCategory === "serve") return "serve";
    if (skillCategory === "return") return "return";
    if (skillCategory === "groundstroke_set" || skillCategory === "groundstroke_on_move") return "groundstroke";
    if (skillCategory === "volley") return "volley";
    if (skillCategory === "overhead") return "overhead";
    if (skillCategory === "slice") return "slice";
    if (skillCategory === "contextual_match_situation") return "match-context";
    return "current scene";
  }

  if (skillCategory === "serve") return "发球";
  if (skillCategory === "return") return "接发";
  if (skillCategory === "groundstroke_set" || skillCategory === "groundstroke_on_move") return "底线击球";
  if (skillCategory === "volley") return "截击";
  if (skillCategory === "overhead") return "高压";
  if (skillCategory === "slice") return "切削";
  if (skillCategory === "contextual_match_situation") return "比赛场景";
  return "当前场景";
}

function buildCategoryConflictDiagnosisResult(input: {
  rawInput: string;
  normalizedInput: string;
  locale: "zh" | "en";
  effortMode: DiagnosisEffortMode;
  level?: string;
  handoff: NonNullable<DiagnoseOptions["deepHandoff"]>;
  reason: string;
}): DiagnosisResult {
  const label = getSkillCategoryLabel(input.handoff.skillCategory, input.locale);
  const title = input.locale === "en"
    ? `Stay inside the ${label} lane before locking the diagnosis`
    : `先沿${label}这条线继续收窄，再锁定诊断`;
  const summary = input.locale === "en"
    ? `Deep Mode grounded this as a ${label} scene, but the downstream rule match did not stay in that lane. Add one more ${label}-specific clue instead of jumping categories.`
    : `场景还原已经把问题收在“${label}”这一类，但下游规则匹配没有稳定留在这条线上。先补一条更具体的${label}线索，不要跨类跳转。`;

  return {
    input: input.rawInput,
    normalizedInput: input.normalizedInput,
    matchedRuleId: null,
    matchedKeywords: [],
    matchedSynonyms: [],
    matchScore: 0,
    confidence: "较低",
    effortMode: input.effortMode,
    evidenceLevel: "low",
    needsNarrowing: true,
    narrowingPrompts: input.locale === "en"
      ? [`Add one more ${label}-specific clue before continuing.`]
      : [`先补一条更具体的${label}线索。`],
    narrowingSuggestions: [{
      id: "category-conflict",
      severity: "high",
      reason: input.reason,
      nextAction: input.locale === "en"
        ? `Keep the next clue inside the ${label} lane.`
        : `下一条线索继续沿${label}这条线补。`
    }],
    refusalReasonCodes: [],
    missingEvidenceSlots: [],
    primaryNextStep: input.locale === "en"
      ? `Continue narrowing the ${label} scene.`
      : `继续收窄${label}场景。`,
    problemTag: DEFAULT_PROBLEM_TAG,
    category: [input.handoff.skillCategory],
    title,
    summary,
    detailedSummary: null,
    causes: input.locale === "en"
      ? ["Deep Mode and downstream diagnosis did not agree on the same skill lane."]
      : ["Deep Mode 和下游诊断没有稳定落在同一技术类别。"],
    fixes: input.locale === "en"
      ? [`Add one more ${label}-specific clue before diagnosing again.`]
      : [`再补一条更具体的${label}线索后再继续诊断。`],
    drills: [],
    recommendedContents: [],
    searchQueries: null,
    fallbackUsed: true,
    fallbackMode: null,
    level: input.level,
    categoryConsistency: "conflict",
    categoryConflict: buildDiagnosisCategoryConflict({
      handoff: input.handoff,
      rule: null,
      reason: input.reason
    })
  };
}

export function diagnoseProblem(input: string, options: DiagnoseOptions = {}): DiagnosisResult {
  const {
    level,
    assessmentResult,
    maxRecommendations = 3,
    rules = diagnosisRules,
    contentPool = ALL_DIAGNOSIS_CONTENTS,
    effortMode = "standard",
    locale = "zh",
    environment = "production",
    deepHandoff = null
  } = options;
  const activeRules = filterByEnvironment(rules, environment);
  const eligibleContentPool = filterByEnvironment(contentPool, environment);
  const categoryGate = buildDiagnosisCategoryGate(deepHandoff);
  const gatedRules = categoryGate
    ? activeRules.filter((rule) => ruleMatchesDiagnosisCategoryGate(rule, categoryGate))
    : activeRules;

  const signalBundle = extractDiagnosisSignalBundle(input);
  const normalizedInput = signalBundle.normalizedInput;

  if (!normalizedInput) {
    return getDefaultDiagnosisResult(level, eligibleContentPool, maxRecommendations, locale);
  }

  if (categoryGate && gatedRules.length === 0 && deepHandoff) {
    return buildCategoryConflictDiagnosisResult({
      rawInput: input,
      normalizedInput,
      locale,
      effortMode,
      level,
      handoff: deepHandoff,
      reason: locale === "en"
        ? "No diagnosis rules remained after applying the Deep Mode category gate."
        : "应用 Deep Mode 类别约束后，没有留下可用的诊断规则。"
    });
  }

  const { rule, matchedKeywords, matchedSynonyms, score } = findBestDiagnosisRule(input, gatedRules.length > 0 ? gatedRules : activeRules);

  if (!rule || score <= 0) {
    const supportAwareCopy = getSupportAwareFallbackCopy(signalBundle.supportSignals, locale);
    const supportContentIds = getSupportAwareFallbackContentIds(signalBundle.supportSignals);
    const fallbackMode = assessmentResult ? "assessment" : "no-assessment";

    const supportContents = getContentsByIds(supportContentIds, eligibleContentPool, maxRecommendations, level);
    const defCauses = supportAwareCopy?.causes ?? (locale === "en" ? DEFAULT_CAUSES_EN : DEFAULT_CAUSES);
    const defFixes = supportAwareCopy?.fixes ?? (locale === "en" ? DEFAULT_FIXES_EN : DEFAULT_FIXES);
    const defDrills = supportAwareCopy?.drills ?? (locale === "en" ? DEFAULT_DRILLS_EN : DEFAULT_DRILLS);
    const evidenceLevel = getDiagnosisEvidenceLevel(score);
    const allowRecommendations = shouldExposeDiagnosisRecommendations(evidenceLevel);
    const needsNarrowing = evidenceLevel === "low";
    const narrowingSuggestions = needsNarrowing ? buildNarrowingSuggestions(signalBundle, locale) : [];
    const narrowingPrompts = buildNarrowingPrompts(narrowingSuggestions);
    const refusalMetadata = buildRefusalMetadata({
      needsNarrowing,
      score,
      signalBundle
    });
    const primaryNextStep = resolvePrimaryNextStep({
      needsNarrowing,
      narrowingPrompts,
      narrowingSuggestions,
      fixes: defFixes,
      summary: supportAwareCopy?.summary ?? DEFAULT_SUMMARY,
      locale
    });
    const fallbackSummary = supportAwareCopy?.summary ?? (fallbackMode === "assessment"
      ? (locale === "en"
        ? "We could not match your problem precisely, but based on your level and current gaps these suggestions should help."
        : "我们暂时没有精确匹配到你的问题，但根据你的水平和当前短板，这些内容可能更适合你先看。")
      : (locale === "en"
        ? "Try the 1-minute assessment first for more targeted advice. In the meantime, start with these general suggestions."
        : "试试先做一次 1 分钟评估，我们能给你更准的建议。先从这些通用提升内容开始也可以。"));
    const effortPayload = applyEffortModePayload({
      effortMode,
      needsNarrowing,
      summary: fallbackSummary,
      causes: defCauses,
      fixes: defFixes,
      drills: defDrills,
      locale
    });
    const fallbackTitle = supportAwareCopy?.title ?? (
      fallbackMode === "assessment"
      ? (locale === "en"
        ? "Let's start from the weakest area in your assessment"
        : "我们先从你当前最值得补的一环开始")
      : (locale === "en"
        ? "Here is a general improvement direction to start with"
        : "先给你一组通用提升方向")
    );
    const evidenceNarrative = applyEvidenceCalibratedNarrative({
      evidenceLevel,
      title: fallbackTitle,
      summary: effortPayload.summary,
      locale
    });
    const summaryPayload = applySummaryBudget({
      summary: evidenceNarrative.summary,
      fixes: effortPayload.fixes,
      locale,
      effortMode
    });

    return {
      input,
      normalizedInput,
      matchedRuleId: null,
      matchedKeywords: [],
      matchedSynonyms: [],
      matchScore: 0,
      confidence: "较低",
      effortMode,
      evidenceLevel,
      needsNarrowing,
      narrowingPrompts,
      narrowingSuggestions,
      refusalReasonCodes: refusalMetadata.refusalReasonCodes,
      missingEvidenceSlots: refusalMetadata.missingEvidenceSlots,
      primaryNextStep,
      category: ["general", "improvement"],
      problemTag: DEFAULT_PROBLEM_TAG,
      title: evidenceNarrative.title,
      summary: summaryPayload.summary,
      detailedSummary: summaryPayload.detailedSummary,
      causes: effortPayload.causes,
      fixes: effortPayload.fixes,
      drills: effortPayload.drills,
      recommendedContents: allowRecommendations ? supportContents : [],
      searchQueries: null,
      fallbackUsed: true,
      fallbackMode,
      level,
      categoryConsistency: categoryGate ? "consistent" : "ungated",
      categoryConflict: null
    };
  }

  if (categoryGate && deepHandoff && !ruleMatchesDiagnosisCategoryGate(rule, categoryGate)) {
    return buildCategoryConflictDiagnosisResult({
      rawInput: input,
      normalizedInput,
      locale,
      effortMode,
      level,
      handoff: deepHandoff,
      reason: locale === "en"
        ? `Deep Mode expected ${deepHandoff.skillCategory}, but the selected diagnosis left that lane.`
        : `Deep Mode 预期是${getSkillCategoryLabel(deepHandoff.skillCategory, locale)}这一类，但选中的诊断离开了这条线。`
    });
  }

  const ruleContent = selectRuleContent(rule, locale);
  const modifierAwareCauses = buildModifierAwareCauses(rule.problemTag, ruleContent.causes, signalBundle, locale);
  const modifierAwareFixes = buildModifierAwareFixes(rule.problemTag, ruleContent.fixes, signalBundle, locale);
  const modifierAwareDrills = buildModifierAwareDrills(rule.problemTag, ruleContent.drills, signalBundle, locale);
  const modifierAwareContentIds = buildModifierAwareRecommendedContentIds(
    rule.problemTag,
    rule.recommendedContentIds,
    signalBundle
  );
  const evidenceLevel = getDiagnosisEvidenceLevel(score);
  const allowRecommendations = shouldExposeDiagnosisRecommendations(evidenceLevel);
  const summary = buildDiagnosisSummary(modifierAwareCauses, modifierAwareFixes, false, locale, rule.problemTag, signalBundle);
  const needsNarrowing = evidenceLevel === "low";
  const narrowingSuggestions = needsNarrowing ? buildNarrowingSuggestions(signalBundle, locale) : [];
  const narrowingPrompts = buildNarrowingPrompts(narrowingSuggestions);
  const refusalMetadata = buildRefusalMetadata({
    needsNarrowing,
    score,
    signalBundle
  });
  const primaryNextStep = resolvePrimaryNextStep({
    needsNarrowing,
    narrowingPrompts,
    narrowingSuggestions,
    fixes: modifierAwareFixes,
    summary,
    locale
  });
  const guidanceDeepContext = deepHandoff
    ? {
      ...deepHandoff,
      problemTag: rule.problemTag
    } satisfies EnrichedDiagnosisContext
    : null;
  const guidanceContext = buildDiagnosisGuidanceContext({
    problemTag: rule.problemTag,
    level,
    locale,
    primaryNextStep,
    diagnosisInput: input,
    deepContext: guidanceDeepContext
  });
  const recommendedContents = allowRecommendations
    ? getDiagnosisRecommendedContents({
      rule,
      signalBundle,
      seedContentIds: rule.recommendedContentIds,
      preferredSeedContentIds: modifierAwareContentIds,
      matchedKeywords,
      matchedSynonyms,
      contentPool: eligibleContentPool,
      maxRecommendations,
      level,
      guidanceContext
    })
    : [];
  const fallbackMode = recommendedContents.length === 0
    ? assessmentResult
      ? "assessment"
      : "no-assessment"
    : null;
  const finalRecommendedContents = allowRecommendations ? recommendedContents : [];
  const effortPayload = applyEffortModePayload({
    effortMode,
    needsNarrowing,
    summary,
    causes: modifierAwareCauses,
    fixes: modifierAwareFixes,
    drills: modifierAwareDrills,
    locale
  });
  const modifierAwareTitle = buildModifierAwareTitle(rule.problemTag, signalBundle, locale);
  const evidenceNarrative = applyEvidenceCalibratedNarrative({
    evidenceLevel,
    title: modifierAwareTitle,
    summary: effortPayload.summary,
    locale
  });
  const summaryPayload = applySummaryBudget({
    summary: evidenceNarrative.summary,
    fixes: effortPayload.fixes,
    locale,
    effortMode
  });

  const result: DiagnosisResult = {
    input,
    normalizedInput,
    matchedRuleId: rule.id,
    matchedKeywords,
    matchedSynonyms,
    matchScore: score,
    confidence: getDiagnosisConfidence(score),
    effortMode,
    evidenceLevel,
    needsNarrowing,
    narrowingPrompts,
    narrowingSuggestions,
    refusalReasonCodes: refusalMetadata.refusalReasonCodes,
    missingEvidenceSlots: refusalMetadata.missingEvidenceSlots,
    primaryNextStep,
    category: rule.category,
    problemTag: rule.problemTag,
    title: evidenceNarrative.title,
    summary: summaryPayload.summary,
    detailedSummary: summaryPayload.detailedSummary,
    causes: effortPayload.causes,
    fixes: effortPayload.fixes,
    drills: effortPayload.drills,
    recommendedContents: finalRecommendedContents,
    searchQueries: needsNarrowing ? null : rule.searchQueries,
    fallbackUsed: recommendedContents.length === 0,
    fallbackMode,
    level,
    guidanceContext,
    categoryConsistency: categoryGate ? "consistent" : "ungated",
    categoryConflict: null
  };

  if (deepHandoff && !isDiagnosisResultConsistentWithHandoff(result, deepHandoff)) {
    return buildCategoryConflictDiagnosisResult({
      rawInput: input,
      normalizedInput,
      locale,
      effortMode,
      level,
      handoff: deepHandoff,
      reason: locale === "en"
        ? "The final diagnosis result failed the post-selection category consistency guard."
        : "最终诊断结果没有通过选后类别一致性校验。"
    });
  }

  return result;
}

export function getDefaultDiagnosisResult(
  level?: string,
  contentPool: ContentItem[] = ALL_DIAGNOSIS_CONTENTS,
  maxRecommendations = 3,
  locale: "zh" | "en" = "zh"
): DiagnosisResult {
  const recommendedContents = getContentsByIds(DEFAULT_CONTENT_IDS, contentPool, maxRecommendations, level);

  return {
    input: "",
    normalizedInput: "",
    matchedRuleId: null,
    matchedKeywords: [],
    matchedSynonyms: [],
    matchScore: 0,
    confidence: "较低",
    effortMode: "standard",
    evidenceLevel: "low",
    needsNarrowing: false,
    narrowingPrompts: [],
    narrowingSuggestions: [],
    refusalReasonCodes: [],
    missingEvidenceSlots: [],
    primaryNextStep: locale === "en" ? DEFAULT_FIXES_EN[0] : DEFAULT_FIXES[0],
    category: ["general", "improvement"],
    problemTag: DEFAULT_PROBLEM_TAG,
    title: locale === "en" ? "Describe your problem" : "直接描述你的问题",
    summary: locale === "en"
      ? "Tell us your issue in one sentence and we will give you a starting point and recommended direction."
      : "用一句话说出你的困惑，我们会先给你一个基础判断和推荐方向。",
    causes: locale === "en" ? DEFAULT_CAUSES_EN : DEFAULT_CAUSES,
    fixes: locale === "en" ? DEFAULT_FIXES_EN : DEFAULT_FIXES,
    drills: locale === "en" ? DEFAULT_DRILLS_EN : DEFAULT_DRILLS,
    recommendedContents,
    searchQueries: null,
    fallbackUsed: true,
    fallbackMode: null,
    level,
    categoryConsistency: "ungated",
    categoryConflict: null
  };
}

export function getProblemPreviewTags(locale: "zh" | "en" = "zh"): string[] {
  return PROBLEM_PREVIEW_OPTIONS.map((item) => locale === "en" ? item.label_en : item.label);
}

export function getProblemPreviewOptions(): ProblemPreviewOption[] {
  return PROBLEM_PREVIEW_OPTIONS;
}

export function hasSpecificContextCues(input: string): boolean {
  return /尤其|总是|更容易|一紧张|一快|左右移动|when|especially|always|under pressure|gets worse|doubles/i.test(input);
}
