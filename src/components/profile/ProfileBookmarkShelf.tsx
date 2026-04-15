"use client";

import { useMemo, useState } from "react";
import { VideoThumbnail } from "@/components/content/VideoThumbnail";
import { creators } from "@/data/creators";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  getContentFocusLine,
  getContentLanguageTag,
  getContentPrimaryTitle,
  getCreatorPrimaryName
} from "@/lib/content/display";
import { getPreferredOutboundUrl } from "@/lib/content/outbound";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getThumbnail } from "@/lib/thumbnail";
import type { ContentItem } from "@/types/content";

type GroupMode = "creator" | "tag";

type GroupedBookmarkItems = {
  label: string;
  items: ContentItem[];
};

function sortGroups(groups: GroupedBookmarkItems[]) {
  return [...groups].sort((left, right) => {
    if (right.items.length !== left.items.length) {
      return right.items.length - left.items.length;
    }

    return left.label.localeCompare(right.label);
  });
}

export function ProfileBookmarkShelf({
  items,
  pendingIds,
  onRemoveOne,
  onRemoveMany
}: {
  items: ContentItem[];
  pendingIds: string[];
  onRemoveOne: (contentId: string) => void | Promise<void>;
  onRemoveMany: (contentIds: string[]) => void | Promise<void>;
}) {
  const { language, t } = useI18n();
  const [groupMode, setGroupMode] = useState<GroupMode>("creator");
  const [filterValue, setFilterValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visibleGroups = useMemo(() => {
    const normalizedFilter = filterValue.trim().toLowerCase();

    const grouped = items.reduce<Map<string, ContentItem[]>>((map, item) => {
      const creator = creators.find((entry) => entry.id === item.creatorId);
      const creatorLabel = creator ? getCreatorPrimaryName(creator, language) : t("profile.none");
      const tagLabel = getContentFocusLine(item, language) ?? item.problemTags[0] ?? t("profile.none");
      const groupLabel = groupMode === "creator" ? creatorLabel : tagLabel;
      const haystack = [
        getContentPrimaryTitle(item, language),
        creatorLabel,
        tagLabel,
        groupLabel
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (normalizedFilter && !haystack.includes(normalizedFilter)) {
        return map;
      }

      const existingItems = map.get(groupLabel) ?? [];
      map.set(groupLabel, [...existingItems, item]);
      return map;
    }, new Map<string, ContentItem[]>());

    return sortGroups(
      Array.from(grouped.entries()).map(([label, groupedItems]) => ({
        label,
        items: groupedItems
      }))
    );
  }, [filterValue, groupMode, items, language, t]);

  const selectedVisibleIds = selectedIds.filter((id) =>
    visibleGroups.some((group) => group.items.some((item) => item.id === id))
  );

  const handleBatchRemove = () => {
    if (selectedVisibleIds.length === 0) {
      return;
    }

    void Promise.resolve(onRemoveMany(selectedVisibleIds));
    setSelectedIds((current) => current.filter((id) => !selectedVisibleIds.includes(id)));
  };

  const toggleSelected = (contentId: string) => {
    setSelectedIds((current) =>
      current.includes(contentId)
        ? current.filter((id) => id !== contentId)
        : [...current, contentId]
    );
  };

  return (
    <Card className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{t("profile.bookmarks.title")}</h2>
          <p className="mt-1 text-sm text-slate-600">{t("profile.bookmarks.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={groupMode === "creator" ? "primary" : "secondary"}
            onClick={() => setGroupMode("creator")}
          >
            {t("profile.bookmarks.groupByCreator")}
          </Button>
          <Button
            type="button"
            variant={groupMode === "tag" ? "primary" : "secondary"}
            onClick={() => setGroupMode("tag")}
          >
            {t("profile.bookmarks.groupByTag")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={filterValue}
          onChange={(event) => setFilterValue(event.target.value)}
          placeholder={t("profile.bookmarks.filterPlaceholder")}
          className="h-11 w-full rounded-xl border border-[var(--line)] px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-300 lg:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-slate-500">{t("profile.bookmarks.results", { value: items.length })}</p>
          {selectedVisibleIds.length > 0 ? (
            <>
              <Button type="button" variant="secondary" onClick={() => setSelectedIds([])}>
                {t("profile.bookmarks.clearSelection")}
              </Button>
              <Button type="button" onClick={handleBatchRemove}>
                {t("profile.bookmarks.removeSelected")}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--line)] bg-slate-50 px-4 py-5 text-sm text-slate-500">
          {t("profile.bookmarks.emptyFiltered")}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleGroups.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{group.label}</p>
                <Badge className="bg-slate-100 text-slate-700">{group.items.length}</Badge>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const creator = creators.find((entry) => entry.id === item.creatorId);
                  const creatorLabel = creator ? getCreatorPrimaryName(creator, language) : t("profile.none");
                  const primaryTitle = getContentPrimaryTitle(item, language);
                  const thumbnail = getThumbnail(item);
                  const isPending = pendingIds.includes(item.id);
                  const languageBadge = getContentLanguageTag(item) === "zh" ? t("content.lang.zh") : t("content.lang.en");

                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border border-[var(--line)] bg-white px-3 py-3"
                    >
                      <input
                        type="checkbox"
                        className="mt-5 h-4 w-4 shrink-0 accent-brand-600"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelected(item.id)}
                        aria-label={t("profile.bookmarks.selectItem", { value: primaryTitle })}
                      />
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 flex-1 gap-3"
                        onClick={(event) => {
                          logEvent("content.outbound_clicked", {
                            contentId: item.id,
                            platform: item.platform,
                            sourceContext: "profile"
                          }, { page: "/profile" });

                          const outbound = getPreferredOutboundUrl(item, {
                            userAgent: typeof navigator === "undefined" ? undefined : navigator.userAgent
                          });

                          if (outbound.href !== item.url && typeof window !== "undefined") {
                            event.preventDefault();
                            window.location.assign(outbound.href);
                          }
                        }}
                      >
                        <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          <VideoThumbnail
                            thumbnail={thumbnail}
                            title={primaryTitle}
                            platform={item.platform}
                            duration={item.duration}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{primaryTitle}</p>
                          <p className="mt-1 text-xs text-slate-500">{creatorLabel}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Badge className="bg-slate-100 text-slate-700">{languageBadge}</Badge>
                            {getContentFocusLine(item, language) ? (
                              <Badge className="bg-slate-100 text-slate-700">{getContentFocusLine(item, language)}</Badge>
                            ) : null}
                          </div>
                        </div>
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        className="shrink-0 px-2 text-sm"
                        disabled={isPending}
                        aria-label={t("profile.bookmarks.removeOne", { value: primaryTitle })}
                        onClick={() => {
                          void Promise.resolve(onRemoveOne(item.id));
                          setSelectedIds((current) => current.filter((id) => id !== item.id));
                        }}
                      >
                        {isPending ? "..." : t("content.bookmark.removeSaved")}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
