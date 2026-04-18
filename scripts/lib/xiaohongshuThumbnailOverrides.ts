import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type UnknownRecord = Record<string, unknown>;

export type XiaohongshuThumbnailOverride = {
  candidateId: string;
  creatorProgramId: string;
  postId: string;
  rawUrl: string;
  title: string;
  thumbnailUrl: string;
  extractedFrom: string;
  checkedAt: string;
};

export type XiaohongshuThumbnailFetchFailure = {
  candidateId: string;
  creatorProgramId: string;
  postId: string | null;
  rawUrl: string;
  title: string;
  reason: string;
  checkedAt: string;
};

export type XiaohongshuThumbnailOverrideArtifact = {
  version: 1;
  generatedAt: string;
  methodology: {
    extractor: "cloned_local_chrome_profile_headless_dump_dom";
    chromeProfile: "Default";
    tempProfileDir: string;
  };
  overrides: XiaohongshuThumbnailOverride[];
  failures: XiaohongshuThumbnailFetchFailure[];
};

const OVERRIDES_PATH = resolve(process.cwd(), "ops/quality/xiaohongshu-thumbnail-overrides.json");
const INITIAL_STATE_MARKER = "window.__INITIAL_STATE__=";
const PROFILE_NOTE_CARD_PATTERN =
  /<section[^>]*class="note-item"[\s\S]*?<a[^>]*class="cover[^"]*"[^>]*href="([^"]+)"[\s\S]*?<img[^>]*src="([^"]+)"[\s\S]*?<a[^>]*class="title"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/g;

function isObject(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUrl(url: string): string {
  return url.replace(/^http:\/\//i, "https://");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function parseInitialState(rawState: string): unknown {
  const normalized = rawState
    .trim()
    .replace(/;$/, "")
    // Xiaohongshu embeds a JS object literal, not strict JSON; bare undefined values are common.
    .replace(/\bundefined\b/g, "null");
  return JSON.parse(normalized);
}

function extractInitialStateSegment(html: string): string | null {
  const markerIndex = html.indexOf(INITIAL_STATE_MARKER);
  if (markerIndex < 0) {
    return null;
  }

  const stateStart = markerIndex + INITIAL_STATE_MARKER.length;
  const scriptEnd = html.indexOf("</script>", stateStart);
  if (scriptEnd < 0) {
    return null;
  }

  return html.slice(stateStart, scriptEnd);
}

function pickImageUrl(note: UnknownRecord): { thumbnailUrl: string; extractedFrom: string } | null {
  const imageList = Array.isArray(note.imageList) ? note.imageList : [];
  const firstImage = imageList.find((image) => isObject(image));

  if (!firstImage || !isObject(firstImage)) {
    return null;
  }

  const urlDefault = normalizeString(firstImage.urlDefault);
  if (urlDefault) {
    return {
      thumbnailUrl: normalizeUrl(urlDefault),
      extractedFrom: "note.imageList[0].urlDefault"
    };
  }

  const urlPre = normalizeString(firstImage.urlPre);
  if (urlPre) {
    return {
      thumbnailUrl: normalizeUrl(urlPre),
      extractedFrom: "note.imageList[0].urlPre"
    };
  }

  const infoList = Array.isArray(firstImage.infoList) ? firstImage.infoList : [];
  for (const imageInfo of infoList) {
    if (!isObject(imageInfo)) {
      continue;
    }

    const imageScene = normalizeString(imageInfo.imageScene);
    const imageUrl = normalizeString(imageInfo.url);
    if (imageUrl && (imageScene === "WB_DFT" || imageScene === "WB_PRV")) {
      return {
        thumbnailUrl: normalizeUrl(imageUrl),
        extractedFrom: `note.imageList[0].infoList.${imageScene}`
      };
    }
  }

  return null;
}

export function extractXiaohongshuInitialStateFromHtml(html: string): unknown | null {
  const rawState = extractInitialStateSegment(html);
  if (!rawState) {
    return null;
  }

  return parseInitialState(rawState);
}

export function extractXiaohongshuThumbnailFromInitialState(
  state: unknown,
  postId?: string
): { thumbnailUrl: string; extractedFrom: string } | null {
  if (!isObject(state) || !isObject(state.note) || !isObject(state.note.noteDetailMap)) {
    return null;
  }

  const noteDetailMap = state.note.noteDetailMap as UnknownRecord;
  const preferredKeys = postId && isObject(noteDetailMap[postId]) ? [postId] : [];
  const noteKeys = preferredKeys.length > 0 ? preferredKeys : Object.keys(noteDetailMap);

  for (const noteKey of noteKeys) {
    const detail = noteDetailMap[noteKey];
    if (!isObject(detail) || !isObject(detail.note)) {
      continue;
    }

    const selectedImage = pickImageUrl(detail.note);
    if (selectedImage) {
      return selectedImage;
    }
  }

  return null;
}

export function extractXiaohongshuThumbnailFromHtml(
  html: string,
  postId?: string
): { thumbnailUrl: string; extractedFrom: string } | null {
  const state = extractXiaohongshuInitialStateFromHtml(html);
  if (!state) {
    return null;
  }

  return extractXiaohongshuThumbnailFromInitialState(state, postId);
}

export function extractXiaohongshuProfileCardThumbnailsFromHtml(html: string): Array<{
  postId: string;
  rawUrl: string;
  thumbnailUrl: string;
  title: string;
}> {
  const matches: Array<{ postId: string; rawUrl: string; thumbnailUrl: string; title: string }> = [];

  for (const match of html.matchAll(PROFILE_NOTE_CARD_PATTERN)) {
    const rawHref = decodeHtmlEntities(normalizeString(match[1]));
    const thumbnailUrl = normalizeUrl(decodeHtmlEntities(normalizeString(match[2])));
    const title = decodeHtmlEntities(stripTags(normalizeString(match[3])));
    const postId = normalizeString(rawHref.match(/\/user\/profile\/[^/?#]+\/([^/?#]+)/i)?.[1]);

    if (!rawHref || !thumbnailUrl || !title || !postId) {
      continue;
    }

    matches.push({
      postId,
      rawUrl: rawHref.startsWith("http") ? rawHref : `https://www.xiaohongshu.com${rawHref}`,
      thumbnailUrl,
      title
    });
  }

  return matches;
}

export function buildXiaohongshuThumbnailOverrideMap(
  artifact: XiaohongshuThumbnailOverrideArtifact | null
): Record<string, string> {
  if (!artifact) {
    return {};
  }

  const map: Record<string, string> = {};
  for (const override of artifact.overrides) {
    if (override.postId && override.thumbnailUrl) {
      map[override.postId] = override.thumbnailUrl;
    }
  }
  return map;
}

export function loadXiaohongshuThumbnailOverrides(
  filePath = OVERRIDES_PATH
): XiaohongshuThumbnailOverrideArtifact | null {
  if (!existsSync(filePath)) {
    return null;
  }

  const parsed = JSON.parse(readFileSync(filePath, "utf8")) as UnknownRecord;
  if (parsed.version !== 1) {
    throw new Error("xiaohongshu thumbnail overrides version must be 1");
  }

  const overrides = Array.isArray(parsed.overrides) ? parsed.overrides : [];
  const failures = Array.isArray(parsed.failures) ? parsed.failures : [];

  return {
    version: 1,
    generatedAt: normalizeString(parsed.generatedAt),
    methodology: {
      extractor: "cloned_local_chrome_profile_headless_dump_dom",
      chromeProfile: "Default",
      tempProfileDir: normalizeString((parsed.methodology as UnknownRecord | undefined)?.tempProfileDir)
    },
    overrides: overrides.map((entry) => {
      if (!isObject(entry)) {
        throw new Error("xiaohongshu thumbnail overrides entries must be objects");
      }

      return {
        candidateId: normalizeString(entry.candidateId),
        creatorProgramId: normalizeString(entry.creatorProgramId),
        postId: normalizeString(entry.postId),
        rawUrl: normalizeString(entry.rawUrl),
        title: normalizeString(entry.title),
        thumbnailUrl: normalizeString(entry.thumbnailUrl),
        extractedFrom: normalizeString(entry.extractedFrom),
        checkedAt: normalizeString(entry.checkedAt)
      };
    }),
    failures: failures.map((entry) => {
      if (!isObject(entry)) {
        throw new Error("xiaohongshu thumbnail override failures must be objects");
      }

      return {
        candidateId: normalizeString(entry.candidateId),
        creatorProgramId: normalizeString(entry.creatorProgramId),
        postId: normalizeString(entry.postId) || null,
        rawUrl: normalizeString(entry.rawUrl),
        title: normalizeString(entry.title),
        reason: normalizeString(entry.reason),
        checkedAt: normalizeString(entry.checkedAt)
      };
    })
  };
}
