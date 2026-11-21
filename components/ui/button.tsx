import type { ComponentProps } from "react";

import { cn } from "@/lib/utils/cn";
import { Spinner } from "./spinner";

/**
 * The one button in the product.
 *
 * `primary` uses `--brand-700` rather than the design's `--brand-500`: white
 * text on the 500 step measures 2.9:1 and fails WCAG AA, while the 700 step
 * measures 5.7:1 and keeps the same hue. The lighter steps stay available for
 * fills and decoration, where contrast is not a text concern.
 */

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-700 text-white shadow-card hover:bg-brand-800 active:bg-brand-900",
  secondary:
    "border border-line bg-surface text-ink hover:bg-surface-sunken active:bg-surface-muted",
  ghost: "text-ink-muted hover:bg-surface-muted hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger-text",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 gap-1.5 rounded-field px-3 text-xs",
  md: "h-11 gap-2 rounded-field px-5 text-sm",
  lg: "h-12 gap-2 rounded-field px-6 text-sm",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  /** Disables the button and swaps the leading icon slot for a spinner. */
  isLoading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium whitespace-nowrap",
        "transition-colors duration-150 select-none",
        "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none",
        "disabled:pointer-events-none disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </button>
  );
}
