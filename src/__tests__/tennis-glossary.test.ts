import { describe, expect, it } from "vitest";
import {
  canonicalizeTennisText,
  findGlossaryTermIds,
  getTennisGlossaryEntry
} from "@/lib/i18n/tennisGlossary";

describe("tennis glossary", () => {
  it("returns canonical bilingual labels for high-frequency tennis terms", () => {
    expect(getTennisGlossaryEntry("pronation")).toMatchObject({
      en: "pronation",
      zh: "前臂内旋"
    });

    expect(getTennisGlossaryEntry("second-serve-confidence")).toMatchObject({
      en: "second serve confidence",
      zh: "二发信心"
    });
  });

  it("finds glossary terms from mixed zh/en coaching text", () => {
    expect(findGlossaryTermIds("Split step first, then find the contact point and recover.")).toEqual([
      "split-step",
      "contact-point",
      "recovery-step"
    ]);

    expect(findGlossaryTermIds("先做分腿垫步，再把击球点留在身体前面。")).toEqual([
      "split-step",
      "contact-point"
    ]);
  });

  it("canonicalizes common glossary variants for both locales", () => {
    expect(canonicalizeTennisText("Keep the racquet face stable through contact and finish the follow through.", "en")).toBe(
      "Keep the racket face stable through contact and finish the follow-through."
    );

    expect(canonicalizeTennisText("先稳住拍面，再把重心交换带出去。", "zh")).toBe(
      "先稳住拍面，再把重心传递带出去。"
    );
  });
});
