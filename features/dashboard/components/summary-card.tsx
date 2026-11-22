import Link from "next/link";
import { Clock } from "lucide-react";

import { formatNumber, toPersianDigits } from "@/lib/format/number";
import { cn } from "@/lib/utils/cn";
import type { DashboardPeriodSummary } from "@/types/domain";

/**
 * One time window on the dashboard (this month / this week / overdue).
 *
 * The card carries its own gradient; the three tones are design tokens in
 * `globals.css`, so the ramp can be retuned without opening this file. Amounts
 * are the payable total, and the bar is the share already collected — the two
 * numbers under the divider are that share written out.
 */

type SummaryTone = "month" | "week" | "overdue";

const TONE_GRADIENT: Record<SummaryTone, string> = {
  month: "bg-summary-month",
  week: "bg-summary-week",
  overdue: "bg-summary-overdue",
};

type SummaryCardProps = {
  title: string;
  summary: DashboardPeriodSummary;
  href: string;
  tone: SummaryTone;
};

export function SummaryCard({ title, summary, href, tone }: SummaryCardProps) {
  const progress =
    summary.count > 0 ? Math.round((summary.paidCount / summary.count) * 100) : 0;

  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-card p-5 text-white shadow-card",
        TONE_GRADIENT[tone],
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-10 -top-12 size-40 rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -bottom-16 size-48 rounded-full bg-black/10"
      />

      <div className="relative flex items-start justify-between gap-3">
        <Link
          href={href}
          className="inline-flex h-8 items-center rounded-full bg-white px-4 text-xs font-bold text-ink transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          مشاهده
        </Link>

        <span className="grid size-9 place-items-center rounded-tile bg-white/20">
          <Clock className="size-4" aria-hidden="true" />
        </span>
      </div>

      <div className="relative mt-6 flex items-center gap-2">
        <h3 className="text-sm font-bold">{title}</h3>
        <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold">
          {toPersianDigits(summary.count)} قسط
        </span>
      </div>

      <p className="relative mt-2 text-5xl font-bold md:text-3xl">
        <span className="ms-1 block text-left text-[10px] font-bold">تومان</span>
        <span className="block text-left">{formatNumber(summary.totalAmount)}</span>
      </p>

      <div className="relative mt-5 border-t border-dashed border-white/40" />

      <div className="relative mt-4 flex items-center justify-between gap-3 text-[11px] font-medium">
        {summary.paidCount && (
          <span>{toPersianDigits(summary.paidCount)} مورد وصول شده</span>
        )}

        <span>
          {toPersianDigits(summary.remainingCount || summary.count)} مورد باقی مانده
        </span>
      </div>

      <div className="relative mt-3 h-2 overflow-hidden rounded-full bg-black/25">
        <div
          className="h-full rounded-full bg-white transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>
    </article>
  );
}
