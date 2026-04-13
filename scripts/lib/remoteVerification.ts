import { resolve } from "node:path";
import { buildCatalogCorpus } from "../../src/lib/content-catalog/normalize";
import type { ContentItem } from "../../src/types/content";

export type RemoteLinkStatus = "reachable" | "dead" | "timeout" | "blocked" | "ambiguous";
export type RemoteThumbnailStatus = RemoteLinkStatus | "missing";

export type RemoteVerificationTarget = {
  contentId: string;
  platform: ContentItem["platform"];
  canonicalUrl: string;
  thumbnailUrl: string | null;
};

export type RemoteFetchOutcomeInput = {
  ok?: boolean;
  status?: number | null;
  finalUrl?: string | null;
  errorName?: string | null;
  errorMessage?: string | null;
};

export type RemoteFetchOutcome = {
  status: RemoteLinkStatus;
  needsManualReview: boolean;
  errorReason: string;
};

export type RemoteVerificationRecord = {
  contentId: string;
  platform: ContentItem["platform"];
  canonicalUrl: string;
  thumbnailUrl: string | null;
  checkedAt: string;
  linkStatus: RemoteLinkStatus;
  httpStatus: number | null;
  finalUrl: string | null;
  thumbnailStatus: RemoteThumbnailStatus;
  errorReason: string;
  needsManualReview: boolean;
};

export type ThumbnailVerificationPlan =
  | {
      mode: "missing";
      thumbnailStatus: "missing";
      errorReason: "thumbnail_missing";
      needsManualReview: true;
    }
  | {
      mode: "uncheckable";
      thumbnailStatus: "ambiguous";
      errorReason: string;
      needsManualReview: true;
    }
  | {
      mode: "remote";
      thumbnailUrl: string;
    }
  | {
      mode: "local";
      assetPath: string;
    };

function escapeCsvValue(value: string | number | boolean | null): string {
  if (value === null) {
    return "";
  }

  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }

  return text;
}

export function buildRemoteVerificationTargets(input: {
  contents: ContentItem[];
  expandedContents: ContentItem[];
}): RemoteVerificationTarget[] {
  const catalog = buildCatalogCorpus({
    curatedContents: input.contents,
    expandedContents: input.expandedContents
  });

  return catalog
    .filter((item) => item.mediaType === "video" && item.rightsStatus === "direct_source")
    .map((item) => ({
      contentId: item.id,
      platform: item.sourcePlatform,
      canonicalUrl: item.canonicalUrl,
      thumbnailUrl: item.display.thumbnail ?? null
    }));
}

export function classifyFetchOutcome(input: RemoteFetchOutcomeInput): RemoteFetchOutcome {
  if (input.errorName === "AbortError") {
    return {
      status: "timeout",
      needsManualReview: true,
      errorReason: input.errorMessage ?? "request_timeout"
    };
  }

  const status = input.status ?? null;

  if (typeof status === "number") {
    if (status >= 200 && status < 300 && input.ok) {
      return {
        status: "reachable",
        needsManualReview: false,
        errorReason: ""
      };
    }

    if (status === 401 || status === 403 || status === 429) {
      return {
        status: "blocked",
        needsManualReview: true,
        errorReason: input.errorMessage ?? `http_${status}`
      };
    }

    if (status === 404 || status === 410) {
      return {
        status: "dead",
        needsManualReview: true,
        errorReason: input.errorMessage ?? `http_${status}`
      };
    }

    return {
      status: "ambiguous",
      needsManualReview: true,
      errorReason: input.errorMessage ?? `http_${status}`
    };
  }

  return {
    status: "ambiguous",
    needsManualReview: true,
    errorReason: input.errorMessage ?? "unknown_error"
  };
}

export function planThumbnailVerification(input: {
  thumbnailUrl: string | null;
  publicRoot: string;
}): ThumbnailVerificationPlan {
  if (!input.thumbnailUrl) {
    return {
      mode: "missing",
      thumbnailStatus: "missing",
      errorReason: "thumbnail_missing",
      needsManualReview: true
    };
  }

  if (input.thumbnailUrl.startsWith("http://") || input.thumbnailUrl.startsWith("https://")) {
    return {
      mode: "remote",
      thumbnailUrl: input.thumbnailUrl
    };
  }

  if (input.thumbnailUrl.startsWith("/")) {
    return {
      mode: "local",
      assetPath: resolve(input.publicRoot, `.${input.thumbnailUrl}`)
    };
  }

  return {
    mode: "uncheckable",
    thumbnailStatus: "ambiguous",
    errorReason: "thumbnail_url_uncheckable",
    needsManualReview: true
  };
}

export function renderRemoteVerificationCsv(records: RemoteVerificationRecord[]): string {
  const header = [
    "contentId",
    "platform",
    "canonicalUrl",
    "thumbnailUrl",
    "checkedAt",
    "linkStatus",
    "httpStatus",
    "finalUrl",
    "thumbnailStatus",
    "errorReason",
    "needsManualReview"
  ];

  const lines = [header.join(",")];
  for (const record of records) {
    lines.push([
      escapeCsvValue(record.contentId),
      escapeCsvValue(record.platform),
      escapeCsvValue(record.canonicalUrl),
      escapeCsvValue(record.thumbnailUrl),
      escapeCsvValue(record.checkedAt),
      escapeCsvValue(record.linkStatus),
      escapeCsvValue(record.httpStatus),
      escapeCsvValue(record.finalUrl),
      escapeCsvValue(record.thumbnailStatus),
      escapeCsvValue(record.errorReason),
      escapeCsvValue(record.needsManualReview)
    ].join(","));
  }

  return `${lines.join("\n")}\n`;
}
