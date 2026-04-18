function normalizeString(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function buildProfileNoteUrl(creatorProfileUrl: string, postId: string, rawUrl: string): string | null {
  const normalizedProfileUrl = normalizeString(creatorProfileUrl).replace(/\/+$/, "");
  const normalizedPostId = normalizeString(postId);
  if (!normalizedProfileUrl || !normalizedPostId) {
    return null;
  }

  const queryString = (() => {
    try {
      const parsed = new URL(rawUrl);
      return parsed.search;
    } catch {
      return "";
    }
  })();

  return `${normalizedProfileUrl}/${normalizedPostId}${queryString}`;
}

function isDirectProfileNoteUrl(rawUrl: string, creatorProfileUrl: string, postId: string): boolean {
  const normalizedRawUrl = normalizeString(rawUrl);
  const normalizedProfileUrl = normalizeString(creatorProfileUrl).replace(/\/+$/, "");
  const normalizedPostId = normalizeString(postId);

  return Boolean(
    normalizedRawUrl
    && normalizedProfileUrl
    && normalizedPostId
    && normalizedRawUrl.startsWith(`${normalizedProfileUrl}/${normalizedPostId}`)
  );
}

export function buildXiaohongshuThumbnailFetchTargets(input: {
  creatorProfileUrl: string | null;
  rawUrl: string;
  canonicalUrl: string | null;
  postId: string | null;
}): string[] {
  const creatorProfileUrl = normalizeString(input.creatorProfileUrl);
  const rawUrl = normalizeString(input.rawUrl);
  const canonicalUrl = normalizeString(input.canonicalUrl);
  const postId = normalizeString(input.postId);

  const targets: string[] = [];

  if (isDirectProfileNoteUrl(rawUrl, creatorProfileUrl, postId)) {
    targets.push(rawUrl);
  } else {
    const profileNoteUrl = buildProfileNoteUrl(creatorProfileUrl, postId, rawUrl);
    if (profileNoteUrl) {
      targets.push(profileNoteUrl);
    }
  }

  if (canonicalUrl) {
    targets.push(canonicalUrl);
  }

  if (rawUrl) {
    targets.push(rawUrl);
  }

  return [...new Set(targets)];
}
