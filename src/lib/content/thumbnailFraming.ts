import type { ContentPlatform } from "@/types/content";

export type ThumbnailSurface = "inline-compact" | "library-card" | "library-xhs-note";

export type ThumbnailFraming = {
  mediaClassName?: string;
  thumbnailClassName: string;
  imageClassName: string;
};

const INLINE_THUMBNAIL_CLASS =
  "relative h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100";

const LIBRARY_MEDIA_BASE_CLASS = "relative shrink-0 overflow-hidden bg-slate-100";
const LIBRARY_THUMBNAIL_CLASS = "relative h-full w-full overflow-hidden bg-slate-100";

const LANDSCAPE_IMAGE_CLASS =
  "absolute inset-0 h-full w-full object-cover object-[center_45%] transition duration-300 group-hover:scale-[1.1]";

const PORTRAIT_IMAGE_CLASS =
  "absolute inset-0 h-full w-full object-cover object-[center_40%] transition duration-300 group-hover:scale-[1.14]";

const NOTE_IMAGE_CLASS =
  "absolute inset-0 h-full w-full object-cover object-[center_18%] transition duration-300 group-hover:scale-[1.2]";

function getLibraryAspectClass(platform: ContentPlatform) {
  return platform === "Xiaohongshu" ? "aspect-[3/4]" : "aspect-[16/9]";
}

function getSharedCropClass(platform: ContentPlatform) {
  return platform === "Xiaohongshu" ? PORTRAIT_IMAGE_CLASS : LANDSCAPE_IMAGE_CLASS;
}

export function getThumbnailFraming({
  surface,
  platform
}: {
  surface: ThumbnailSurface;
  platform: ContentPlatform;
}): ThumbnailFraming {
  if (surface === "inline-compact") {
    return {
      thumbnailClassName: INLINE_THUMBNAIL_CLASS,
      imageClassName: getSharedCropClass(platform)
    };
  }

  if (surface === "library-xhs-note") {
    return {
      mediaClassName: `${LIBRARY_MEDIA_BASE_CLASS} aspect-[3/4]`,
      thumbnailClassName: LIBRARY_THUMBNAIL_CLASS,
      imageClassName: NOTE_IMAGE_CLASS
    };
  }

  return {
    mediaClassName: `${LIBRARY_MEDIA_BASE_CLASS} ${getLibraryAspectClass(platform)}`,
    thumbnailClassName: LIBRARY_THUMBNAIL_CLASS,
    imageClassName: getSharedCropClass(platform)
  };
}
