import { io } from "next/cache";
import { Package, Users, Wallet } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { routes } from "@/config/routes";
import {
  InstallmentsTable,
  type TableColumn,
} from "@/features/dashboard/components/installments-table";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { getDashboardData, getOverdueInstallments } from "@/features/dashboard/api";
import { fromDashboardRow, fromInstallment } from "@/features/dashboard/rows";
import {
  endOfJalaliMonth,
  endOfWeek,
  startOfJalaliMonth,
  startOfWeek,
  toIsoDate,
} from "@/lib/date/range";
import { formatNumber } from "@/lib/format/number";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "داشبورد" };

const TODAY_COLUMNS: readonly TableColumn[] = [
  "customer",
  "phone",
  "product",
  "amount",
  "status",
];

const OVERDUE_COLUMNS: readonly TableColumn[] = [
  "customer",
  "phone",
  "product",
  "amount",
  "daysOverdue",
  "penalty",
  "payable",
  "status",
];

export default async function DashboardPage() {
  await requirePermission("dashboard:view");

  // `new Date()` is synchronous IO: Cache Components rejects it during
  // prerendering. Awaiting `io()` moves this read to request time, so the
  // "today"/"this week"/"this month" links are always current.
  await io();
  const today = new Date();

  const installmentsHref = (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    return `${routes.installments.list}?${query}`;
  };

  const todayIso = toIsoDate(today);
  const todayHref = installmentsHref({ fromDate: todayIso, toDate: todayIso });
  const monthHref = installmentsHref({
    fromDate: toIsoDate(startOfJalaliMonth(today)),
    toDate: toIsoDate(endOfJalaliMonth(today)),
  });
  const weekHref = installmentsHref({
    fromDate: toIsoDate(startOfWeek(today)),
    toDate: toIsoDate(endOfWeek(today)),
  });
  const overdueHref = installmentsHref({ status: "overdue" });

  // Two independent backend calls, so they go out together rather than in turn.
  const [data, overdue] = await Promise.all([
    getDashboardData(),
    getOverdueInstallments(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="داشبورد" description="نمای کلی وضعیت اقساط و فاکتورها" />

      <section aria-label="خلاصهٔ اقساط" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          title="اقساط این ماه"
          tone="month"
          summary={data.summary.thisMonth}
          href={monthHref}
        />
        <SummaryCard
          title="اقساط این هفته"
          tone="week"
          summary={data.summary.thisWeek}
          href={weekHref}
        />
        <SummaryCard
          title="کل اقساط عقب افتاده"
          tone="overdue"
          summary={data.summary.overdue}
          href={overdueHref}
        />
      </section>

      <section
        aria-label="آمار کلی"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <StatCard
          label="مجموع اقساط پرداخت شده"
          value={formatNumber(data.stats.totalPaidAmount)}
          icon={<Wallet className="size-4" aria-hidden="true" />}
          accent
        />
        <StatCard
          label="محصولات فروخته شده"
          value={formatNumber(data.stats.soldProductsCount)}
          icon={<Package className="size-4" aria-hidden="true" />}
        />
        <StatCard
          label="مشتریان"
          value={formatNumber(data.stats.customersCount)}
          icon={<Users className="size-4" aria-hidden="true" />}
        />
      </section>

      <InstallmentsTable
        title="اقساط امروز"
        href={todayHref}
        rows={data.todayInstallments.map(fromDashboardRow)}
        emptyMessage="امروز قسطی سررسید نشده است."
        columns={TODAY_COLUMNS}
        minWidthClassName="min-w-[40rem]"
      />

      <InstallmentsTable
        title="اقساط عقب افتاده"
        href={overdueHref}
        rows={overdue.result.map(fromInstallment)}
        emptyMessage="قسط عقب‌افتاده‌ای وجود ندارد."
        columns={OVERDUE_COLUMNS}
        minWidthClassName="min-w-[56rem]"
      />
    </div>
  );
}
