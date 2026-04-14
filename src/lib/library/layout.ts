export const MOBILE_LIBRARY_MASONRY_MAX_WIDTH = 480;

export function shouldUseCompactMobileLibraryLayout({
  viewportWidth,
  forceMobilePreview = false
}: {
  viewportWidth: number | null;
  forceMobilePreview?: boolean;
}) {
  return forceMobilePreview || (viewportWidth !== null && viewportWidth <= MOBILE_LIBRARY_MASONRY_MAX_WIDTH);
}

export function shouldUseMobileXiaohongshuMasonry({
  selectedPlatform,
  viewportWidth,
  forceMobilePreview = false
}: {
  selectedPlatform: string;
  viewportWidth: number | null;
  forceMobilePreview?: boolean;
}) {
  return selectedPlatform === "Xiaohongshu"
    && shouldUseCompactMobileLibraryLayout({ viewportWidth, forceMobilePreview });
}
