import type { ContentPlatform } from "@/types/content";
import type { CatalogRightsStatus } from "@/lib/content-catalog/schema";

export type PlatformConnector = {
  platform: ContentPlatform;
  canonicalizeUrl(url: string): string | null;
  extractPostId(url: string): string | null;
  inferRightsStatus(url: string): CatalogRightsStatus;
  normalizeCreatorHandle?(handle: string): string | null;
};
