import type { PlatformConnector } from "@/lib/platform-connectors/types";

const SEARCH_PATTERN = /youtube\.com\/results\?search_query=/i;
const WATCH_ID_PATTERN = /[?&]v=([^&]+)/i;
const SHORTS_OR_LIVE_PATTERN = /youtube\.com\/(?:shorts|live)\/([^/?#]+)/i;
const SHORT_URL_PATTERN = /youtu\.be\/([^/?#]+)/i;

export const youtubeConnector: PlatformConnector = {
  platform: "YouTube",
  canonicalizeUrl(url) {
    const videoId = this.extractPostId(url);

    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/watch?v=${videoId}`;
  },
  extractPostId(url) {
    const trimmed = url.trim();
    return trimmed.match(WATCH_ID_PATTERN)?.[1]
      ?? trimmed.match(SHORTS_OR_LIVE_PATTERN)?.[1]
      ?? trimmed.match(SHORT_URL_PATTERN)?.[1]
      ?? null;
  },
  inferRightsStatus(url) {
    if (this.extractPostId(url)) {
      return "direct_source";
    }

    return SEARCH_PATTERN.test(url) ? "search_link" : "unknown";
  },
  normalizeCreatorHandle(handle) {
    const normalized = handle.trim().replace(/^@+/, "").replace(/\/+$/, "").toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }
};
