export const MOBILE_LIBRARY_MASONRY_MAX_WIDTH = 480;

export function shouldUseMobileXiaohongshuMasonry({
  selectedPlatform,
  viewportWidth
}: {
  selectedPlatform: string;
  viewportWidth: number | null;
}) {
  return selectedPlatform === "Xiaohongshu"
    && viewportWidth !== null
    && viewportWidth <= MOBILE_LIBRARY_MASONRY_MAX_WIDTH;
}
