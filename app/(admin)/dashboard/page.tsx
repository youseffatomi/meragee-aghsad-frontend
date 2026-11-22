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
import { formatNumber } from "@/lib/format/number";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "داشبورد" };

/** The one place a status filter belongs; the installments page owns the rest. */
const overdueHref = `${routes.installments.list}?status=overdue`;

const TODAY_COLUMNS: readonly TableColumn[] = [
  "customer",
  "phone",
  "product",
  "amount",
  "status",
  "action",
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
  "action",
];

export default async function DashboardPage() {
  await requirePermission("dashboard:view");

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
          href={routes.installments.list}
        />
        <SummaryCard
          title="اقساط این هفته"
          tone="week"
          summary={data.summary.thisWeek}
          href={routes.installments.list}
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
        href={routes.installments.list}
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
