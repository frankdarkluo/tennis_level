import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-[var(--line)] bg-white p-0 shadow-soft", className)}
      {...props}
    />
  );
}
