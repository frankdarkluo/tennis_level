import { useState } from "react";

import { RecommendationSummary } from "@/components/content/RecommendationSummary";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { creators } from "@/data/creators";
import { ContentItem } from "@/types/content";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  formatCompactViewCount,
  getContentFocusLine,
  getContentLanguageTag,
  getContentPrimaryTitle,
  getContentSecondaryTitle,
  getCreatorPrimaryName,
  getPlatformDisplayName,
  getSubtitleAvailability,
  getSubtitleAvailabilityTranslationKey
} from "@/lib/content/display";
import { getThumbnailFraming } from "@/lib/content/thumbnailFraming";
import { getPreferredOutboundUrl } from "@/lib/content/outbound";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getThumbnail } from "@/lib/thumbnail";
import { cn } from "@/lib/utils";

type ContentCardProps = {
  item: ContentItem;
  source?: "library" | "profile";
  bookmarked?: boolean;
  bookmarkLoading?: boolean;
  onToggleBookmark?: () => void;
  layoutVariant?: "default" | "xhs-mobile-note";
};

function BookmarkIcon({
  filled,
  className = "h-[1.45rem] w-[1.45rem]"
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M6 3.5h8A1.5 1.5 0 0 1 15.5 5v11l-5.5-3-5.5 3V5A1.5 1.5 0 0 1 6 3.5Z" />
    </svg>
  );
}

function ViewsIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.25" y="4.75" width="17.5" height="14.5" rx="4.25" />
      <path d="M10 9.2v5.6l4.8-2.8-4.8-2.8Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

const STANDARD_META_BADGE_CLASS = "bg-slate-100 px-1.0 py-0.5 text-[9px] font-semibold leading-[1.05] text-slate-700";
const WRAPPING_META_BADGE_CLASS = `${STANDARD_META_BADGE_CLASS} max-w-full whitespace-normal break-words text-center`;

export function ContentCard({
  item,
  source = "library",
  bookmarked = false,
  bookmarkLoading = false,
  onToggleBookmark,
  layoutVariant = "default"
}: ContentCardProps) {
  const { language, t } = useI18n();
  const creator = creators.find((c) => c.id === item.creatorId);
  const isProfileCompact = source === "profile";
  const primaryTitle = getContentPrimaryTitle(item, language);
  const secondaryTitle = getContentSecondaryTitle(item, language);
  const focusLine = getContentFocusLine(item, language);
  const thumbnail = getThumbnail(item);
  const viewCountLabel = formatCompactViewCount(item.viewCount, language);
  const contentLanguage = getContentLanguageTag(item);
  const subtitleAvailability = getSubtitleAvailability(item);
  const creatorName = creator ? getCreatorPrimaryName(creator, language) : t("content.unknownCreator");
  const [showWhy, setShowWhy] = useState(false);
  const subtitleLabel = t(getSubtitleAvailabilityTranslationKey(subtitleAvailability));
  const isXhsMobileNote = layoutVariant === "xhs-mobile-note";
  const noteMetaChips = [item.levels.join("/"), subtitleLabel];
  const thumbnailFraming = getThumbnailFraming({
    surface: isXhsMobileNote ? "library-xhs-note" : "library-card",
    platform: item.platform
  });

  return (
    <Card
      className={cn(
        "group relative flex h-full flex-col overflow-hidden p-0",
        isXhsMobileNote && "rounded-[18px] border-slate-100 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
      )}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        aria-label={t("content.openAria", { value: primaryTitle })}
        className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70"
        onClick={(event) => {
          const route = source === "profile" ? "/profile" : "/library";
          logEvent("content.card_opened", {
            contentId: item.id,
            platform: item.platform,
            contentLanguage,
            subtitleAvailability,
            sourceContext: source
          }, { page: route });
          logEvent("content.outbound_clicked", {
            contentId: item.id,
            platform: item.platform,
            sourceContext: source
          }, { page: route });

          const outbound = getPreferredOutboundUrl(item, {
            userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent
          });

          if (outbound.href !== item.url && typeof window !== "undefined") {
            event.preventDefault();
            window.location.assign(outbound.href);
          }
        }}
      />
      <div className="relative z-10 flex h-full flex-col pointer-events-none">
        <div data-testid="content-card-media" className={thumbnailFraming.mediaClassName}>
          <VideoThumbnail
            thumbnail={thumbnail}
            title={primaryTitle}
            platform={item.platform}
            duration={item.duration}
            framing={thumbnailFraming}
          />
          {!isXhsMobileNote && viewCountLabel ? (
            <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded bg-black/75 px-2 py-1 text-xs font-medium text-white">
              <ViewsIcon />
              {viewCountLabel}
            </span>
          ) : null}
        </div>
        <div className={cn("flex flex-1 flex-col px-5 pt-5 pb-0", isXhsMobileNote && "px-0.5 pt-0.5 pb-1.5")}>
          <div className={cn("space-y-2.5", isXhsMobileNote && "space-y-2")}>
            {isXhsMobileNote ? (
              <div className="flex flex-wrap items-start gap-2">
                {noteMetaChips.map((chip) => (
                  <Badge
                    key={chip}
                    data-testid="content-card-meta-chip"
                    className={WRAPPING_META_BADGE_CLASS}
                  >
                    {chip}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Badge className="px-5 py-2 text-base font-semibold leading-none">{getPlatformDisplayName(item.platform, language)}</Badge>
                <Badge className="bg-slate-100 px-5 py-2 text-base font-semibold leading-none text-slate-700">{item.levels.join("/")}</Badge>
                <Badge className={STANDARD_META_BADGE_CLASS}>
                  {contentLanguage === "zh" ? t("content.lang.zh") : t("content.lang.en")}
                </Badge>
                <Badge className={STANDARD_META_BADGE_CLASS}>
                  {subtitleLabel}
                </Badge>
              </div>
            )}
            <div className="space-y-1">
              <h3 className={cn(
                "line-clamp-2 text-[0.96rem] font-bold leading-[1.35] text-slate-900 sm:text-[1rem]",
                isXhsMobileNote && "text-[0.7rem] font-semibold leading-[1.25] sm:text-[0.84rem]"
              )}>
                {primaryTitle}
              </h3>
              {!isXhsMobileNote && secondaryTitle ? (
                <div className="space-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    {t("content.secondaryTitle")}
                  </p>
                  <p className="line-clamp-1 text-xs leading-5 text-slate-400">
                    {secondaryTitle}
                  </p>
                </div>
              ) : null}
              <p className={cn("text-sm leading-6 text-slate-600", isXhsMobileNote && "line-clamp-1 text-[10px] leading-4.5 text-slate-500")}>
                {creatorName}
              </p>
            </div>
          </div>
          <div className={cn("relative mt-0.5 pr-10", isXhsMobileNote && "mt-1 pr-0")}>
            {!isXhsMobileNote && focusLine && focusLine !== primaryTitle ? (
              <p className="min-w-0 text-sm leading-6 text-slate-600">
                {t("content.targetPrefix")} {focusLine}
              </p>
            ) : null}
            {!isXhsMobileNote ? (
              <button
              type="button"
              className="pointer-events-auto mt-2 text-xs font-semibold text-slate-500 transition hover:text-slate-700"
              onClick={(event) => {
                event.stopPropagation();
                const route = source === "profile" ? "/profile" : "/library";
                logEvent("content.why_this_viewed", {
                  contentId: item.id,
                  sourceContext: source,
                  contentLanguage,
                  subtitleAvailability
                }, { page: route });
                setShowWhy((current) => !current);
              }}
            >
              {t("content.whyRecommended")}
              </button>
            ) : null}
            {!isXhsMobileNote && showWhy ? (
              <RecommendationSummary item={item} className="mt-2" />
            ) : null}
            {onToggleBookmark && isXhsMobileNote ? (
              <button
                data-testid="content-card-note-bookmark"
                type="button"
                className={bookmarked
                  ? "pointer-events-auto absolute bottom-0 right-0 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-brand-700"
                  : "pointer-events-auto absolute bottom-0 right-0 z-20 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleBookmark();
                }}
                disabled={bookmarkLoading}
                aria-pressed={bookmarked}
                aria-label={bookmarked ? t("content.bookmark.remove") : t("content.bookmark.add")}
              >
                <BookmarkIcon filled={bookmarked} className="h-[1.1rem] w-[1.1rem]" />
              </button>
            ) : null}
            {onToggleBookmark && !isXhsMobileNote ? (
              <button
                type="button"
                className={isProfileCompact
                  ? "pointer-events-auto text-sm font-semibold text-slate-500 transition hover:text-slate-700"
                  : bookmarked
                    ? "pointer-events-auto absolute right-[-4px] top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-brand-700 transition duration-200 hover:scale-[1.03] hover:text-brand-800"
                    : "pointer-events-auto absolute right-[-4px] top-1/2 z-20 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center text-slate-400 transition duration-200 hover:scale-[1.03] hover:text-slate-600"}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleBookmark();
                }}
                disabled={bookmarkLoading}
                aria-pressed={bookmarked}
                aria-label={isProfileCompact ? t("content.bookmark.removeSaved") : bookmarked ? t("content.bookmark.remove") : t("content.bookmark.add")}
              >
                {isProfileCompact ? (
                  <span>{bookmarkLoading ? t("content.bookmark.working") : t("content.bookmark.removeSaved")}</span>
                ) : (
                  <BookmarkIcon filled={bookmarked} className="h-[1.6rem] w-[1.6rem]" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
