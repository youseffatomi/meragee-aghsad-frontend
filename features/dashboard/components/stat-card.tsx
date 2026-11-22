import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A single headline figure (customers, sold products, collected amount).
 *
 * The icon carries no meaning the label does not already say, so it stays
 * decorative and tinted; `accent` is reserved for the one money figure the
 * design wants to stand out.
 */

type StatCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: boolean;
};

export function StatCard({ label, value, icon, accent = false }: StatCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-tile bg-brand-tint text-brand-text">
          {icon}
        </span>
        <span className="text-xs text-ink-muted">{label}</span>
      </div>

      <p className={cn("text-3xl font-bold", accent ? "text-brand-text" : "text-ink")}>
        {value}
      </p>
    </article>
  );
}
