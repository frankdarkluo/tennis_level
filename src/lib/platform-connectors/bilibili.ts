import type { PlatformConnector } from "@/lib/platform-connectors/types";

const SEARCH_PATTERN = /search\.bilibili\.com\/all\?keyword=/i;
const VIDEO_ID_PATTERN = /(BV[0-9A-Za-z]+|av\d+)/i;

export const bilibiliConnector: PlatformConnector = {
  platform: "Bilibili",
  canonicalizeUrl(url) {
    const videoId = this.extractPostId(url);

    if (!videoId) {
      return null;
    }

    return `https://www.bilibili.com/video/${videoId}`;
  },
  extractPostId(url) {
    const match = url.trim().match(VIDEO_ID_PATTERN)?.[1] ?? null;
    if (!match) {
      return null;
    }

    return /^av\d+$/i.test(match) ? match.toLowerCase() : match;
  },
  inferRightsStatus(url) {
    if (this.extractPostId(url)) {
      return "direct_source";
    }

    return SEARCH_PATTERN.test(url) ? "search_link" : "unknown";
  },
  normalizeCreatorHandle(handle) {
    const normalized = handle.trim().replace(/^@+/, "").replace(/\/+$/, "");
    return normalized.length > 0 ? normalized : null;
  }
};
