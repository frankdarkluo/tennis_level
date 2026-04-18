"use client";

const XIAOHONGSHU_REVIEW_BOOKMARKS_KEY = "tennislevel_xiaohongshu_review_bookmarks";

function isBrowser() {
  return typeof window !== "undefined";
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function readLocalXiaohongshuReviewBookmarkIds() {
  if (!isBrowser()) {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(XIAOHONGSHU_REVIEW_BOOKMARKS_KEY);
    if (!raw) {
      return [] as string[];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? uniqueIds(parsed) : [];
  } catch {
    return [] as string[];
  }
}

export function writeLocalXiaohongshuReviewBookmarkIds(ids: string[]) {
  if (!isBrowser()) {
    return [] as string[];
  }

  const normalized = uniqueIds(ids);
  window.localStorage.setItem(XIAOHONGSHU_REVIEW_BOOKMARKS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function toggleLocalXiaohongshuReviewBookmark(contentId: string) {
  const current = readLocalXiaohongshuReviewBookmarkIds();
  const next = current.includes(contentId)
    ? current.filter((id) => id !== contentId)
    : [...current, contentId];

  return writeLocalXiaohongshuReviewBookmarkIds(next);
}
