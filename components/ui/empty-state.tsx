import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** The shared "nothing here yet" block used by tables and document galleries. */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-field bg-surface-sunken px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? (
        <span className="grid size-11 place-items-center rounded-full bg-brand-tint text-brand-700">
          {icon}
        </span>
      ) : null}

      <p className="mt-3 text-sm font-bold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-xs leading-6 text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
