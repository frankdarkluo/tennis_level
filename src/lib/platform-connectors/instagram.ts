import type { PlatformConnector } from "@/lib/platform-connectors/types";

type InstagramPostSurface = {
  postId: string;
  kind: "p" | "reel" | "tv";
};

const SEARCH_PATTERN = /instagram\.com\/explore(?:\/|$)|instagram\.com\/accounts\/login/i;
const POST_PATTERN = /instagram\.com\/(p|reel|tv)\/([^/?#]+)/i;

function parseInstagramPost(url: string): InstagramPostSurface | null {
  const match = url.trim().match(POST_PATTERN);
  if (!match) {
    return null;
  }

  const kind = match[1]?.toLowerCase();
  if (kind !== "p" && kind !== "reel" && kind !== "tv") {
    return null;
  }

  return {
    kind,
    postId: match[2]
  };
}

export const instagramConnector: PlatformConnector = {
  platform: "Instagram",
  canonicalizeUrl(url) {
    const parsed = parseInstagramPost(url);

    if (!parsed) {
      return null;
    }

    return `https://www.instagram.com/${parsed.kind}/${parsed.postId}/`;
  },
  extractPostId(url) {
    return parseInstagramPost(url)?.postId ?? null;
  },
  inferRightsStatus(url) {
    if (parseInstagramPost(url)) {
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
