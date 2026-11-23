import { io } from "next/cache";

import { PageTitle } from "@/components/layout/page-title";
import { Pagination } from "@/components/ui/pagination";
import { can } from "@/config/permissions";
import { routes } from "@/config/routes";
import { getInstallments } from "@/features/installments/api";
import { InstallmentFilters } from "@/features/installments/components/installment-filters";
import { InstallmentsTable } from "@/features/installments/components/installments-table";
import { getUserById } from "@/features/users/api";
import { requirePermission } from "@/lib/auth/require-permission";
import { toIsoDate } from "@/lib/date/range";
import type { InstallmentFilterStatus } from "@/types/domain";

export const metadata = { title: "اقساط" };

const STATUSES: readonly InstallmentFilterStatus[] = [
  "all",
  "pending",
  "paid",
  "overdue",
];

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function positivePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

function isoDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function objectId(value: string): string {
  return /^[a-f0-9]{24}$/i.test(value) ? value : "";
}

function readStatus(value: string): InstallmentFilterStatus {
  return (STATUSES as readonly string[]).includes(value)
    ? (value as InstallmentFilterStatus)
    : "all";
}

export default async function InstallmentsPage({
  searchParams,
}: PageProps<"/installments">) {
  const session = await requirePermission("installment:read");

  const params = await searchParams;
  const status = readStatus(single(params.status));
  const page = positivePage(single(params.page));
  const userId = objectId(single(params.user));
  // `new Date()` is synchronous IO: Cache Components rejects it during
  // prerendering. Awaiting `io()` moves this read to request time, so the
  // "today" default is real and the route no longer throws on refresh.
  await io();
  const defaultFromDate = toIsoDate(new Date());

  // The backend ignores dates for `overdue`, so they are left out of the API
  // request — but they still come in from and round-trip through the URL, so
  // switching back to another status restores the operator's chosen range.
  const useDates = status !== "overdue";
  const rawFromDate = single(params.fromDate);
  const fromAll = rawFromDate === "all";
  // No `fromDate` at all means "today onwards" — the default view. An explicit
  // `all` is the only way to ask for history with no lower bound.
  const fromDate = fromAll ? "" : isoDate(rawFromDate) || defaultFromDate;
  const toDate = isoDate(single(params.toDate));

  const [installments, selectedUser] = await Promise.all([
    getInstallments({
      status,
      page,
      fromDate: useDates ? fromDate || undefined : undefined,
      toDate: useDates ? toDate || undefined : undefined,
      user: userId || undefined,
    }),
    userId ? getUserById(userId) : Promise.resolve(null),
  ]);

  const hrefForPage = (nextPage: number) => {
    const query = new URLSearchParams();
    if (status !== "all") query.set("status", status);
    if (fromAll) query.set("fromDate", "all");
    else if (fromDate && fromDate !== defaultFromDate) query.set("fromDate", fromDate);
    if (toDate) query.set("toDate", toDate);
    if (userId) query.set("user", userId);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return suffix ? `${routes.installments.list}?${suffix}` : routes.installments.list;
  };

  return (
    <div className="flex flex-col gap-6">
      <PageTitle title="اقساط" />

      <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <InstallmentFilters
          key={`${status}|${fromDate}|${toDate}|${fromAll}|${userId}`}
          status={status}
          fromDate={fromDate}
          toDate={toDate}
          fromAll={fromAll}
          defaultFromDate={defaultFromDate}
          selectedUser={selectedUser}
          userId={userId}
        />

        <div className="mt-5">
          <InstallmentsTable
            installments={installments.result}
            canPay={can(session.permissions, "installment:pay")}
          />
        </div>

        <Pagination meta={installments.meta} hrefFor={hrefForPage} className="mt-5" />
      </section>
    </div>
  );
}
