export type TennisGlossaryLocale = "zh" | "en";

export type TennisGlossaryTermId =
  | "split-step"
  | "unit-turn"
  | "shoulder-turn"
  | "contact-point"
  | "weight-transfer"
  | "recovery-step"
  | "serve-toss"
  | "trophy-position"
  | "pronation"
  | "cross-step-shuffle"
  | "follow-through"
  | "racket-face"
  | "second-serve-confidence";

type GlossaryEntry = {
  en: string;
  zh: string;
  matchers: RegExp[];
  replacements?: RegExp[];
};

const TENNIS_GLOSSARY: Record<TennisGlossaryTermId, GlossaryEntry> = {
  "split-step": {
    en: "split step",
    zh: "分腿垫步",
    matchers: [/split[\s-]?step/i, /分腿垫步/],
    replacements: [/split[\s-]?step/gi]
  },
  "unit-turn": {
    en: "unit turn",
    zh: "整体转体",
    matchers: [/unit[\s-]?turn/i, /整体转体/, /引拍转体/],
    replacements: [/unit[\s-]?turn/gi, /引拍转体/g]
  },
  "shoulder-turn": {
    en: "shoulder turn",
    zh: "转肩",
    matchers: [/shoulder[\s-]?turn/i, /转肩/],
    replacements: [/shoulder[\s-]?turn/gi]
  },
  "contact-point": {
    en: "contact point",
    zh: "击球点",
    matchers: [/contact point/i, /击球点/, /触球点/],
    replacements: [/contact point/gi, /触球点/g]
  },
  "weight-transfer": {
    en: "weight transfer",
    zh: "重心传递",
    matchers: [/weight transfer/i, /重心传递/, /重心交换/, /重心转移/],
    replacements: [/weight transfer/gi, /重心交换/g, /重心转移/g]
  },
  "recovery-step": {
    en: "recovery step",
    zh: "回位步",
    matchers: [/recovery step/i, /\brecover(?:y|ing)?\b/i, /回位步/, /回位/],
    replacements: [/recovery step/gi]
  },
  "serve-toss": {
    en: "serve toss",
    zh: "抛球",
    matchers: [/serve toss/i, /\btoss\b/i, /抛球/],
    replacements: [/serve toss/gi]
  },
  "trophy-position": {
    en: "trophy position",
    zh: "奖杯姿势",
    matchers: [/trophy position/i, /奖杯姿势/],
    replacements: [/trophy position/gi]
  },
  pronation: {
    en: "pronation",
    zh: "前臂内旋",
    matchers: [/pronation/i, /前臂内旋/, /内旋/],
    replacements: [/pronation/gi]
  },
  "cross-step-shuffle": {
    en: "cross-step shuffle",
    zh: "交叉步 / 并步",
    matchers: [/cross[\s-]?step(?:\s+shuffle)?/i, /\bshuffle\b/i, /交叉步/, /并步/],
    replacements: [/cross[\s-]?step(?:\s+shuffle)?/gi]
  },
  "follow-through": {
    en: "follow-through",
    zh: "随挥",
    matchers: [/follow[\s-]?through/i, /随挥/],
    replacements: [/follow[\s-]?through/gi]
  },
  "racket-face": {
    en: "racket face",
    zh: "拍面",
    matchers: [/racket face/i, /racquet face/i, /拍面/],
    replacements: [/racquet face/gi, /racket face/gi]
  },
  "second-serve-confidence": {
    en: "second serve confidence",
    zh: "二发信心",
    matchers: [/second serve confidence/i, /2nd serve confidence/i, /二发信心/],
    replacements: [/2nd serve confidence/gi]
  }
};

const GLOSSARY_IDS = Object.keys(TENNIS_GLOSSARY) as TennisGlossaryTermId[];

function withGlobal(pattern: RegExp) {
  return new RegExp(pattern.source, pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`);
}

function withoutGlobal(pattern: RegExp) {
  return new RegExp(pattern.source, pattern.flags.replace(/g/g, ""));
}

export function getTennisGlossaryEntry(id: TennisGlossaryTermId) {
  return TENNIS_GLOSSARY[id];
}

export function getTennisGlossaryLabel(id: TennisGlossaryTermId, locale: TennisGlossaryLocale) {
  return locale === "en" ? TENNIS_GLOSSARY[id].en : TENNIS_GLOSSARY[id].zh;
}

export function findGlossaryTermIds(text: string): TennisGlossaryTermId[] {
  const source = text.trim();
  if (!source) {
    return [];
  }

  return GLOSSARY_IDS.filter((id) => TENNIS_GLOSSARY[id].matchers.some((pattern) => withoutGlobal(pattern).test(source)));
}

export function canonicalizeTennisText(text: string, locale: TennisGlossaryLocale): string {
  if (!text.trim()) {
    return text;
  }

  let normalized = text;

  for (const id of GLOSSARY_IDS) {
    const entry = TENNIS_GLOSSARY[id];
    const replacement = locale === "en" ? entry.en : entry.zh;

    for (const pattern of entry.replacements ?? []) {
      normalized = normalized.replace(withGlobal(pattern), replacement);
    }
  }

  return normalized
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}
