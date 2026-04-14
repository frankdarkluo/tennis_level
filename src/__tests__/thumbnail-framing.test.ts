import { describe, expect, it } from "vitest";
import { getThumbnailFraming } from "@/lib/content/thumbnailFraming";

describe("thumbnail framing", () => {
  it("uses a more aggressive centered crop for standard library cards", () => {
    const framing = getThumbnailFraming({
      surface: "library-card",
      platform: "Bilibili"
    });

    expect(framing.mediaClassName).toContain("aspect-[16/9]");
    expect(framing.imageClassName).toContain("object-[center_45%]");
    expect(framing.imageClassName).toContain("group-hover:scale-[1.1]");
    expect(framing.imageClassName).not.toContain("scale-[1.0]");
  });

  it("uses a portrait edge-to-edge crop for Xiaohongshu note cards", () => {
    const framing = getThumbnailFraming({
      surface: "library-xhs-note",
      platform: "Xiaohongshu"
    });

    expect(framing.mediaClassName).toContain("aspect-[3/4]");
    expect(framing.imageClassName).toContain("object-[center_38%]");
    expect(framing.imageClassName).toContain("group-hover:scale-[1.2]");
    expect(framing.imageClassName).not.toContain("scale-[1.0]");
  });

  it("keeps compact inline thumbnails on the same footprint while applying the shared crop policy", () => {
    const framing = getThumbnailFraming({
      surface: "inline-compact",
      platform: "YouTube"
    });

    expect(framing.thumbnailClassName).toContain("h-16");
    expect(framing.thumbnailClassName).toContain("w-28");
    expect(framing.imageClassName).toContain("object-[center_45%]");
    expect(framing.imageClassName).not.toContain("scale-[1.0]");
  });
});
