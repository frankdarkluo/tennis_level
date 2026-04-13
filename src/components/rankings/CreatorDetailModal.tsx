import { contents } from "@/data/contents";
import { useState } from "react";
import { Creator, CreatorFeaturedVideo } from "@/types/creator";
import { ContentItem, ContentSubtitleAvailability } from "@/types/content";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import {
  getContentFocusLine,
    getContentLanguageTag,
    getContentPrimaryTitle,
    getContentSecondaryTitle,
    getCreatorBio,
    getCreatorPrimaryName,
    getCreatorSecondaryName,
    getCreatorSuitableFor,
    getCreatorTags,
    getFeaturedVideoPrimaryTitle,
    getFeaturedVideoSecondaryTitle,
  getFeaturedVideoTarget,
    getSubtitleAvailability,
    getSubtitleAvailabilityTranslationKey
} from "@/lib/content/display";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getThumbnail } from "@/lib/thumbnail";

type CreatorModalItem = {
  id: string;
  title: string;
  secondaryTitle?: string | null;
  levels: string[];
  focusLine: string;
  url: string;
  platform: "Bilibili" | "YouTube" | "Xiaohongshu";
  thumbnail?: string;
  duration?: string;
  contentId?: string;
  logSource?: string;
  contentLanguage?: "zh" | "en";
  subtitleAvailability?: ContentSubtitleAvailability;
};

const SKILL_CARD_MAP: Record<string, { title: string; title_en: string; summary: string; summary_en: string; query: string }> = {
  basics: { title: "基础框架：先把动作理顺", title_en: "Fundamentals: build a clean swing", summary: "先把基础框架理顺", summary_en: "Start with a solid foundation", query: "基础 动作" },
  forehand: { title: "正手基础：先把挥拍做顺", title_en: "Forehand: stabilize the swing", summary: "正手框架先稳定", summary_en: "Lock in forehand form first", query: "正手" },
  backhand: { title: "反手基础：先把击球做实", title_en: "Backhand: solidify contact", summary: "反手击球先稳定", summary_en: "Get clean backhand contact", query: "反手" },
  serve: { title: "发球节奏：先别急着发力", title_en: "Serve: rhythm before power", summary: "先把发球节奏理顺", summary_en: "Build serve rhythm first", query: "发球" },
  movement: { title: "脚步移动：先学会提前到位", title_en: "Footwork: get there early", summary: "先把脚步节奏理顺", summary_en: "Work on footwork timing", query: "脚步 移动" },
  footwork: { title: "脚步移动：先学会提前到位", title_en: "Footwork: get there early", summary: "先把脚步节奏理顺", summary_en: "Work on footwork timing", query: "脚步 移动" },
  matchplay: { title: "比赛思路：先学会打深", title_en: "Match play: hit deep first", summary: "比赛执行先清晰", summary_en: "Sharpen match execution", query: "比赛 实战" },
  doubles: { title: "双打站位：先看基础配合", title_en: "Doubles: learn basic formation", summary: "双打配合先清楚", summary_en: "Start with basic doubles positioning", query: "双打 站位" },
  net: { title: "网前处理：先缩小动作", title_en: "Net play: keep it compact", summary: "网前动作先稳住", summary_en: "Stabilize volley mechanics", query: "网前 截击" },
  return: { title: "接发准备：先稳住第一拍", title_en: "Return: stabilize the first ball", summary: "接发第一拍先稳", summary_en: "Get the return in play first", query: "接发球" },
  consistency: { title: "稳定性：先把球送深", title_en: "Consistency: hit deep and steady", summary: "先把相持稳定住", summary_en: "Build rally consistency", query: "稳定性" },
  training: { title: "训练结构：先把内容排顺", title_en: "Training: structure your sessions", summary: "练习结构先理顺", summary_en: "Organize your practice plan", query: "训练" },
  grip: { title: "握拍调整：先找到顺手感觉", title_en: "Grip: find a comfortable feel", summary: "握拍感觉先顺住", summary_en: "Get the grip feeling right", query: "握拍" },
  slice: { title: "切削处理：先控住拍面", title_en: "Slice: control the racquet face", summary: "切削拍面先稳住", summary_en: "Stabilize slice angle", query: "切削" },
  topspin: { title: "上旋感觉：先把弧线拉起", title_en: "Topspin: lift the arc", summary: "上旋弧线先打出", summary_en: "Build topspin arc first", query: "上旋" },
  mental: { title: "比赛心态：先盯下一拍", title_en: "Mental game: focus on the next ball", summary: "比赛注意力拉回", summary_en: "Stay present in the match", query: "比赛 心态" },
  defense: { title: "防守处理：先把高球送回", title_en: "Defense: get the lob back deep", summary: "防守选择先清楚", summary_en: "Improve defensive lob choices", query: "防守 高球" }
};

const TAG_TO_SKILL_MAP: Record<string, string[]> = {
  "新手友好": ["basics"],
  "入门友好": ["basics"],
  "细节导向": ["grip", "backhand"],
  "细节纠偏": ["grip", "backhand"],
  "讲解清晰": ["basics"],
  "讲解透彻": ["basics"],
  "实战导向": ["matchplay"],
  "实战拆解": ["matchplay"],
  "基础导向": ["basics"],
  "基础筑形": ["basics"],
  "进阶提升": ["topspin", "matchplay"],
  "进阶突破": ["topspin", "matchplay"],
  "双打专项": ["doubles"],
  "战术拆局": ["matchplay"],
  "网前专修": ["net", "doubles"],
  "节奏训练": ["serve"],
  "发球专项": ["serve"],
  "发球专修": ["serve"],
  "正手专项": ["forehand"],
  "正手专修": ["forehand"],
  "反手专项": ["backhand"],
  "反手专修": ["backhand"],
  "脚步移动": ["movement"],
  "步法启动": ["movement"]
};

export function CreatorDetailModal({ creator, open, onClose }: { creator: Creator | null; open: boolean; onClose: () => void }) {
  const { language, t } = useI18n();
  const [showWhy, setShowWhy] = useState(false);
  const isEn = language === "en";
  const primaryName = creator ? getCreatorPrimaryName(creator, language) : null;
  const secondaryName = creator ? getCreatorSecondaryName(creator, language) : null;

  function formatTargetSummary(summary: string) {
    const prefix = t("creator.targetPrefix");
    const normalized = summary.replace(/^针对[：:]/, "").replace(/^Focus:\s*/i, "").trim();
    return `${prefix} ${normalized}`;
  }

  function buildSearchUrl(c: Creator, query: string) {
    const fullQuery = `${c.name} ${query}`.trim();

    if (c.platforms.includes("Bilibili")) {
      return `https://search.bilibili.com/all?keyword=${encodeURIComponent(fullQuery)}`;
    }

    return `https://www.youtube.com/results?search_query=${encodeURIComponent(fullQuery)}`;
  }

  function buildFallbackItems(c: Creator, existingIds: Set<string>) {
    const topics = [
      ...c.specialties,
      ...c.tags.flatMap((tag) => TAG_TO_SKILL_MAP[tag] ?? [])
    ].filter((topic, index, array) => array.indexOf(topic) === index);

    return topics
      .map((topic): CreatorModalItem | null => {
        const template = SKILL_CARD_MAP[topic];

        if (!template) {
          return null;
        }

        return {
          id: `fallback_${c.id}_${topic}`,
          title: isEn ? template.title_en : template.title,
          levels: c.levels.slice(0, 3),
          focusLine: isEn ? template.summary_en : template.summary,
          url: buildSearchUrl(c, template.query),
          platform: c.platforms.includes("Bilibili") ? "Bilibili" : "YouTube"
        } satisfies CreatorModalItem;
      })
      .filter((item): item is CreatorModalItem => {
        if (!item) {
          return false;
        }

        return !existingIds.has(item.id);
      })
      .slice(0, 5);
  }

  const creatorContents: CreatorModalItem[] = creator
    ? (creator.featuredContentIds.length > 0
      ? creator.featuredContentIds
        .map((id) => contents.find((item) => item.id === id))
        .filter((item): item is ContentItem => Boolean(item))
      : contents.filter((item) => item.creatorId === creator.id))
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          title: getContentPrimaryTitle(item, language),
          secondaryTitle: getContentSecondaryTitle(item, language),
          levels: item.levels,
          focusLine: getContentFocusLine(item, language),
          url: item.url,
          platform: item.platform === "Xiaohongshu"
            ? "Xiaohongshu"
            : item.platform === "Bilibili"
              ? "Bilibili"
              : "YouTube",
          thumbnail: item.thumbnail,
          duration: item.duration,
          contentId: item.id,
          contentLanguage: getContentLanguageTag(item),
          subtitleAvailability: getSubtitleAvailability(item),
          logSource: "creator_modal_content"
        }))
    : [];
  const creatorFeaturedVideos: CreatorModalItem[] = creator
    ? (creator.featuredVideos ?? []).slice(0, 5).map((item: CreatorFeaturedVideo) => ({
      id: item.id,
      title: getFeaturedVideoPrimaryTitle(item, language, creator),
      secondaryTitle: getFeaturedVideoSecondaryTitle(item, language, creator),
      levels: item.levels,
      focusLine: getFeaturedVideoTarget(item, language, creator),
      url: item.url,
      platform: item.platform,
      thumbnail: item.thumbnail,
      duration: item.duration,
      contentLanguage: item.contentLanguage,
      subtitleAvailability: item.subtitleAvailability,
      logSource: "creator_modal_featured_video"
    }))
    : [];
  const fallbackItems = creator ? buildFallbackItems(creator, new Set(creatorContents.map((item) => item.id))) : [];
  const modalItems = creatorFeaturedVideos.length > 0
    ? creatorFeaturedVideos
    : [...creatorContents, ...fallbackItems].slice(0, 5);
  const creatorWhySummary = creator
    ? [
      getCreatorSuitableFor(creator, language).slice(0, 2).join(" / "),
      getCreatorTags(creator.tags.slice(0, 2), language).join(" / ")
    ].filter(Boolean).join(" · ")
    : "";

  return (
    <Modal open={open} onClose={onClose} title={primaryName ?? t("creator.modalTitle")}>
      {creator ? (
        <>
          <div className="flex items-start gap-3">
            <CreatorAvatar name={primaryName ?? creator.name} avatarUrl={creator.avatar} />
            <div className="min-w-0 flex-1">
              {secondaryName ? (
                <p className="mb-2 text-xs text-slate-400">{secondaryName}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {creator.platforms.map((platform) => {
                  const href = creator.platformLinks?.[platform] ?? (platform === creator.platforms[0] ? creator.profileUrl : undefined);

                  if (!href) {
                    return <PlatformBadge key={platform} platform={platform} size="md" />;
                  }

                  return (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t("creator.platformAria", { name: primaryName ?? creator.name, platform })}
                      className="platform-link-wiggle inline-flex rounded-full transition-transform duration-200 hover:scale-[1.04] focus-visible:scale-[1.04]"
                      onClick={() => logEvent("creator.homepage_cta_clicked", {
                        creatorId: creator.id,
                        platform
                      }, { page: "/rankings" })}
                    >
                      <PlatformBadge platform={platform} size="md" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-700">{getCreatorBio(creator, language)}</p>
          <div>
            <p className="text-sm font-semibold text-slate-900">{t("creator.suitableFor")}</p>
            <p className="text-sm text-slate-700">{getCreatorSuitableFor(creator, language).join(" / ")}</p>
          </div>
          <div>
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 transition hover:text-slate-700"
              onClick={() => {
                logEvent("creator.why_this_viewed", {
                  creatorId: creator.id
                }, { page: "/rankings" });
                setShowWhy((current) => !current);
              }}
            >
              {t("creator.whyRecommended")}
            </button>
            {showWhy ? (
              <p className="mt-2 text-sm text-slate-600">
                {t("creator.whyPrefix")} {creatorWhySummary}
              </p>
            ) : null}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{t("creator.theirContent")}</p>
          </div>
          <div className="space-y-3">
            {modalItems.length > 0 ? (
              modalItems.map((item) => (
                (() => {
                  const subtitleLabel = item.subtitleAvailability
                    ? t(getSubtitleAvailabilityTranslationKey(item.subtitleAvailability))
                    : null;

                  return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-[var(--line)] px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/30"
                  onClick={() => {
                    if (item.contentId) {
                      logEvent("creator.featured_video_clicked", {
                        creatorId: creator.id,
                        contentId: item.contentId,
                        platform: item.platform
                      }, { page: "/rankings" });
                    } else {
                      logEvent("creator.homepage_cta_clicked", {
                        creatorId: creator.id,
                        platform: item.platform,
                        source: item.logSource ?? "creator_modal_fallback_search"
                      }, { page: "/rankings" });
                    }
                  }}
                >
                  <div className="flex gap-3">
                    <VideoThumbnail
                      thumbnail={getThumbnail(item)}
                      title={item.title}
                      duration={item.duration}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <Badge className="bg-slate-100 px-3.5 py-1.5 text-sm text-slate-700">{item.levels.join("/")}</Badge>
                        {item.contentLanguage ? (
                          <Badge className="bg-slate-100 px-3.5 py-1.5 text-sm text-slate-700">
                            {item.contentLanguage === "zh" ? t("content.lang.zh") : t("content.lang.en")}
                          </Badge>
                        ) : null}
                        {subtitleLabel ? (
                          <Badge className="bg-slate-100 px-3.5 py-1.5 text-sm text-slate-700">
                            {subtitleLabel}
                          </Badge>
                        ) : null}
                      </div>
                      {item.secondaryTitle ? (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                            {t("content.secondaryTitle")}
                          </p>
                          <p className="text-xs leading-5 text-slate-400">{item.secondaryTitle}</p>
                        </div>
                      ) : null}
                      {item.focusLine && item.focusLine !== item.title ? (
                        <p className="mt-2 text-sm text-slate-600">{formatTargetSummary(item.focusLine)}</p>
                      ) : null}
                    </div>
                  </div>
                </a>
                  );
                })()
              ))
            ) : (
              <p className="text-sm text-slate-600">{t("creator.noContent")}</p>
            )}
          </div>
          <a
            href={creator.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex"
            onClick={() => logEvent("creator.homepage_cta_clicked", { creatorId: creator.id }, { page: "/rankings" })}
          >
            <Button>{t("creator.goHome")}</Button>
          </a>
        </>
      ) : null}
    </Modal>
  );
}
