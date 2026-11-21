import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Label, control and error message as one unit.
 *
 * The control arrives as a render prop instead of a plain child so the field
 * can hand it the wiring it needs — `id`, `aria-describedby`, `aria-invalid` —
 * without the caller repeating three attributes on every input and eventually
 * forgetting one.
 */

export type FieldControlProps = {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": boolean;
};

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
};

export function Field({
  id,
  label,
  error,
  hint,
  required = false,
  className,
  children,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="text-danger-text" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": Boolean(error),
      })}

      {error ? (
        <p id={`${id}-error`} className="text-xs leading-5 text-danger-text" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
