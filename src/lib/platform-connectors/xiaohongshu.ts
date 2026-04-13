import type { PlatformConnector } from "@/lib/platform-connectors/types";

const SEARCH_PATTERN = /xiaohongshu\.com\/search_result(?:\/|\?|$)|xiaohongshu\.com\/search(?:\/|\?|$)/i;
const EXPLORE_PATTERN = /xiaohongshu\.com\/explore\/([^/?#]+)/i;
const DISCOVERY_PATTERN = /xiaohongshu\.com\/discovery\/item\/([^/?#]+)/i;

export const xiaohongshuConnector: PlatformConnector = {
  platform: "Xiaohongshu",
  canonicalizeUrl(url) {
    const postId = this.extractPostId(url);

    if (!postId) {
      return null;
    }

    return `https://www.xiaohongshu.com/explore/${postId}`;
  },
  extractPostId(url) {
    const trimmed = url.trim();
    return trimmed.match(EXPLORE_PATTERN)?.[1]
      ?? trimmed.match(DISCOVERY_PATTERN)?.[1]
      ?? null;
  },
  inferRightsStatus(url) {
    if (this.extractPostId(url)) {
      return "direct_source";
    }

    if (SEARCH_PATTERN.test(url)) {
      return "search_link";
    }

    return "unknown";
  },
  normalizeCreatorHandle(handle) {
    const normalized = handle.trim().replace(/^@+/, "").replace(/\/+$/, "").toLowerCase();
    return normalized.length > 0 ? normalized : null;
  }
};
