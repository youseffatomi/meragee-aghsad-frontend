import { CalendarDays } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { InstallmentStatusBadge } from "@/features/installments/components/installment-status-badge";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import type { PublicInvoiceInstallment } from "@/types/domain";

/**
 * The read-only installment list on the public invoice page.
 *
 * It is intentionally separate from the admin table: there is no pay action,
 * no receipt upload and no link back into the panel.
 */
export function PublicInstallmentsTable({
  installments,
}: {
  installments: PublicInvoiceInstallment[];
}) {
  if (installments.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="size-5" aria-hidden="true" />}
        title="قسطی ثبت نشده است"
        description="برای این فاکتور قسطی ساخته نشده است."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-xs">
        <thead>
          <tr className="text-ink-muted">
            <th scope="col" className="pb-3 text-start font-medium">
              قسط
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              سررسید
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              مبلغ قسط
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              مبلغ جریمه
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              تأخیر
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              مبلغ نهایی
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              وضعیت
            </th>
          </tr>
        </thead>

        <tbody>
          {installments.map((installment) => (
            <tr key={installment.no} className="border-t border-line">
              <td className="py-3 pe-3 font-bold whitespace-nowrap text-ink">
                {toPersianDigits(installment.no)}
              </td>
              <td className="py-3 pe-3 whitespace-nowrap text-ink-muted tabular-nums">
                {toPersianDigits(installment.dueDateJalali)}
              </td>
              <td className="py-3 pe-3 font-bold whitespace-nowrap text-ink tabular-nums">
                {formatNumber(installment.amountWithInterest)}{" "}
                <span className="font-normal text-ink-muted">تومان</span>
              </td>
              <td className="py-3 pe-3 whitespace-nowrap text-ink tabular-nums">
                {installment.latePenalty > 0 ? (
                  <>
                    {formatNumber(installment.latePenalty)}{" "}
                    <span className="text-ink-muted">تومان</span>
                  </>
                ) : (
                  <span className="text-ink-muted">—</span>
                )}
              </td>
              <td className="py-3 pe-3 whitespace-nowrap">
                <DelayCell
                  daysOverdue={installment.daysOverdue}
                  waivedLateDays={installment.waivedLateDays}
                />
              </td>
              <td className="py-3 pe-3 font-bold whitespace-nowrap text-ink tabular-nums">
                {formatNumber(installment.payableAmount)}{" "}
                <span className="font-normal text-ink-muted">تومان</span>
              </td>
              <td className="py-3 whitespace-nowrap">
                <InstallmentStatusBadge status={installment.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The lateness cell: days overdue, with the forgiven days sitting right beside
 * them. Both are absent until the installment is actually late.
 */
function DelayCell({
  daysOverdue,
  waivedLateDays,
}: {
  daysOverdue: number;
  waivedLateDays: number;
}) {
  if (daysOverdue <= 0 && waivedLateDays <= 0) {
    return <span className="text-ink-muted">—</span>;
  }

  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {daysOverdue > 0 ? (
        <span className="font-medium text-danger-text tabular-nums">
          {toPersianDigits(daysOverdue)} روز
        </span>
      ) : null}

      {waivedLateDays > 0 ? (
        <span className="rounded-full bg-brand-tint px-2 py-0.5 text-[11px] text-brand-text">
          بخشودگی {toPersianDigits(waivedLateDays)} روز
        </span>
      ) : null}
    </span>
  );
}
