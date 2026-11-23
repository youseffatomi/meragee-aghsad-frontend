import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

/** The multi-line sibling of `Input`, with the same focus and error states. */

type TextareaProps = ComponentProps<"textarea"> & {
  invalid?: boolean;
};

export function Textarea({ invalid = false, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-field border bg-surface px-4 py-3 text-base leading-6 text-ink sm:text-sm",
        "placeholder:text-ink-muted/70",
        "transition-[border-color,box-shadow] duration-150 outline-none",
        "border-line focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15",
        "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted",
        invalid && "border-danger focus:border-danger focus:ring-danger/15",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}
