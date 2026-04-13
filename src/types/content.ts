import { EnvironmentValue } from "@/types/environment";
import { ProblemTag } from "@/types/problemTag";

export type ContentType = "video" | "article" | "post";
export type ContentPlatform = "Bilibili" | "Xiaohongshu" | "Zhihu" | "YouTube" | "Instagram";
export type ContentLanguageCode = "zh" | "en";
export type ContentSubtitleAvailability = "english" | "zh" | "zh_en" | "none" | "unknown" | "not_needed";

export type ContentItem = {
  id: string;
  title: string;
  sourceTitle?: string;
  originalTitle?: string;
  displayTitleZh?: string;
  secondaryTitleZh?: string;
  displayTitleEn?: string;
  focusLineEn?: string;
  creatorId: string;
  platform: ContentPlatform;
  type: ContentType;
  levels: string[];
  skills: string[];
  problemTags: ProblemTag[];
  language: ContentLanguageCode;
  contentLanguage?: ContentLanguageCode;
  subtitleAvailability?: ContentSubtitleAvailability;
  summary: string;
  reason: string;
  useCases: string[];
  coachReason: string;
  thumbnail?: string;
  duration?: string;
  viewCount?: number;
  url: string;
  environment?: EnvironmentValue;
};
