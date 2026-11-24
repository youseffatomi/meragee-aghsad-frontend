import { formatNumber, formatPercent, toPersianDigits } from "@/lib/format/number";
import type { ReportStatusBreakdown } from "@/types/domain";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SLICES = [
  { key: "paid", label: "پرداخت شده", color: "var(--green-600)", soft: "bg-success" },
  { key: "pending", label: "در انتظار", color: "var(--brand-500)", soft: "bg-brand-500" },
  { key: "overdue", label: "معوقه", color: "var(--red-500)", soft: "bg-danger" },
] as const;

/**
 * The current state of every installment as a donut.
 *
 * This is a snapshot, not a period figure: it deliberately ignores the selected
 * range, which is why the card is titled "وضعیت کل اقساط".
 */
export function StatusBreakdown({ data }: { data: ReportStatusBreakdown }) {
  const total = data.paid.amount + data.pending.amount + data.overdue.amount;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between xl:flex-col">
      <div className="relative shrink-0">
        <svg
          viewBox="0 0 140 140"
          className="size-40 -rotate-90"
          role="img"
          aria-label="وضعیت اقساط"
        >
          <circle
            cx="70"
            cy="70"
            r={RADIUS}
            fill="none"
            stroke="var(--surface-muted)"
            strokeWidth="16"
          />
          {total > 0
            ? SLICES.map((slice) => {
                const value = data[slice.key].amount;
                const length = (value / total) * CIRCUMFERENCE;
                const dash = `${length} ${CIRCUMFERENCE - length}`;
                const element = (
                  <circle
                    key={slice.key}
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                    stroke={slice.color}
                    strokeWidth="16"
                    strokeDasharray={dash}
                    strokeDashoffset={-offset}
                    strokeLinecap="butt"
                  />
                );
                offset += length;
                return element;
              })
            : null}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-ink-muted">کل اقساط</span>
          <span className="text-lg font-bold text-ink">
            {toPersianDigits(data.paid.count + data.pending.count + data.overdue.count)}
          </span>
        </div>
      </div>

      <ul className="flex w-full flex-col gap-3">
        {SLICES.map((slice) => {
          const value = data[slice.key].amount;
          const share = total > 0 ? (value / total) * 100 : 0;
          return (
            <li key={slice.key} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs text-ink-muted">
                <span
                  className={`size-2.5 rounded-full ${slice.soft}`}
                  aria-hidden="true"
                />
                {slice.label}
                <span className="text-[10px] text-ink-muted/70">
                  ({toPersianDigits(data[slice.key].count)})
                </span>
              </span>
              <span className="text-end">
                <span className="block text-xs font-bold text-ink">
                  {formatNumber(value)}
                </span>
                <span className="block text-[10px] text-ink-muted">
                  {formatPercent(share)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
