import { resolve } from "node:path";
import { buildCatalogCorpus } from "../../src/lib/content-catalog/normalize";
import type { ContentItem } from "../../src/types/content";

export type RemoteLinkStatus =
  | "reachable"
  | "dead"
  | "timeout"
  | "blocked"
  | "network_error"
  | "redirect_unverified"
  | "unsupported"
  | "ambiguous";
export type RemoteThumbnailStatus = RemoteLinkStatus | "missing";
export type RemoteFailureClass =
  | "network_runtime_failure"
  | "platform_blocking"
  | "redirect_unverified"
  | "unsupported_surface"
  | "unknown";
export type VerificationSurface = "canonical_url" | "remote_thumbnail" | "local_thumbnail_asset";

export type RemoteVerificationTarget = {
  contentId: string;
  platform: ContentItem["platform"];
  canonicalUrl: string;
  thumbnailUrl: string | null;
};

export type RemoteFetchOutcomeInput = {
  verificationSurface: Exclude<VerificationSurface, "local_thumbnail_asset">;
  originalUrl: string;
  ok?: boolean;
  status?: number | null;
  finalUrl?: string | null;
  errorName?: string | null;
  errorMessage?: string | null;
  errorCode?: string | null;
};

export type RemoteFetchOutcome = {
  status: RemoteLinkStatus;
  failureClass: RemoteFailureClass | null;
  verificationSurface: Exclude<VerificationSurface, "local_thumbnail_asset">;
  decisionReason: string;
  retrySuggested: boolean;
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
  verificationSurface: "canonical_url";
  failureClass: RemoteFailureClass | null;
  decisionReason: string;
  retrySuggested: boolean;
  thumbnailStatus: RemoteThumbnailStatus;
  thumbnailDecisionReason: string;
  errorReason: string;
  needsManualReview: boolean;
};

export type ThumbnailVerificationPlan =
  | {
      mode: "missing";
      thumbnailStatus: "missing";
      errorReason: "thumbnail_missing";
      decisionReason: "thumbnail_missing";
      needsManualReview: true;
    }
  | {
      mode: "uncheckable";
      thumbnailStatus: "unsupported";
      errorReason: string;
      decisionReason: "unsupported_verification_surface";
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

const NETWORK_ERROR_PATTERNS = [
  "fetch failed",
  "network",
  "econnreset",
  "enotfound",
  "eai_again",
  "timed out",
  "timeout",
  "socket hang up",
  "connection refused",
  "tls",
  "certificate"
];
const BLOCKING_PATTERNS = [
  "captcha",
  "challenge",
  "bot",
  "forbidden",
  "access denied",
  "blocked by"
];
const UNSUPPORTED_SURFACE_PATTERNS = [
  "/results",
  "/search",
  "/playlist",
  "/channel",
  "/channels",
  "/user/",
  "/login",
  "/signin",
  "/consent",
  "/account",
  "/embed/"
];
const BLOCKED_SURFACE_PATTERNS = [
  "/challenge",
  "/captcha",
  "/verify",
  "/blocked"
];

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

function normalizeText(value?: string | null): string {
  return value?.trim().toLowerCase() ?? "";
}

function parseHttpUrl(input: string | null | undefined): URL | null {
  if (!input) {
    return null;
  }

  try {
    const url = new URL(input);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function matchesAnyPattern(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => value.includes(pattern));
}

function isLikelyNetworkRuntimeFailure(input: RemoteFetchOutcomeInput): boolean {
  const normalizedMessage = normalizeText(input.errorMessage);
  const normalizedCode = normalizeText(input.errorCode);
  return matchesAnyPattern(normalizedMessage, NETWORK_ERROR_PATTERNS) || matchesAnyPattern(normalizedCode, NETWORK_ERROR_PATTERNS);
}

function isLikelyPlatformBlocking(input: RemoteFetchOutcomeInput): boolean {
  const normalizedMessage = normalizeText(input.errorMessage);
  const normalizedCode = normalizeText(input.errorCode);
  return matchesAnyPattern(normalizedMessage, BLOCKING_PATTERNS) || matchesAnyPattern(normalizedCode, BLOCKING_PATTERNS);
}

function hasSupportedCanonicalSurface(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  const path = url.pathname.toLowerCase();

  if (host === "youtu.be") {
    return path.length > 1;
  }

  if (host === "youtube.com" || host === "www.youtube.com" || host === "m.youtube.com") {
    return path === "/watch" || path.startsWith("/shorts/") || path.startsWith("/live/");
  }

  if (host === "bilibili.com" || host === "www.bilibili.com" || host === "m.bilibili.com") {
    return path.startsWith("/video/") || path.startsWith("/medialist/play/");
  }

  if (host === "xiaohongshu.com" || host === "www.xiaohongshu.com") {
    return path.startsWith("/explore/") || path.startsWith("/discovery/item/");
  }

  if (host === "instagram.com" || host === "www.instagram.com" || host === "m.instagram.com") {
    return path.startsWith("/p/") || path.startsWith("/reel/") || path.startsWith("/tv/");
  }

  return false;
}

function classifySurfaceRedirect(
  originalUrl: URL,
  finalUrl: URL
): Pick<RemoteFetchOutcome, "status" | "failureClass" | "decisionReason" | "retrySuggested" | "needsManualReview" | "errorReason"> | null {
  const finalHref = finalUrl.toString();
  const normalizedFinalHref = finalHref.toLowerCase();

  if (matchesAnyPattern(normalizedFinalHref, BLOCKED_SURFACE_PATTERNS)) {
    return {
      status: "blocked",
      failureClass: "platform_blocking",
      decisionReason: "redirected_to_platform_blocking_surface",
      retrySuggested: false,
      needsManualReview: true,
      errorReason: "redirected_to_platform_blocking_surface"
    };
  }

  if (matchesAnyPattern(normalizedFinalHref, UNSUPPORTED_SURFACE_PATTERNS)) {
    return {
      status: "unsupported",
      failureClass: "unsupported_surface",
      decisionReason: "unsupported_verification_surface",
      retrySuggested: false,
      needsManualReview: true,
      errorReason: "unsupported_verification_surface"
    };
  }

  if (originalUrl.toString() !== finalHref) {
    return {
      status: "redirect_unverified",
      failureClass: "redirect_unverified",
      decisionReason: "redirected_to_unverified_surface",
      retrySuggested: false,
      needsManualReview: true,
      errorReason: "redirected_to_unverified_surface"
    };
  }

  return null;
}

function buildOutcome(
  input: RemoteFetchOutcomeInput,
  output: Omit<RemoteFetchOutcome, "verificationSurface">
): RemoteFetchOutcome {
  return {
    ...output,
    verificationSurface: input.verificationSurface
  };
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
  const originalUrl = parseHttpUrl(input.originalUrl);
  if (!originalUrl) {
    return buildOutcome(input, {
      status: "unsupported",
      failureClass: "unsupported_surface",
      decisionReason: "unsupported_verification_surface",
      retrySuggested: false,
      needsManualReview: true,
      errorReason: input.errorMessage ?? "unsupported_verification_surface"
    });
  }

  if (input.errorName === "AbortError") {
    return buildOutcome(input, {
      status: "timeout",
      failureClass: "network_runtime_failure",
      decisionReason: "abort_timeout",
      retrySuggested: true,
      needsManualReview: true,
      errorReason: input.errorMessage ?? "request_timeout"
    });
  }

  const normalizedMessage = normalizeText(input.errorMessage);

  if (normalizedMessage.includes("failed to parse url")) {
    return buildOutcome(input, {
      status: "unsupported",
      failureClass: "unsupported_surface",
      decisionReason: "unsupported_verification_surface",
      retrySuggested: false,
      needsManualReview: true,
      errorReason: input.errorMessage ?? "unsupported_verification_surface"
    });
  }

  if (isLikelyPlatformBlocking(input)) {
    return buildOutcome(input, {
      status: "blocked",
      failureClass: "platform_blocking",
      decisionReason: "platform_blocking_signal",
      retrySuggested: false,
      needsManualReview: true,
      errorReason: input.errorMessage ?? "platform_blocking_signal"
    });
  }

  if (isLikelyNetworkRuntimeFailure(input)) {
    return buildOutcome(input, {
      status: "network_error",
      failureClass: "network_runtime_failure",
      decisionReason: "network_runtime_error",
      retrySuggested: true,
      needsManualReview: true,
      errorReason: input.errorMessage ?? "network_runtime_error"
    });
  }

  const status = input.status ?? null;
  const finalUrl = parseHttpUrl(input.finalUrl ?? input.originalUrl);

  if (typeof status === "number") {
    if (status >= 200 && status < 300 && input.ok) {
      if (!finalUrl) {
        return buildOutcome(input, {
          status: "unsupported",
          failureClass: "unsupported_surface",
          decisionReason: "unsupported_verification_surface",
          retrySuggested: false,
          needsManualReview: true,
          errorReason: "unsupported_verification_surface"
        });
      }

      if (input.verificationSurface === "canonical_url") {
        if (hasSupportedCanonicalSurface(finalUrl)) {
          return buildOutcome(input, {
            status: "reachable",
            failureClass: null,
            decisionReason: "http_ok_supported_surface",
            retrySuggested: false,
            needsManualReview: false,
            errorReason: ""
          });
        }

        const redirected = classifySurfaceRedirect(originalUrl, finalUrl);
        if (redirected) {
          return buildOutcome(input, redirected);
        }

        return buildOutcome(input, {
          status: "ambiguous",
          failureClass: "unknown",
          decisionReason: "http_ok_unknown_surface",
          retrySuggested: true,
          needsManualReview: true,
          errorReason: input.errorMessage ?? "http_ok_unknown_surface"
        });
      }

      return buildOutcome(input, {
        status: "reachable",
        failureClass: null,
        decisionReason: "http_ok_supported_surface",
        retrySuggested: false,
        needsManualReview: false,
        errorReason: ""
      });
    }

    if (status === 401 || status === 403) {
      return buildOutcome(input, {
        status: "blocked",
        failureClass: "platform_blocking",
        decisionReason: `http_${status}`,
        retrySuggested: false,
        needsManualReview: true,
        errorReason: input.errorMessage ?? `http_${status}`
      });
    }

    if (status === 429) {
      return buildOutcome(input, {
        status: "blocked",
        failureClass: "platform_blocking",
        decisionReason: "http_429",
        retrySuggested: true,
        needsManualReview: true,
        errorReason: input.errorMessage ?? "http_429"
      });
    }

    if (status === 404 || status === 410) {
      return buildOutcome(input, {
        status: "dead",
        failureClass: null,
        decisionReason: `http_${status}`,
        retrySuggested: false,
        needsManualReview: true,
        errorReason: input.errorMessage ?? `http_${status}`
      });
    }

    if (status === 405 || status === 451) {
      return buildOutcome(input, {
        status: "unsupported",
        failureClass: "unsupported_surface",
        decisionReason: `http_${status}`,
        retrySuggested: false,
        needsManualReview: true,
        errorReason: input.errorMessage ?? `http_${status}`
      });
    }

    if (status >= 300 && status < 400) {
      return buildOutcome(input, {
        status: "redirect_unverified",
        failureClass: "redirect_unverified",
        decisionReason: `http_${status}_redirect`,
        retrySuggested: false,
        needsManualReview: true,
        errorReason: input.errorMessage ?? `http_${status}_redirect`
      });
    }

    return buildOutcome(input, {
      status: "ambiguous",
      failureClass: "unknown",
      decisionReason: `http_${status}`,
      retrySuggested: status >= 500,
      needsManualReview: true,
      errorReason: input.errorMessage ?? `http_${status}`
    });
  }

  return buildOutcome(input, {
    status: "ambiguous",
    failureClass: "unknown",
    decisionReason: "unknown_result",
    retrySuggested: true,
    needsManualReview: true,
    errorReason: input.errorMessage ?? "unknown_error"
  });
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
      decisionReason: "thumbnail_missing",
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
    thumbnailStatus: "unsupported",
    errorReason: "unsupported_verification_surface",
    decisionReason: "unsupported_verification_surface",
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
    "verificationSurface",
    "failureClass",
    "decisionReason",
    "retrySuggested",
    "thumbnailStatus",
    "thumbnailDecisionReason",
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
      escapeCsvValue(record.verificationSurface),
      escapeCsvValue(record.failureClass),
      escapeCsvValue(record.decisionReason),
      escapeCsvValue(record.retrySuggested),
      escapeCsvValue(record.thumbnailStatus),
      escapeCsvValue(record.thumbnailDecisionReason),
      escapeCsvValue(record.errorReason),
      escapeCsvValue(record.needsManualReview)
    ].join(","));
  }

  return `${lines.join("\n")}\n`;
}
