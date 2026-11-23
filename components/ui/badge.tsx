import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A compact label for a role or a status.
 *
 * Tones are semantic rather than colour names, so a caller never has to know
 * which palette step is readable on which surface.
 */

type BadgeTone = "neutral" | "brand" | "success" | "danger" | "info";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-ink-muted",
  brand: "bg-brand-soft text-brand-text",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger-text",
  info: "bg-brand-tint text-brand-800",
};

type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-bold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
