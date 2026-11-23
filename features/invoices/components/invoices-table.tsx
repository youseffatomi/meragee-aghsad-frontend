import Link from "next/link";
import { ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/config/routes";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import type { Invoice } from "@/types/domain";

function customerName(invoice: Invoice): string {
  if (typeof invoice.user === "string") return "—";
  return `${invoice.user.name ?? ""} ${invoice.user.lastName ?? ""}`.trim() || "—";
}

function totalOf(invoice: Invoice): number {
  if (typeof invoice.totalAmount === "number") return invoice.totalAmount;
  return (invoice.products ?? []).reduce((sum, product) => sum + (product.price ?? 0), 0);
}

/** The invoice list. Each row links to the detail page that owns the installments. */
export function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="size-5" aria-hidden="true" />}
        title="فاکتوری پیدا نشد"
        description="عبارت جستجو یا بازهٔ تاریخ را تغییر دهید."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[58rem] border-collapse text-xs">
        <thead>
          <tr className="text-ink-muted">
            <th scope="col" className="pb-3 text-start font-medium">
              شماره فاکتور
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              مشتری
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              تاریخ شروع
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              تعداد اقساط
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              مبلغ کل (تومان)
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              وضعیت اقساط
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              عملیات
            </th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice._id} className="border-t border-line">
              <td className="py-3 pe-3 whitespace-nowrap">
                <Link
                  href={routes.invoices.one(invoice._id)}
                  className="font-bold text-ink transition-colors hover:text-brand-text"
                >
                  {invoice.name}
                </Link>
              </td>
              <td className="py-3 pe-3 whitespace-nowrap text-ink-muted">
                {customerName(invoice)}
              </td>
              <td className="py-3 pe-3 whitespace-nowrap text-ink-muted">
                {toPersianDigits(invoice.start_date_jalaly ?? invoice.start_date)}
              </td>
              <td className="py-3 pe-3 whitespace-nowrap text-ink-muted tabular-nums">
                {toPersianDigits(invoice.installmentCount)}
              </td>
              <td className="py-3 pe-3 font-bold whitespace-nowrap text-ink tabular-nums">
                {formatNumber(totalOf(invoice))}
              </td>
              <td className="py-3 pe-3 whitespace-nowrap">
                <div className="flex flex-wrap items-center gap-1">
                  {invoice.installmentsStatus ? (
                    <>
                      <Badge tone="neutral">
                        {toPersianDigits(invoice.installmentsStatus.paid)} پرداخت‌شده
                      </Badge>
                      <Badge tone="brand">
                        {toPersianDigits(invoice.installmentsStatus.pending)} مانده
                      </Badge>
                      {invoice.installmentsStatus.overdue > 0 ? (
                        <Badge tone="danger">
                          {toPersianDigits(invoice.installmentsStatus.overdue)} معوق
                        </Badge>
                      ) : null}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </td>
              <td className="py-3 whitespace-nowrap">
                <Link
                  href={routes.invoices.one(invoice._id)}
                  className="inline-flex h-7 items-center rounded-full border border-line px-3 text-[11px] font-bold text-ink-muted transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
                >
                  مشاهده
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
