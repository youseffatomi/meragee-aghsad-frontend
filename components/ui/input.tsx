import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A native input, styled once.
 *
 * `invalid` is a prop rather than a class the caller appends, because it has to
 * drive both the border colour and `aria-invalid` — a purely visual error state
 * is invisible to a screen reader.
 *
 * No `forwardRef`: in React 19 `ref` is an ordinary prop, which is what
 * react-hook-form needs.
 */

type InputProps = ComponentProps<"input"> & {
  invalid?: boolean;
};

export function Input({ invalid = false, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-field border bg-surface px-4 text-base text-ink sm:text-sm",
        "placeholder:text-ink-muted/70",
        "transition-[border-color,box-shadow] duration-150 outline-none",
        "border-line focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15",
        "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted",
        invalid && "border-danger focus:border-danger focus:ring-danger/15",
        className,
      )}
      {...props}
      aria-invalid={invalid || undefined}
    />
  );
}
