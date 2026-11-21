import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * An inline message that belongs to a form or a page, not to a single field.
 * Field-level problems stay in `Field`; this is for "the code was wrong" or
 * "we could not reach the server".
 */

type Tone = "error" | "info" | "success";

const TONES: Record<Tone, string> = {
  error: "border-danger/25 bg-danger-soft text-danger-text",
  info: "border-brand-200 bg-brand-tint text-brand-800",
  success: "border-success/25 bg-success-soft text-success",
};

export function Alert({
  tone = "error",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-field border px-4 py-3 text-xs leading-6",
        TONES[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
