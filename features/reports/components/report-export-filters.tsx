"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { routes } from "@/config/routes";
import type {
  ReportInvoiceFilterStatus,
  ReportInvoiceSort,
  TrendGranularity,
} from "@/types/domain";

type ReportExportFiltersProps = {
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
 * Filters that narrow the exported CSV.
 *
 * They live in the URL so the export link can be shared, and they are kept in
 * the same place the old invoice table used them. Nothing on the page is
 * filtered by them any more — the report sections always show the whole range,
 * and only the downloaded file is narrowed.
 */
export function ReportExportFilters({
  fromDate,
  toDate,
  granularity,
  search,
  status,
  sort,
}: ReportExportFiltersProps) {
  const router = useRouter();
  const [term, setTerm] = useState(search);
  const [pending, startTransition] = useTransition();

  function hrefFor(next: {
    search?: string;
    status?: ReportInvoiceFilterStatus;
    sort?: ReportInvoiceSort;
  }) {
    const params = new URLSearchParams();
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    if (granularity !== "month") params.set("granularity", granularity);

    const nextSearch = next.search ?? search;
    const nextStatus = next.status ?? status;
    const nextSort = next.sort ?? sort;

    if (nextSearch.trim()) params.set("invSearch", nextSearch.trim());
    if (nextStatus !== "all") params.set("invStatus", nextStatus);
    if (nextSort !== "startDate") params.set("invSort", nextSort);

    const query = params.toString();
    return query ? `${routes.reports.financial}?${query}` : routes.reports.financial;
  }

  function go(next: Parameters<typeof hrefFor>[0]) {
    startTransition(() => {
      router.push(hrefFor(next), { scroll: false });
    });
  }

  return (
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
          aria-label="جستجوی فاکتور برای خروجی"
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
          aria-label="ترتیب خروجی"
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
          اعمال فیلتر
        </Button>
      </div>
    </div>
  );
}
