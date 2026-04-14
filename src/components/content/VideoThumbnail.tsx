"use client";

import { useState } from "react";
import { getThumbnailFraming, type ThumbnailFraming } from "@/lib/content/thumbnailFraming";
import type { ContentPlatform } from "@/types/content";

type VideoThumbnailProps = {
  thumbnail: string | null;
  title: string;
  platform: ContentPlatform;
  duration?: string;
  framing?: ThumbnailFraming;
};

function shouldDisableNoReferrer(thumbnail: string) {
  return /xhscdn\.com|xiaohongshu\.com/i.test(thumbnail);
}

function ThumbnailFallback() {
  return (
    <div
      data-testid="video-thumbnail-fallback"
      aria-hidden="true"
      className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-brand-50/35"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/92 shadow-sm ring-1 ring-slate-200/80">
        <svg
          viewBox="0 0 20 20"
          className="h-4.5 w-4.5 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3.5" y="5.25" width="13" height="9.5" rx="2.5" />
          <path d="M8.25 8.2v3.6l3.25-1.8-3.25-1.8Z" fill="currentColor" stroke="none" />
        </svg>
      </div>
    </div>
  );
}

export function VideoThumbnail({
  thumbnail,
  title,
  platform,
  duration,
  framing
}: VideoThumbnailProps) {
  const resolvedFraming = framing ?? getThumbnailFraming({ surface: "inline-compact", platform });
  const normalizedThumbnail = thumbnail?.trim() || null;
  const [thumbnailFailed, setThumbnailFailed] = useState(false);
  const showThumbnail = Boolean(normalizedThumbnail) && !thumbnailFailed;

  return (
    <div className={resolvedFraming.thumbnailClassName}>
      {showThumbnail ? (
        <img
          src={normalizedThumbnail ?? undefined}
          alt={title}
          className={resolvedFraming.imageClassName}
          loading="lazy"
          referrerPolicy={shouldDisableNoReferrer(normalizedThumbnail ?? "") ? undefined : "no-referrer"}
          onError={() => setThumbnailFailed(true)}
        />
      ) : (
        <ThumbnailFallback />
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-slate-200/70" />
      {duration ? (
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1 py-0.5 text-[11px] font-medium text-white">
          {duration}
        </span>
      ) : null}
    </div>
  );
}
