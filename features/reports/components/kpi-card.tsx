import type { ReactNode } from "react";

import { formatPercent } from "@/lib/format/number";
import { cn } from "@/lib/utils/cn";

type KpiTone = "brand" | "success" | "danger" | "neutral" | "info";

const TONES: Record<KpiTone, { tile: string; value: string }> = {
  brand: { tile: "bg-brand-tint text-brand-text", value: "text-brand-text" },
  success: { tile: "bg-success-soft text-success", value: "text-success" },
  danger: { tile: "bg-danger-soft text-danger-text", value: "text-danger-text" },
  neutral: { tile: "bg-surface-muted text-ink-muted", value: "text-ink" },
  info: { tile: "bg-brand-tint text-brand-800", value: "text-ink" },
};

type KpiCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: KpiTone;
  unit?: string;
  hint?: string;
  /**
   * Percent change against the previous period. `null` hides the badge — used
   * for snapshot metrics where a period delta would be meaningless.
   */
  delta?: number | null;
};

/**
 * One headline figure on the financial report.
 *
 * The value is already formatted by the caller, because the same card shows
 * money, counts and percentages. `hint` is where the scope of a number lives
 * ("کل مطالبات" vs "این دوره") — the report mixes both on purpose.
 */
export function KpiCard({
  label,
  value,
  icon,
  tone = "brand",
  unit,
  hint,
  delta = null,
}: KpiCardProps) {
  const palette = TONES[tone];
  const hasDelta = delta !== null && Number.isFinite(delta);

  return (
    <article className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-ink-muted">{label}</span>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-tile",
            palette.tile,
          )}
        >
          {icon}
        </span>
      </div>

      <p className="flex flex-wrap items-baseline gap-1.5">
        <span
          className={cn(
            "text-2xl font-bold tabular-nums sm:text-[1.7rem]",
            palette.value,
          )}
        >
          {value}
        </span>
        {unit ? <span className="text-[11px] text-ink-muted">{unit}</span> : null}
      </p>

      <div className="flex min-h-5 items-center justify-between gap-2">
        {hint ? <span className="text-[11px] text-ink-muted">{hint}</span> : <span />}

        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums",
              delta >= 0
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger-text",
            )}
          >
            <span aria-hidden="true">{delta >= 0 ? "▲" : "▼"}</span>
            {formatPercent(Math.abs(delta))}
            <span className="font-normal opacity-80">نسبت به دوره قبل</span>
          </span>
        ) : null}
      </div>
    </article>
  );
}
