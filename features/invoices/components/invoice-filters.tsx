"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JalaliDatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";
import { invoiceDatePresets, type DateRange } from "@/lib/date/range";
import { formatJalaliIsoDate } from "@/lib/format/date";
import { cn } from "@/lib/utils/cn";

type InvoiceFiltersProps = {
  search: string;
  fromDate: string;
  toDate: string;
};

/**
 * Search and date filters for the invoice list.
 *
 * The URL is the source of truth: every change navigates and the App Router
 * refetches on the server, so a shared link reproduces the same result set.
 */
export function InvoiceFilters({ search, fromDate, toDate }: InvoiceFiltersProps) {
  const router = useRouter();
  const [value, setValue] = useState(search);
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [pending, startTransition] = useTransition();

  function navigate(next: { search: string; fromDate: string; toDate: string }) {
    const params = new URLSearchParams();
    const trimmed = next.search.trim();

    if (trimmed) params.set("search", trimmed);
    if (next.fromDate) params.set("fromDate", next.fromDate);
    if (next.toDate) params.set("toDate", next.toDate);

    const query = params.toString();

    startTransition(() => {
      router.push(query ? `${routes.invoices.list}?${query}` : routes.invoices.list, {
        scroll: false,
      });
    });
  }

  function applyPreset(range: DateRange) {
    setFrom(range.from);
    setTo(range.to);
    navigate({ search: value, fromDate: range.from, toDate: range.to });
  }

  function clear() {
    setValue("");
    setFrom("");
    setTo("");
    navigate({ search: "", fromDate: "", toDate: "" });
  }

  const hasFilters = Boolean(search || fromDate || toDate);

  return (
    <form
      action={routes.invoices.list}
      method="get"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate({ search: value, fromDate: from, toDate: to });
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-ink-muted"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="جستجو با نام مشتری، کد ملی، شماره تماس یا مشخصات محصول"
            aria-label="جستجوی فاکتور"
            className="ps-11"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={pending}
            className="flex-1 sm:flex-none"
          >
            جستجو
          </Button>

          {hasFilters ? (
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-11 items-center gap-1.5 rounded-field border border-line bg-surface px-4 text-sm text-ink-muted transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
            >
              <X className="size-4" aria-hidden="true" />
              پاک کردن
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="invoice-from" className="text-[11px] text-ink-muted">
            از تاریخ شروع
          </label>
          <JalaliDatePicker
            id="invoice-from"
            value={from || null}
            onChange={(next) => setFrom(next ?? "")}
            maxDate={to || null}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="invoice-to" className="text-[11px] text-ink-muted">
            تا تاریخ شروع
          </label>
          <JalaliDatePicker
            id="invoice-to"
            value={to || null}
            onChange={(next) => setTo(next ?? "")}
            minDate={from || null}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {invoiceDatePresets.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => applyPreset(preset.range(new Date()))}
            className={cn(
              "inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-[11px] font-bold text-ink-muted transition-colors",
              "hover:border-brand-300 hover:bg-brand-tint hover:text-brand-text",
              "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {fromDate || toDate ? (
        <p className="text-[11px] text-ink-muted">
          بازهٔ فعال:{" "}
          <span className="font-bold text-ink">
            {fromDate ? formatJalaliIsoDate(fromDate) : "ابتدا"}
          </span>
          {" تا "}
          <span className="font-bold text-ink">
            {toDate ? formatJalaliIsoDate(toDate) : "اکنون"}
          </span>
        </p>
      ) : null}
    </form>
  );
}
