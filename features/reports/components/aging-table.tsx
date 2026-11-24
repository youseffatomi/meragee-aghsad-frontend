import { formatNumber, formatPercent, toPersianDigits } from "@/lib/format/number";
import type { ReportAgingBucket, ReportAgingBucketName } from "@/types/domain";

const BUCKET_LABEL: Record<ReportAgingBucketName, string> = {
  "0-30": "تا ۳۰ روز",
  "31-60": "۳۱ تا ۶۰ روز",
  "61-90": "۶۱ تا ۹۰ روز",
  "90+": "بیش از ۹۰ روز",
};

const BUCKET_TONE: Record<ReportAgingBucketName, string> = {
  "0-30": "bg-brand-400",
  "31-60": "bg-brand-600",
  "61-90": "bg-danger",
  "90+": "bg-danger-text",
};

/**
 * How overdue the outstanding money is, bucketed by days past due.
 *
 * A snapshot as of now, independent of the selected range. The bar is scaled to
 * the largest bucket so the shape of the risk is visible without reading the
 * numbers.
 */
export function AgingTable({ buckets }: { buckets: ReportAgingBucket[] }) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.amount, 0);
  const max = Math.max(...buckets.map((bucket) => bucket.amount), 1);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] text-ink-muted">
            <th className="pb-2 text-start font-medium">مدت تأخیر</th>
            <th className="pb-2 text-start font-medium">تعداد</th>
            <th className="pb-2 text-start font-medium">مبلغ</th>
            <th className="pb-2 text-start font-medium">سهم</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((bucket) => {
            const share = total > 0 ? (bucket.amount / total) * 100 : 0;
            return (
              <tr key={bucket.bucket} className="border-b border-line/70 last:border-0">
                <td className="py-3 text-xs font-bold text-ink">
                  {BUCKET_LABEL[bucket.bucket]}
                </td>
                <td className="py-3 text-xs text-ink-muted tabular-nums">
                  {toPersianDigits(bucket.count)}
                </td>
                <td className="py-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-ink tabular-nums">
                      {formatNumber(bucket.amount)}
                    </span>
                    <span className="h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-surface-muted">
                      <span
                        className={`block h-full rounded-full ${BUCKET_TONE[bucket.bucket]}`}
                        style={{ width: `${(bucket.amount / max) * 100}%` }}
                      />
                    </span>
                  </div>
                </td>
                <td className="py-3 text-xs text-ink-muted tabular-nums">
                  {formatPercent(share)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
