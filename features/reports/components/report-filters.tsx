"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarRange, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { JalaliDatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { routes } from "@/config/routes";
import { reportDatePresets, type DateRange } from "@/lib/date/range";
import { formatJalaliIsoDate } from "@/lib/format/date";
import { cn } from "@/lib/utils/cn";
import type { TrendGranularity } from "@/types/domain";

type ReportFiltersProps = {
  fromDate: string;
  toDate: string;
  granularity: TrendGranularity;
};

const GRANULARITIES: readonly { value: TrendGranularity; label: string }[] = [
  { value: "day", label: "روزانه" },
  { value: "week", label: "هفتگی" },
  { value: "month", label: "ماهانه" },
];

/**
 * The date range and trend granularity of the financial report.
 *
 * The URL is the source of truth, exactly like the invoice and installment
 * filters: changing the range navigates and the server refetches every section,
 * so a shared link reproduces the same report. Invoice-level filters reset when
 * the range changes because they belong to a different, narrower view.
 */
export function ReportFilters({ fromDate, toDate, granularity }: ReportFiltersProps) {
  const router = useRouter();
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [pending, startTransition] = useTransition();

  function navigate(next: {
    fromDate: string;
    toDate: string;
    granularity: TrendGranularity;
  }) {
    const params = new URLSearchParams();
    if (next.fromDate) params.set("fromDate", next.fromDate);
    if (next.toDate) params.set("toDate", next.toDate);
    if (next.granularity !== "month") params.set("granularity", next.granularity);

    const query = params.toString();
    startTransition(() => {
      router.push(
        query ? `${routes.reports.financial}?${query}` : routes.reports.financial,
        {
          scroll: false,
        },
      );
    });
  }

  function applyPreset(range: DateRange) {
    setFrom(range.from);
    setTo(range.to);
    navigate({ fromDate: range.from, toDate: range.to, granularity });
  }

  function reset() {
    setFrom("");
    setTo("");
    navigate({ fromDate: "", toDate: "", granularity: "month" });
  }

  return (
    <form
      action={routes.reports.financial}
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        navigate({ fromDate: from, toDate: to, granularity });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="report-from" className="text-[11px] text-ink-muted">
            از تاریخ
          </label>
          <JalaliDatePicker
            id="report-from"
            value={from || null}
            onChange={(next) => setFrom(next ?? "")}
            maxDate={to || null}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="report-to" className="text-[11px] text-ink-muted">
            تا تاریخ
          </label>
          <JalaliDatePicker
            id="report-to"
            value={to || null}
            onChange={(next) => setTo(next ?? "")}
            minDate={from || null}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="report-granularity" className="text-[11px] text-ink-muted">
            بازهٔ نمودار
          </label>
          <Select
            id="report-granularity"
            value={granularity}
            onChange={(event) =>
              navigate({
                fromDate: from,
                toDate: to,
                granularity: event.target.value as TrendGranularity,
              })
            }
          >
            {GRANULARITIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-end gap-2">
          <Button type="submit" variant="primary" isLoading={pending} className="flex-1">
            اعمال بازه
          </Button>
          <button
            type="button"
            onClick={reset}
            aria-label="بازنشانی بازه"
            className="inline-flex h-11 items-center gap-1.5 rounded-field border border-line bg-surface px-4 text-sm text-ink-muted transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            بازنشانی
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {reportDatePresets.map((preset) => (
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

      <p className="flex items-center gap-1.5 text-[11px] text-ink-muted">
        <CalendarRange className="size-3.5" aria-hidden="true" />
        بازهٔ فعال:{" "}
        <span className="font-bold text-ink">
          {fromDate ? formatJalaliIsoDate(fromDate) : "ابتدا"}
        </span>
        {" تا "}
        <span className="font-bold text-ink">
          {toDate ? formatJalaliIsoDate(toDate) : "امروز"}
        </span>
      </p>
    </form>
  );
}
