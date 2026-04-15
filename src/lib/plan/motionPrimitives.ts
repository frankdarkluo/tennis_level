import { getTennisGlossaryLabel, type TennisGlossaryTermId } from "@/lib/i18n/tennisGlossary";
import type { MotionPrimitiveId } from "@/types/plan";

type MotionPrimitiveSeed = {
  assetPath: string;
  titleTermId: TennisGlossaryTermId;
  caption: {
    zh: string;
    en: string;
  };
};

export type MotionPrimitiveDefinition = MotionPrimitiveSeed & {
  id: MotionPrimitiveId;
  title: {
    zh: string;
    en: string;
  };
};

const MOTION_PRIMITIVE_REGISTRY: Record<MotionPrimitiveId, MotionPrimitiveSeed> = {
  "split-step": {
    assetPath: "/motions/split-step.svg",
    titleTermId: "split-step",
    caption: {
      zh: "轻落地后立刻启动第一步。",
      en: "Land light, then explode into the first move."
    }
  },
  "unit-turn": {
    assetPath: "/motions/unit-turn.svg",
    titleTermId: "unit-turn",
    caption: {
      zh: "来球一出手就把肩髋一起带过去。",
      en: "Turn the shoulders and hips together as soon as you read the ball."
    }
  },
  "shoulder-turn": {
    assetPath: "/motions/shoulder-turn.svg",
    titleTermId: "shoulder-turn",
    caption: {
      zh: "先把转肩做出来，再谈挥拍速度。",
      en: "Establish the shoulder turn before adding swing speed."
    }
  },
  "contact-point": {
    assetPath: "/motions/contact-point.svg",
    titleTermId: "contact-point",
    caption: {
      zh: "把击球点留在身体前侧，不要被球顶住。",
      en: "Keep contact in front instead of letting the ball jam you."
    }
  },
  "weight-transfer": {
    assetPath: "/motions/weight-transfer.svg",
    titleTermId: "weight-transfer",
    caption: {
      zh: "力量从脚下和转体带出去，不是只用手臂。",
      en: "Let the legs and turn move the ball, not the arm alone."
    }
  },
  "recovery-step": {
    assetPath: "/motions/recovery-step.svg",
    titleTermId: "recovery-step",
    caption: {
      zh: "击球后立刻回位，把下一拍也准备进去。",
      en: "Recover right after contact so the next ball is already prepared."
    }
  },
  "serve-toss": {
    assetPath: "/motions/serve-toss.svg",
    titleTermId: "serve-toss",
    caption: {
      zh: "抛球先稳，再让挥拍去配合它。",
      en: "Stabilize the toss first, then let the swing match it."
    }
  },
  "trophy-position": {
    assetPath: "/motions/trophy-position.svg",
    titleTermId: "trophy-position",
    caption: {
      zh: "先把停顿里的形状立住，再继续往上发力。",
      en: "Own the trophy shape before driving upward."
    }
  },
  pronation: {
    assetPath: "/motions/pronation.svg",
    titleTermId: "pronation",
    caption: {
      zh: "先把发球链条顺住，再让前臂内旋自然带出拍头。",
      en: "Let pronation happen after the serve chain is sequenced cleanly."
    }
  },
  "cross-step-shuffle": {
    assetPath: "/motions/cross-step-shuffle.svg",
    titleTermId: "cross-step-shuffle",
    caption: {
      zh: "先用交叉步吃掉大距离，再用并步微调。",
      en: "Cover distance with the crossover, then fine-tune with the shuffle."
    }
  }
};

export function getMotionPrimitiveDefinition(id: MotionPrimitiveId | null | undefined): MotionPrimitiveDefinition | null {
  if (!id) {
    return null;
  }

  const seed = MOTION_PRIMITIVE_REGISTRY[id];
  if (!seed) {
    return null;
  }

  return {
    id,
    ...seed,
    title: {
      zh: getTennisGlossaryLabel(seed.titleTermId, "zh"),
      en: getTennisGlossaryLabel(seed.titleTermId, "en")
    }
  };
}
