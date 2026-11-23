import type { ComponentProps } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

/**
 * A native `<select>`, styled to match `Input`.
 *
 * Native is deliberate: it keeps keyboard behaviour, mobile pickers and screen
 * reader semantics for free, and the option list is short enough that a custom
 * listbox would only add maintenance.
 */

type SelectProps = ComponentProps<"select"> & {
  invalid?: boolean;
};

export function Select({ invalid = false, className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-12 w-full appearance-none rounded-field border bg-surface ps-4 pe-10 text-base text-ink sm:text-sm",
          "transition-[border-color,box-shadow] duration-150 outline-none",
          "border-line focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15",
          "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted",
          invalid && "border-danger focus:border-danger focus:ring-danger/15",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        className="pointer-events-none absolute inset-y-0 end-3 my-auto size-4 text-ink-muted"
        aria-hidden="true"
      />
    </div>
  );
}
