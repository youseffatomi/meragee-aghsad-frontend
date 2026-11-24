import { formatNumber, toPersianDigits } from "@/lib/format/number";
import type { ReportReceivables } from "@/types/domain";

const WINDOWS = [
  { key: "upcoming30", label: "۳۰ روز آینده", tone: "bg-brand-400" },
  { key: "upcoming60", label: "۶۰ روز آینده", tone: "bg-brand-600" },
  { key: "upcoming90", label: "۹۰ روز آینده", tone: "bg-brand-800" },
] as const;

/**
 * What is about to fall due, as of now.
 *
 * The three windows are cumulative — the 60-day figure already contains the
 * 30-day one — so the bars grow by design rather than being three disjoint
 * buckets.
 */
export function ForecastCard({ receivables }: { receivables: ReportReceivables }) {
  const max = Math.max(receivables.upcoming90, 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-field bg-surface-sunken p-3">
          <p className="text-[10px] text-ink-muted">اقساط در انتظار</p>
          <p className="mt-1 text-lg font-bold text-ink">
            {toPersianDigits(receivables.pendingCount)}
          </p>
        </div>
        <div className="rounded-field bg-danger-soft p-3">
          <p className="text-[10px] text-danger-text">اقساط معوقه</p>
          <p className="mt-1 text-lg font-bold text-danger-text">
            {toPersianDigits(receivables.overdueCount)}
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-4">
        {WINDOWS.map((window) => {
          const amount = receivables[window.key];
          return (
            <li key={window.key} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-ink-muted">{window.label}</span>
                <span className="font-bold text-ink tabular-nums">
                  {formatNumber(amount)}
                </span>
              </div>
              <span className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                <span
                  className={`block h-full rounded-full ${window.tone}`}
                  style={{ width: `${(amount / max) * 100}%` }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
