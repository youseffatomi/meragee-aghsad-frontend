"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { routes } from "@/config/routes";
import { InstallmentStatusBadge } from "@/features/installments/components/installment-status-badge";
import { formatJalaliIsoDate } from "@/lib/format/date";
import { formatNumber, formatPercent, toPersianDigits } from "@/lib/format/number";
import type { PaginationMeta } from "@/types/api";
import type {
  ReportInvoiceFilterStatus,
  ReportInvoiceRow,
  ReportInvoiceSort,
  TrendGranularity,
} from "@/types/domain";

type InvoiceFinancialTableProps = {
  rows: ReportInvoiceRow[];
  meta: PaginationMeta;
  fromDate: string;
  toDate: string;
  granularity: TrendGranularity;
  search: string;
  status: ReportInvoiceFilterStatus;
  sort: ReportInvoiceSort;
};

const STATUSES: readonly { value: ReportInvoiceFilterStatus; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "pending", label: "در انتظار" },
  { value: "paid", label: "پرداخت شده" },
  { value: "overdue", label: "معوقه" },
];

const SORTS: readonly { value: ReportInvoiceSort; label: string }[] = [
  { value: "startDate", label: "تازه‌ترین" },
  { value: "total", label: "بیشترین مبلغ" },
  { value: "remaining", label: "بیشترین باقی‌مانده" },
  { value: "overdue", label: "بیشترین معوقه" },
];

/**
 * The per-invoice financial ledger for the selected period.
 *
 * Filters live in the URL so this table can be linked to directly; the search
 * box keeps a local draft and only navigates on submit, while the two selects
 * navigate immediately.
 */
export function InvoiceFinancialTable({
  rows,
  meta,
  fromDate,
  toDate,
  granularity,
  search,
  status,
  sort,
}: InvoiceFinancialTableProps) {
  const router = useRouter();
  const [term, setTerm] = useState(search);
  const [pending, startTransition] = useTransition();

  function hrefFor(next: {
    search?: string;
    status?: ReportInvoiceFilterStatus;
    sort?: ReportInvoiceSort;
    page?: number;
  }) {
    const params = new URLSearchParams();
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (granularity !== "month") params.set("granularity", granularity);

    const nextSearch = next.search ?? search;
    const nextStatus = next.status ?? status;
    const nextSort = next.sort ?? sort;
    const page = next.page ?? 1;

    if (nextSearch.trim()) params.set("invSearch", nextSearch.trim());
    if (nextStatus !== "all") params.set("invStatus", nextStatus);
    if (nextSort !== "startDate") params.set("invSort", nextSort);
    if (page > 1) params.set("invPage", String(page));

    const query = params.toString();
    return query ? `${routes.reports.financial}?${query}` : routes.reports.financial;
  }

  function go(next: Parameters<typeof hrefFor>[0]) {
    startTransition(() => {
      router.push(hrefFor(next), { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            go({ search: term });
          }}
          className="relative flex-1"
        >
          <Search
            className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-ink-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="جستجو با نام مشتری، کد ملی، شماره تماس یا مشخصات محصول"
            aria-label="جستجوی فاکتور"
            className="ps-11"
          />
        </form>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Select
            aria-label="وضعیت فاکتور"
            value={status}
            onChange={(event) =>
              go({ status: event.target.value as ReportInvoiceFilterStatus })
            }
            className="h-11"
          >
            {STATUSES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>

          <Select
            aria-label="ترتیب نمایش"
            value={sort}
            onChange={(event) => go({ sort: event.target.value as ReportInvoiceSort })}
            className="h-11"
          >
            {SORTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>

          <Button
            type="button"
            variant="primary"
            isLoading={pending}
            onClick={() => go({ search: term })}
            className="col-span-2 sm:col-span-1"
          >
            جستجو
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="فاکتوری با این شرایط نیست"
          description="عبارت جستجو یا فیلتر وضعیت را تغییر دهید."
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[62rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] text-ink-muted">
                <th className="pb-2 text-start font-medium">فاکتور</th>
                <th className="pb-2 text-start font-medium">مشتری</th>
                <th className="pb-2 text-start font-medium">تاریخ</th>
                <th className="pb-2 text-start font-medium">فروش</th>
                <th className="pb-2 text-start font-medium">پرداخت شده</th>
                <th className="pb-2 text-start font-medium">باقی‌مانده</th>
                <th className="pb-2 text-start font-medium">معوقه</th>
                <th className="pb-2 text-start font-medium">اقساط</th>
                <th className="pb-2 text-start font-medium">وضعیت</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.invoiceId} className="border-b border-line/70 last:border-0">
                  <td className="py-3">
                    <span className="block text-xs font-bold text-ink">
                      {row.invoiceName}
                    </span>
                    <span className="block text-[10px] text-ink-muted">
                      {toPersianDigits(row.productCount)} قلم
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="block text-xs font-bold text-ink">
                      {row.customer.fullName || "—"}
                    </span>
                    <span className="block text-[10px] text-ink-muted tabular-nums">
                      {toPersianDigits(
                        row.customer.phone || row.customer.nationalId || "",
                      )}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-ink-muted tabular-nums">
                    {row.startDateJalali || formatJalaliIsoDate(row.startDate)}
                  </td>
                  <td className="py-3 text-xs text-ink tabular-nums">
                    {formatNumber(row.grossSales)}
                  </td>
                  <td className="py-3 text-xs text-success tabular-nums">
                    {formatNumber(row.paidAmount)}
                  </td>
                  <td className="py-3 text-xs font-bold text-ink tabular-nums">
                    {formatNumber(row.remainingAmount)}
                  </td>
                  <td className="py-3 text-xs text-danger-text tabular-nums">
                    {row.overdueAmount > 0 ? formatNumber(row.overdueAmount) : "—"}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-muted">
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
                  <td className="py-3">
                    <InstallmentStatusBadge status={row.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination meta={meta} hrefFor={(page) => hrefFor({ page })} />
    </div>
  );
}
