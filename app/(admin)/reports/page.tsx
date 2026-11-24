import { io } from "next/cache";
import Link from "next/link";
import {
  AlertTriangle,
  Banknote,
  CalendarClock,
  Coins,
  LineChart,
  Percent,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { routes } from "@/config/routes";
import {
  getFinancialSummary,
  getFinancialTrend,
  getReportCustomers,
  getReportInvoices,
  getReportProducts,
} from "@/features/reports/api";
import { AgingTable } from "@/features/reports/components/aging-table";
import { ExportButton } from "@/features/reports/components/export-button";
import { ForecastCard } from "@/features/reports/components/forecast-card";
import { InvoiceFinancialTable } from "@/features/reports/components/invoice-financial-table";
import { KpiCard } from "@/features/reports/components/kpi-card";
import { ProductRevenueTable } from "@/features/reports/components/product-revenue-table";
import { ReportFilters } from "@/features/reports/components/report-filters";
import { StatusBreakdown } from "@/features/reports/components/status-breakdown";
import { TopCustomersTable } from "@/features/reports/components/top-customers-table";
import { TrendChart } from "@/features/reports/components/trend-chart";
import { requirePermission } from "@/lib/auth/require-permission";
import { startOfJalaliYear, toIsoDate } from "@/lib/date/range";
import { formatNumber, formatPercent, toPersianDigits } from "@/lib/format/number";
import type {
  ReportInvoiceFilterStatus,
  ReportInvoiceSort,
  TrendGranularity,
} from "@/types/domain";

export const metadata = { title: "گزارش مالی" };

const GRANULARITIES: readonly TrendGranularity[] = ["day", "week", "month"];
const INVOICE_STATUSES: readonly ReportInvoiceFilterStatus[] = [
  "all",
  "pending",
  "paid",
  "overdue",
];
const INVOICE_SORTS: readonly ReportInvoiceSort[] = [
  "startDate",
  "total",
  "remaining",
  "overdue",
];

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function isoDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function positivePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function readGranularity(value: string): TrendGranularity {
  return (GRANULARITIES as readonly string[]).includes(value)
    ? (value as TrendGranularity)
    : "month";
}

function readInvoiceStatus(value: string): ReportInvoiceFilterStatus {
  return (INVOICE_STATUSES as readonly string[]).includes(value)
    ? (value as ReportInvoiceFilterStatus)
    : "all";
}

function readInvoiceSort(value: string): ReportInvoiceSort {
  return (INVOICE_SORTS as readonly string[]).includes(value)
    ? (value as ReportInvoiceSort)
    : "startDate";
}

/** Percent change against the previous period; `null` when there is no base. */
function change(current: number, previous: number | null): number | null {
  if (previous === null || previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

export default async function ReportsPage({ searchParams }: PageProps<"/reports">) {
  await requirePermission("report:read");

  const params = await searchParams;
  // `new Date()` is synchronous IO, which Cache Components rejects during
  // prerendering; awaiting `io()` moves the read to request time.
  await io();

  const today = new Date();
  const defaultFromDate = toIsoDate(startOfJalaliYear(today));
  const defaultToDate = toIsoDate(today);

  // The pickers keep `from <= to`, but a hand-edited URL can violate it and the
  // backend rejects the range. Swapping keeps the page usable instead of
  // surfacing a validation error for a link the user may have been given.
  const rawFromDate = isoDate(single(params.fromDate)) || defaultFromDate;
  const rawToDate = isoDate(single(params.toDate)) || defaultToDate;
  const fromDate = rawFromDate <= rawToDate ? rawFromDate : rawToDate;
  const toDate = rawFromDate <= rawToDate ? rawToDate : rawFromDate;
  const granularity = readGranularity(single(params.granularity));

  const search = single(params.invSearch);
  const status = readInvoiceStatus(single(params.invStatus));
  const sort = readInvoiceSort(single(params.invSort));
  const page = positivePage(single(params.invPage));

  const [summary, trend, invoices, customers, products] = await Promise.all([
    getFinancialSummary({ fromDate, toDate }),
    getFinancialTrend({ fromDate, toDate, granularity }),
    getReportInvoices({ fromDate, toDate, search, status, sort, page }),
    getReportCustomers({ fromDate, toDate, sort: "outstanding" }),
    getReportProducts({ fromDate, toDate, sort: "revenue" }),
  ]);

  const { sales, collections, receivables, penalties, previous } = summary;

  // "Clear filters" resets only the invoice-level filters; the date range and
  // granularity the operator chose stay put.
  const resetInvoiceParams = new URLSearchParams();
  if (fromDate !== defaultFromDate) resetInvoiceParams.set("fromDate", fromDate);
  if (toDate !== defaultToDate) resetInvoiceParams.set("toDate", toDate);
  if (granularity !== "month") resetInvoiceParams.set("granularity", granularity);
  const resetInvoiceQuery = resetInvoiceParams.toString();
  const resetInvoiceHref = resetInvoiceQuery
    ? `${routes.reports.financial}?${resetInvoiceQuery}`
    : routes.reports.financial;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle
          title="گزارش مالی"
          description="فروش، وصول و مطالبات در بازهٔ انتخابی — همراه با خروجی CSV"
        />
        <ExportButton
          fromDate={fromDate}
          toDate={toDate}
          search={search}
          status={status}
          sort={sort}
        />
      </div>

      <section
        aria-label="فیلترهای گزارش"
        className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5"
      >
        <ReportFilters
          key={`${fromDate}|${toDate}|${granularity}`}
          fromDate={fromDate}
          toDate={toDate}
          granularity={granularity}
        />
      </section>

      <section aria-label="شاخص‌های فروش" className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-ink">فروش دوره</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="فروش ناخالص"
            value={formatNumber(sales.grossSales)}
            unit="تومان"
            hint={`${toPersianDigits(sales.invoiceCount)} فاکتور`}
            icon={<TrendingUp className="size-4" aria-hidden="true" />}
            delta={change(sales.grossSales, previous.grossSales)}
            tone="brand"
          />
          <KpiCard
            label="سود (بهره)"
            value={formatNumber(sales.interest)}
            unit="تومان"
            hint="بهرهٔ کل قراردادها"
            icon={<Percent className="size-4" aria-hidden="true" />}
            delta={change(sales.interest, previous.interest)}
            tone="info"
          />
          <KpiCard
            label="میانگین فاکتور"
            value={formatNumber(Math.round(sales.averageInvoice))}
            unit="تومان"
            hint={`${toPersianDigits(sales.customerCount)} مشتری`}
            icon={<ReceiptText className="size-4" aria-hidden="true" />}
            tone="neutral"
          />
          <KpiCard
            label="اقلام فروخته‌شده"
            value={toPersianDigits(sales.productCount)}
            unit="قلم"
            hint={`پیش‌پرداخت: ${formatNumber(sales.downPayments)}`}
            icon={<ShoppingBag className="size-4" aria-hidden="true" />}
            tone="neutral"
          />
        </div>
      </section>

      <section aria-label="شاخص‌های وصول" className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-ink">وصول دوره</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="کل وصول‌شده"
            value={formatNumber(collections.totalCollected)}
            unit="تومان"
            hint={`${toPersianDigits(collections.paidCount)} قسط`}
            icon={<Wallet className="size-4" aria-hidden="true" />}
            delta={change(collections.totalCollected, previous.totalCollected)}
            tone="success"
          />
          <KpiCard
            label="نرخ وصول"
            value={formatPercent(collections.collectionRate)}
            hint="از اقساط فاکتورهای این بازه"
            icon={<LineChart className="size-4" aria-hidden="true" />}
            delta={
              previous.collectionRate === null
                ? null
                : collections.collectionRate - previous.collectionRate
            }
            tone="success"
          />
          <KpiCard
            label="جریمهٔ وصول‌شده"
            value={formatNumber(collections.penaltyCollected)}
            unit="تومان"
            hint={`${toPersianDigits(collections.waivedDays)} روز بخشیده‌شده`}
            icon={<Coins className="size-4" aria-hidden="true" />}
            tone="brand"
          />
          <KpiCard
            label="اصل وام وصول‌شده"
            value={formatNumber(collections.principalCollected)}
            unit="تومان"
            hint={`بهره: ${formatNumber(collections.interestCollected)}`}
            icon={<Banknote className="size-4" aria-hidden="true" />}
            tone="info"
          />
        </div>
      </section>

      <section aria-label="شاخص‌های مطالبات" className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-ink">
          مطالبات
          <span className="ms-2 text-[11px] font-normal text-ink-muted">
            (وضعیت همین حالا، مستقل از بازه)
          </span>
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="کل مطالبات"
            value={formatNumber(receivables.totalOutstanding)}
            unit="تومان"
            hint={`${toPersianDigits(receivables.pendingCount)} قسط در انتظار`}
            icon={<Wallet className="size-4" aria-hidden="true" />}
            tone="neutral"
          />
          <KpiCard
            label="مطالبات معوقه"
            value={formatNumber(receivables.overdueOutstanding)}
            unit="تومان"
            hint={`${toPersianDigits(receivables.overdueCount)} قسط`}
            icon={<AlertTriangle className="size-4" aria-hidden="true" />}
            tone="danger"
          />
          <KpiCard
            label="سررسید ۳۰ روز آینده"
            value={formatNumber(receivables.upcoming30)}
            unit="تومان"
            hint={`۹۰ روز: ${formatNumber(receivables.upcoming90)}`}
            icon={<CalendarClock className="size-4" aria-hidden="true" />}
            tone="brand"
          />
          <KpiCard
            label="جریمهٔ"
            value={formatNumber(penalties.accrued)}
            unit="تومان"
            hint={`${toPersianDigits(penalties.overdueWithPenaltyCount)} قسط جریمه‌دار`}
            icon={<Coins className="size-4" aria-hidden="true" />}
            tone="danger"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <article className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5 xl:col-span-2">
          <h2 className="mb-4 text-sm font-bold text-ink">جریان مالی در بازه</h2>
          <TrendChart points={trend.points} granularity={trend.granularity} />
        </article>

        <article className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
          <h2 className="mb-4 text-sm font-bold text-ink">
            وضعیت کل اقساط
            <span className="ms-2 text-[11px] font-normal text-ink-muted">
              (همین حالا)
            </span>
          </h2>
          <StatusBreakdown data={summary.statusBreakdown} />
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
          <h2 className="mb-4 text-sm font-bold text-ink">سن مطالبات معوقه</h2>
          <AgingTable buckets={summary.aging} />
        </article>

        <article className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
          <h2 className="mb-4 text-sm font-bold text-ink">پیش‌بینی سررسید</h2>
          <ForecastCard receivables={receivables} />
        </article>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <article className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-ink">بیشترین مطالبات مشتریان</h2>
            <span className="text-[11px] text-ink-muted">۵ مشتری اول</span>
          </div>
          <TopCustomersTable rows={customers.result} />
        </article>

        <article className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-ink">پرفروش‌ترین محصولات</h2>
            <span className="text-[11px] text-ink-muted">۵ محصول اول</span>
          </div>
          <ProductRevenueTable rows={products.result} />
        </article>
      </section>

      <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-ink">ریز مالی فاکتورها</h2>
          <Link
            href={resetInvoiceHref}
            className="text-[11px] font-bold text-brand-text hover:underline"
          >
            حذف فیلترها
          </Link>
        </div>
        <InvoiceFinancialTable
          rows={invoices.result}
          meta={invoices.meta}
          fromDate={fromDate}
          toDate={toDate}
          granularity={granularity}
          search={search}
          status={status}
          sort={sort}
        />
      </section>
    </div>
  );
}
