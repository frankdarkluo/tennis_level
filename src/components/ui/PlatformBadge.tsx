"use client";

import { HTMLAttributes } from "react";
import { CreatorPlatformName } from "@/types/creator";
import { getPlatformDisplayName } from "@/lib/content/display";
import { useI18n } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export type PlatformName = CreatorPlatformName;
type PlatformBadgeSize = "sm" | "md";

const platformStyles: Record<PlatformName, { wrapper: string; icon: string }> = {
  Bilibili: {
    wrapper: "border-sky-100 bg-sky-50 text-sky-700",
    icon: "text-sky-700"
  },
  YouTube: {
    wrapper: "border-rose-100 bg-rose-50 text-rose-700",
    icon: "text-rose-700"
  },
  Xiaohongshu: {
    wrapper: "border-pink-100 bg-pink-50 text-pink-700",
    icon: "text-pink-700"
  },
  Zhihu: {
    wrapper: "border-blue-100 bg-blue-50 text-blue-700",
    icon: "text-blue-700"
  },
  Instagram: {
    wrapper: "border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700",
    icon: "text-fuchsia-700"
  }
};

const sizeStyles: Record<PlatformBadgeSize, { wrapper: string; icon: string }> = {
  sm: {
    wrapper: "gap-1.5 px-2.5 py-1 text-xs",
    icon: "h-3.5 w-3.5"
  },
  md: {
    wrapper: "gap-2 px-3 py-1.5 text-sm",
    icon: "h-4 w-4"
  }
};

export function PlatformIcon({
  platform,
  className,
  size = "sm"
}: {
  platform: PlatformName;
  className?: string;
  size?: PlatformBadgeSize;
}) {
  const iconSizeClass = sizeStyles[size].icon;

  if (platform === "Bilibili") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className={cn(iconSizeClass, className)}>
        <path
          d="M6.5 4.5 5 2.8m8.5 1.7L15 2.8M5.7 6.2h8.6c1.3 0 2.3 1 2.3 2.3v4.8c0 1.3-1 2.3-2.3 2.3H5.7c-1.3 0-2.3-1-2.3-2.3V8.5c0-1.3 1-2.3 2.3-2.3Zm1.8 3 1.7 1.3-1.7 1.3m5-2.6h-2.2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
        />
      </svg>
    );
  }

  if (platform === "YouTube") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className={cn(iconSizeClass, className)}>
        <path
          d="M16.7 6.7c-.2-.8-.8-1.4-1.6-1.6C13.7 4.7 10 4.7 10 4.7s-3.7 0-5.1.4c-.8.2-1.4.8-1.6 1.6-.4 1.4-.4 3.3-.4 3.3s0 1.9.4 3.3c.2.8.8 1.4 1.6 1.6 1.4.4 5.1.4 5.1.4s3.7 0 5.1-.4c.8-.2 1.4-.8 1.6-1.6.4-1.4.4-3.3.4-3.3s0-1.9-.4-3.3ZM8.5 12.8V7.2l4.7 2.8-4.7 2.8Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (platform === "Xiaohongshu") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className={cn(iconSizeClass, className)}>
        <rect x="3" y="3" width="14" height="14" rx="4" fill="currentColor" opacity="0.12" />
        <path
          d="M6.3 7.1c1.1-.7 2.5-.9 3.7-.5m-2.9 2.2c1-.6 2.2-.8 3.3-.4m-3 2.1h5.2m-4.3 2h3.2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (platform === "Zhihu") {
    return (
      <svg viewBox="0 0 20 20" aria-hidden="true" className={cn(iconSizeClass, className)}>
        <rect x="3" y="4" width="14" height="12" rx="3" fill="currentColor" opacity="0.12" />
        <path
          d="M6.2 7.3h4.4m-4.4 2.4h6.3m-6.3 2.4h7.6m-2.2-4.8v5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className={cn(iconSizeClass, className)}>
      <rect x="4" y="4" width="12" height="12" rx="4" fill="currentColor" opacity="0.12" />
      <circle cx="10" cy="10" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.2" cy="5.8" r="1" fill="currentColor" />
    </svg>
  );
}

export function PlatformBadge(
  {
    platform,
    className,
    size = "sm",
    ...props
  }: HTMLAttributes<HTMLSpanElement> & { platform: PlatformName; size?: PlatformBadgeSize }
) {
  const { language } = useI18n();
  const style = platformStyles[platform];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        style.wrapper,
        sizeStyle.wrapper,
        className
      )}
      {...props}
    >
      <PlatformIcon platform={platform} className={style.icon} size={size} />
      <span>{getPlatformDisplayName(platform, language)}</span>
    </span>
  );
}
