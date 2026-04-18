import { describe, expect, it } from "vitest";
import { buildXiaohongshuThumbnailFetchTargets } from "../../scripts/lib/xiaohongshuThumbnailFetchTargets";

describe("xiaohongshu thumbnail fetch targets", () => {
  it("prefers a creator-profile note url over raw search-result urls", () => {
    const targets = buildXiaohongshuThumbnailFetchTargets({
      creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5",
      rawUrl: "https://www.xiaohongshu.com/search_result/69bbf151000000001b003add?xsec_token=abc&xsec_source=pc_search",
      canonicalUrl: "https://www.xiaohongshu.com/explore/69bbf151000000001b003add",
      postId: "69bbf151000000001b003add"
    });

    expect(targets).toEqual([
      "https://www.xiaohongshu.com/user/profile/6050684100000000010047d5/69bbf151000000001b003add?xsec_token=abc&xsec_source=pc_search",
      "https://www.xiaohongshu.com/explore/69bbf151000000001b003add",
      "https://www.xiaohongshu.com/search_result/69bbf151000000001b003add?xsec_token=abc&xsec_source=pc_search"
    ]);
  });

  it("keeps direct creator-profile note urls first when they are already stable", () => {
    const targets = buildXiaohongshuThumbnailFetchTargets({
      creatorProfileUrl: "https://www.xiaohongshu.com/user/profile/5676c499b8ce1a5b6e806853",
      rawUrl: "https://www.xiaohongshu.com/user/profile/5676c499b8ce1a5b6e806853/69d4eef5000000001b00184c?xsec_token=abc&xsec_source=pc_user",
      canonicalUrl: "https://www.xiaohongshu.com/explore/69d4eef5000000001b00184c",
      postId: "69d4eef5000000001b00184c"
    });

    expect(targets).toEqual([
      "https://www.xiaohongshu.com/user/profile/5676c499b8ce1a5b6e806853/69d4eef5000000001b00184c?xsec_token=abc&xsec_source=pc_user",
      "https://www.xiaohongshu.com/explore/69d4eef5000000001b00184c"
    ]);
  });
});
