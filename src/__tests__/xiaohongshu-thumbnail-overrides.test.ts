import { describe, expect, it } from "vitest";
import {
  extractXiaohongshuInitialStateFromHtml,
  extractXiaohongshuProfileCardThumbnailsFromHtml,
  extractXiaohongshuThumbnailFromHtml,
  extractXiaohongshuThumbnailFromInitialState
} from "../../scripts/lib/xiaohongshuThumbnailOverrides";

const HTML_FIXTURE = `<!DOCTYPE html><html><head></head><body><script>window.__INITIAL_STATE__={"note":{"noteDetailMap":{"69b5d8bc000000001f006be1":{"note":{"imageList":[{"urlDefault":"http:\\/\\/sns-webpic-qc.xhscdn.com\\/example\\/cover-default.webp","urlPre":"http:\\/\\/sns-webpic-qc.xhscdn.com\\/example\\/cover-preview.webp","infoList":[{"imageScene":"WB_PRV","url":"http:\\/\\/sns-webpic-qc.xhscdn.com\\/example\\/cover-prv.webp"},{"imageScene":"WB_DFT","url":"http:\\/\\/sns-webpic-qc.xhscdn.com\\/example\\/cover-dft.webp"}]}]}}}}}</script></body></html>`;
const HTML_WITH_UNDEFINED_FIXTURE = `<!DOCTYPE html><html><head></head><body><script>window.__INITIAL_STATE__={"note":{"noteDetailMap":{"69b5d8bc000000001f006be1":{"note":{"imageList":[{"urlDefault":"http:\\/\\/sns-webpic-qc.xhscdn.com\\/example\\/cover-default.webp"}]}}}},"ui":{"opPrompt":undefined}}</script></body></html>`;
const PROFILE_HTML_FIXTURE = `<!DOCTYPE html><html><body><section class="note-item"><div><a class="cover mask ld" target="_self" href="/user/profile/5676c499b8ce1a5b6e806853/69de436c00000000210069bc?xsec_token=abc&amp;xsec_source=pc_user" style="height: 313px;"><img src="https://sns-webpic-qc.xhscdn.com/example/profile-cover.webp" style="width: 100%; height: 100%; object-fit: cover;"></a><div class="footer"><a href="/user/profile/5676c499b8ce1a5b6e806853/69de436c00000000210069bc?xsec_token=abc&amp;xsec_source=pc_user" target="_self" class="title"><span>网球入门&amp;进阶请进，两个视角解析“上旋球”</span></a></div></div></section></body></html>`;

describe("xiaohongshu thumbnail overrides", () => {
  it("extracts initial state JSON from a rendered note page", () => {
    const state = extractXiaohongshuInitialStateFromHtml(HTML_FIXTURE);

    expect(state).toMatchObject({
      note: {
        noteDetailMap: {
          "69b5d8bc000000001f006be1": {
            note: {
              imageList: expect.any(Array)
            }
          }
        }
      }
    });
  });

  it("prefers the default image url for the matching post id and normalizes it to https", () => {
    const thumbnail = extractXiaohongshuThumbnailFromHtml(HTML_FIXTURE, "69b5d8bc000000001f006be1");

    expect(thumbnail).toEqual({
      thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/example/cover-default.webp",
      extractedFrom: "note.imageList[0].urlDefault"
    });
  });

  it("tolerates bare undefined values in xiaohongshu initial state payloads", () => {
    const thumbnail = extractXiaohongshuThumbnailFromHtml(
      HTML_WITH_UNDEFINED_FIXTURE,
      "69b5d8bc000000001f006be1"
    );

    expect(thumbnail).toEqual({
      thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/example/cover-default.webp",
      extractedFrom: "note.imageList[0].urlDefault"
    });
  });

  it("extracts thumbnail mappings from creator profile note cards", () => {
    expect(extractXiaohongshuProfileCardThumbnailsFromHtml(PROFILE_HTML_FIXTURE)).toEqual([
      {
        postId: "69de436c00000000210069bc",
        rawUrl: "https://www.xiaohongshu.com/user/profile/5676c499b8ce1a5b6e806853/69de436c00000000210069bc?xsec_token=abc&xsec_source=pc_user",
        thumbnailUrl: "https://sns-webpic-qc.xhscdn.com/example/profile-cover.webp",
        title: "网球入门&进阶请进，两个视角解析“上旋球”"
      }
    ]);
  });

  it("returns null when the initial state does not contain a usable image list", () => {
    const state = {
      note: {
        noteDetailMap: {
          abc: {
            note: {}
          }
        }
      }
    };

    expect(extractXiaohongshuThumbnailFromInitialState(state, "abc")).toBeNull();
  });
});
