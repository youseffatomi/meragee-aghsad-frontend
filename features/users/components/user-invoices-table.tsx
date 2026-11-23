import Link from "next/link";
import { ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { routes } from "@/config/routes";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import type { UserInvoice } from "@/types/domain";
import type { PaginationMeta } from "@/types/api";

type UserInvoicesTableProps = {
  invoices: UserInvoice[];
  meta: PaginationMeta;
  /** Builds the URL for a given invoice page, preserving the current search. */
  hrefForPage: (page: number) => string;
};

/**
 * The invoices that belong to one user.
 *
 * This is a server component: the page already fetched the slice, so the table
 * only formats it. Each row links to `/invoices/[id]`, which is the invoice
 * page's job to render.
 */
export function UserInvoicesTable({
  invoices,
  meta,
  hrefForPage,
}: UserInvoicesTableProps) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">فاکتورها</h2>
          <p className="mt-1 text-xs text-ink-muted">
            {meta.totalDocs > 0
              ? `${toPersianDigits(meta.totalDocs)} فاکتور برای این کاربر ثبت شده است.`
              : "برای این کاربر فاکتوری ثبت نشده است."}
          </p>
        </div>
      </header>

      {invoices.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={<ReceiptText className="size-5" aria-hidden="true" />}
          title="فاکتوری ثبت نشده"
          description="پس از ثبت فاکتور برای این کاربر، در همین بخش نمایش داده می‌شود."
        />
      ) : (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-xs">
              <thead>
                <tr className="text-ink-muted">
                  <th scope="col" className="pb-3 text-start font-medium">
                    شماره فاکتور
                  </th>
                  <th scope="col" className="pb-3 text-start font-medium">
                    تاریخ شروع
                  </th>
                  <th scope="col" className="pb-3 text-start font-medium">
                    تعداد اقساط
                  </th>
                  <th scope="col" className="pb-3 text-start font-medium">
                    پیش‌پرداخت
                  </th>
                  <th scope="col" className="pb-3 text-start font-medium">
                    مبلغ کل
                  </th>
                  <th scope="col" className="pb-3 text-start font-medium">
                    وضعیت اقساط
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
                      {toPersianDigits(invoice.start_date_jalaly ?? invoice.start_date)}
                    </td>
                    <td className="py-3 pe-3 whitespace-nowrap text-ink-muted tabular-nums">
                      {toPersianDigits(invoice.installmentCount)}
                    </td>
                    <td className="py-3 pe-3 whitespace-nowrap text-ink-muted tabular-nums">
                      {formatNumber(invoice.downPayment ?? 0)}
                    </td>
                    <td className="py-3 pe-3 font-bold whitespace-nowrap text-ink tabular-nums">
                      {invoice.totalAmount === undefined
                        ? "—"
                        : formatNumber(invoice.totalAmount)}
                    </td>
                    <td className="py-3 whitespace-nowrap">
                      <div className="flex flex-wrap items-center gap-1">
                        {invoice.installmentsStatus ? (
                          <>
                            <Badge tone="neutral">
                              {toPersianDigits(invoice.installmentsStatus.paid)}{" "}
                              پرداخت‌شده
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination meta={meta} hrefFor={hrefForPage} className="mt-5" />
        </>
      )}
    </section>
  );
}
