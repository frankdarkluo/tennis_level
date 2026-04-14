import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/config";
import { ContentLanguageCode, ContentSubtitleAvailability } from "@/types/content";

export type LibraryPlatformFilter = "all" | "Bilibili" | "YouTube" | "Douyin" | "Xiaohongshu";
export type LibraryContentLanguageFilter = "all" | ContentLanguageCode;
export type LibrarySubtitleFilter = "all" | Extract<ContentSubtitleAvailability, "english" | "none">;

type LibraryFiltersProps = {
  keywordDraft: string;
  setKeywordDraft: (value: string) => void;
  onSearch: () => void;
  selectedPlatform: LibraryPlatformFilter;
  setSelectedPlatform: (value: LibraryPlatformFilter) => void;
  selectedContentLanguage: LibraryContentLanguageFilter;
  setSelectedContentLanguage: (value: LibraryContentLanguageFilter) => void;
  selectedSubtitleAvailability: LibrarySubtitleFilter;
  setSelectedSubtitleAvailability: (value: LibrarySubtitleFilter) => void;
  showBookmarkedOnly: boolean;
  setShowBookmarkedOnly: (value: boolean) => void;
  bookmarkFilterEnabled: boolean;
  compactMobile?: boolean;
};

const platformFixedOptions: Array<{ value: LibraryPlatformFilter; zhLabel: string; enLabel: string }> = [
  { value: "Bilibili", zhLabel: "Bilibili", enLabel: "Bilibili" },
  { value: "YouTube", zhLabel: "YouTube", enLabel: "YouTube" },
  { value: "Douyin", zhLabel: "抖音", enLabel: "TikTok" },
  { value: "Xiaohongshu", zhLabel: "小红书", enLabel: "RedNote" }
];

export function LibraryFilters(props: LibraryFiltersProps) {
  const { language, t } = useI18n();

  if (props.compactMobile) {
    return (
      <div
        data-testid="library-filters-mobile"
        className="sticky top-0 z-20 -mx-4 border-b border-[var(--line)] bg-[var(--surface)]/95 px-4 pb-3 pt-2 backdrop-blur"
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("library.searchPlaceholder")}
            value={props.keywordDraft}
            className="min-h-10 flex-[1_1_0%] rounded-full px-4 text-sm"
            onChange={(e) => props.setKeywordDraft(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                props.onSearch();
              }
            }}
          />
          <Button
            type="button"
            className="min-h-10 shrink-0 rounded-full bg-brand-500 px-5 text-sm font-semibold text-white hover:bg-brand-600"
            onClick={props.onSearch}
          >
            {t("library.searchAction")}
          </Button>
        </div>
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
          <select
            data-testid="library-mobile-platform-filter"
            className="min-h-9 w-auto shrink-0 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            value={props.selectedPlatform}
            onChange={(e) => props.setSelectedPlatform(e.target.value as LibraryPlatformFilter)}
          >
            <option value="all">{t("library.filter.platformAll")}</option>
            {platformFixedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {language === "en" ? option.enLabel : option.zhLabel}
              </option>
            ))}
          </select>
          <select
            className="min-h-9 w-auto shrink-0 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-xs font-semibold text-slate-700"
            value={props.selectedSubtitleAvailability}
            onChange={(e) => props.setSelectedSubtitleAvailability(e.target.value as LibrarySubtitleFilter)}
          >
            <option value="all">{t("library.filter.subtitleAll")}</option>
            <option value="english">{t("library.filter.subtitleYes")}</option>
            <option value="none">{t("library.filter.subtitleNo")}</option>
          </select>
          <button
            type="button"
            aria-pressed={props.showBookmarkedOnly}
            aria-disabled={!props.bookmarkFilterEnabled}
            title={props.bookmarkFilterEnabled ? t("library.bookmarkOnlyTitle") : t("library.bookmarkDisabledTitle")}
            className={props.bookmarkFilterEnabled
              ? props.showBookmarkedOnly
                ? "inline-flex min-h-9 shrink-0 items-center rounded-full bg-brand-500 px-4 text-xs font-semibold text-white"
                : "inline-flex min-h-9 shrink-0 items-center rounded-full border border-[var(--line)] bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              : "inline-flex min-h-9 shrink-0 cursor-not-allowed items-center rounded-full border border-[var(--line)] bg-slate-100 px-4 text-xs font-semibold text-slate-400"}
            onClick={() => {
              if (!props.bookmarkFilterEnabled) {
                return;
              }

              props.setShowBookmarkedOnly(!props.showBookmarkedOnly);
            }}
          >
            {t("library.bookmarks")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="library-filters-desktop"
      className="space-y-3 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-soft"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
        <Input
          placeholder={t("library.searchPlaceholder")}
          value={props.keywordDraft}
          onChange={(e) => props.setKeywordDraft(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              props.onSearch();
            }
          }}
        />
        <select
          className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-700"
          value={props.selectedPlatform}
          onChange={(e) => props.setSelectedPlatform(e.target.value as LibraryPlatformFilter)}
        >
          <option value="all">{t("library.filter.platformAll")}</option>
          {platformFixedOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {language === "en" ? option.enLabel : option.zhLabel}
            </option>
          ))}
        </select>
        <select
          className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-700"
          value={props.selectedContentLanguage}
          onChange={(e) => props.setSelectedContentLanguage(e.target.value as LibraryContentLanguageFilter)}
        >
          <option value="all">{t("library.filter.languageAll")}</option>
          <option value="zh">{t("library.filter.languageZh")}</option>
          <option value="en">{t("library.filter.languageEn")}</option>
        </select>
        <select
          className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-700"
          value={props.selectedSubtitleAvailability}
          onChange={(e) => props.setSelectedSubtitleAvailability(e.target.value as LibrarySubtitleFilter)}
        >
          <option value="all">{t("library.filter.subtitleAll")}</option>
          <option value="english">{t("library.filter.subtitleYes")}</option>
          <option value="none">{t("library.filter.subtitleNo")}</option>
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="secondary" onClick={props.onSearch}>
          {t("library.searchAction")}
        </Button>
        <button
          type="button"
          aria-pressed={props.showBookmarkedOnly}
          aria-disabled={!props.bookmarkFilterEnabled}
          title={props.bookmarkFilterEnabled ? t("library.bookmarkOnlyTitle") : t("library.bookmarkDisabledTitle")}
          className={props.bookmarkFilterEnabled
            ? props.showBookmarkedOnly
              ? "inline-flex min-h-11 items-center rounded-full bg-brand-500 px-4 text-sm font-semibold text-white"
              : "inline-flex min-h-11 items-center rounded-full border border-[var(--line)] px-4 text-sm font-semibold text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
            : "inline-flex min-h-11 cursor-not-allowed items-center rounded-full border border-[var(--line)] bg-slate-100 px-4 text-sm font-semibold text-slate-400"}
          onClick={() => {
            if (!props.bookmarkFilterEnabled) {
              return;
            }

            props.setShowBookmarkedOnly(!props.showBookmarkedOnly);
          }}
        >
          {t("library.bookmarks")}
        </button>
      </div>
    </div>
  );
}
