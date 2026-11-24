import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber, formatPercent, toPersianDigits } from "@/lib/format/number";
import type { ReportCustomerRow } from "@/types/domain";

/**
 * The customers with the largest outstanding balance in the period.
 *
 * Sorted by the backend (`sort=outstanding`), so the table only renders the
 * rows it is given and never re-sorts them on the client.
 */
export function TopCustomersTable({ rows }: { rows: ReportCustomerRow[] }) {
  if (rows.length === 0) {
    return <EmptyState title="مشتری‌ای در این بازه نیست" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] text-ink-muted">
            <th className="pb-2 text-start font-medium">#</th>
            <th className="pb-2 text-start font-medium">مشتری</th>
            <th className="pb-2 text-start font-medium">فاکتور</th>
            <th className="pb-2 text-start font-medium">خرید</th>
            <th className="pb-2 text-start font-medium">باقی‌مانده</th>
            <th className="pb-2 text-start font-medium">معوقه</th>
            <th className="pb-2 text-start font-medium">نرخ وصول</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.userId} className="border-b border-line/70 last:border-0">
              <td className="py-3 text-[11px] text-ink-muted">
                {toPersianDigits(index + 1)}
              </td>
              <td className="py-3">
                <span className="block text-xs font-bold text-ink">
                  {row.fullName || "—"}
                </span>
                <span className="block text-[10px] text-ink-muted tabular-nums">
                  {toPersianDigits(row.phone || row.nationalId || "")}
                </span>
              </td>
              <td className="py-3 text-xs text-ink-muted tabular-nums">
                {toPersianDigits(row.invoiceCount)}
              </td>
              <td className="py-3 text-xs text-ink tabular-nums">
                {formatNumber(row.purchasesAmount)}
              </td>
              <td className="py-3 text-xs font-bold text-ink tabular-nums">
                {formatNumber(row.outstandingAmount)}
              </td>
              <td className="py-3 text-xs text-danger-text tabular-nums">
                {row.overdueAmount > 0 ? formatNumber(row.overdueAmount) : "—"}
              </td>
              <td className="py-3">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className="block h-full rounded-full bg-success"
                      style={{ width: `${Math.min(row.collectionRate, 100)}%` }}
                    />
                  </span>
                  <span className="text-[10px] text-ink-muted tabular-nums">
                    {formatPercent(row.collectionRate)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
