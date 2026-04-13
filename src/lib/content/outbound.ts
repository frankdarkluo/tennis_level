import { xiaohongshuConnector } from "@/lib/platform-connectors/xiaohongshu";
import type { ContentItem } from "@/types/content";

export type PreferredOutboundUrl = {
  href: string;
  fallbackUrl: string | null;
  opensInNewTab: boolean;
};

function isMobileUserAgent(userAgent?: string) {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent ?? "");
}

export function getPreferredOutboundUrl(
  item: Pick<ContentItem, "platform" | "url">,
  options?: { userAgent?: string }
): PreferredOutboundUrl {
  const fallbackUrl = item.url;

  if (item.platform === "Xiaohongshu" && isMobileUserAgent(options?.userAgent)) {
    const postId = xiaohongshuConnector.extractPostId(item.url);

    if (postId) {
      return {
        href: `xhsdiscover://video_feed/${postId}`,
        fallbackUrl,
        opensInNewTab: false
      };
    }
  }

  return {
    href: fallbackUrl,
    fallbackUrl: null,
    opensInNewTab: true
  };
}
