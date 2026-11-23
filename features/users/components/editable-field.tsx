import type { ReactNode } from "react";
import { Pencil } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type EditableFieldProps = {
  id: string;
  label: string;
  value: ReactNode;
  editing: boolean;
  error?: string;
  canEdit: boolean;
  onToggle: () => void;
  className?: string;
  children: ReactNode;
};

/**
 * One profile row: label, current value, and a pencil that swaps the value for
 * an input. The control is a child so the row does not care whether it is a
 * text input, a textarea or a phone field.
 */
export function EditableField({
  id,
  label,
  value,
  editing,
  error,
  canEdit,
  onToggle,
  className,
  children,
}: EditableFieldProps) {
  return (
    <div className={cn("border-b border-line/70 py-3 last:border-b-0", className)}>
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={editing ? id : undefined} className="text-xs text-ink-muted">
          {label}
        </label>

        {canEdit ? (
          <button
            type="button"
            onClick={onToggle}
            aria-label={`ویرایش ${label}`}
            aria-pressed={editing}
            className={cn(
              "inline-flex size-7 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
              editing
                ? "bg-brand-soft text-brand-text"
                : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
            )}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-1.5">
        {editing ? (
          children
        ) : (
          <div className="min-h-6 text-sm font-medium break-words text-ink">{value}</div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs leading-5 text-danger-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
