import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber, formatPercent, toPersianDigits } from "@/lib/format/number";
import type { ReportProductRow } from "@/types/domain";

/**
 * Products ranked by the revenue they brought in during the period.
 *
 * `share` is the row's slice of the period revenue; the backend rounds each row
 * independently, so the visible shares may add up to a hair over 100%.
 */
export function ProductRevenueTable({ rows }: { rows: ReportProductRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="محصولی در این بازه فروخته نشده است" />;
  }

  const maxRevenue = Math.max(...rows.map((row) => row.totalRevenue), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[38rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] text-ink-muted">
            <th className="pb-2 text-start font-medium">#</th>
            <th className="pb-2 text-start font-medium">محصول</th>
            <th className="pb-2 text-start font-medium">تعداد</th>
            <th className="pb-2 text-start font-medium">درآمد</th>
            <th className="pb-2 text-start font-medium">سهم</th>
            <th className="pb-2 text-start font-medium">وصول شده</th>
            <th className="pb-2 text-start font-medium">باقی‌مانده</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.name}-${index}`}
              className="border-b border-line/70 last:border-0"
            >
              <td className="py-3 text-[11px] text-ink-muted">
                {toPersianDigits(index + 1)}
              </td>
              <td className="py-3 text-xs font-bold text-ink">{row.name || "—"}</td>
              <td className="py-3 text-xs text-ink-muted tabular-nums">
                {toPersianDigits(row.unitsSold)}
              </td>
              <td className="py-3">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-ink tabular-nums">
                    {formatNumber(row.totalRevenue)}
                  </span>
                  <span className="h-1.5 w-full max-w-32 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className="block h-full rounded-full bg-brand-500"
                      style={{ width: `${(row.totalRevenue / maxRevenue) * 100}%` }}
                    />
                  </span>
                </div>
              </td>
              <td className="py-3 text-xs text-ink-muted tabular-nums">
                {formatPercent(row.share)}
              </td>
              <td className="py-3 text-xs text-success tabular-nums">
                {formatNumber(row.totalPaid)}
              </td>
              <td className="py-3 text-xs text-ink-muted tabular-nums">
                {formatNumber(row.totalOutstanding)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
