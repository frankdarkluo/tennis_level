"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/config";
import { getMotionPrimitiveDefinition } from "@/lib/plan/motionPrimitives";
import type { MotionPrimitiveId } from "@/types/plan";

export function MotionPrimitive({
  motionPrimitiveId,
  className = ""
}: {
  motionPrimitiveId: MotionPrimitiveId;
  className?: string;
}) {
  const { language, t } = useI18n();
  const locale: "zh" | "en" = language === "en" ? "en" : "zh";
  const definition = getMotionPrimitiveDefinition(motionPrimitiveId);
  const [playNonce, setPlayNonce] = useState(0);

  if (!definition) {
    return null;
  }

  const title = definition.title[locale];
  const caption = definition.caption[locale];

  return (
    <div className={`space-y-3 rounded-2xl border border-[var(--line)] bg-white/80 p-4 ${className}`.trim()}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{t("plan.day.motion")}</p>
          <p className="mt-1 text-sm font-medium text-slate-800">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{caption}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="shrink-0 px-3 text-sm"
          onClick={() => setPlayNonce((value) => value + 1)}
        >
          {t("plan.day.motionReplay")}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,rgba(249,250,251,0.96),rgba(226,232,240,0.85))]">
        <img
          key={`${motionPrimitiveId}-${playNonce}`}
          src={`${definition.assetPath}?play=${playNonce}`}
          alt={`${title} motion loop`}
          className="h-44 w-full object-cover"
        />
      </div>
    </div>
  );
}
