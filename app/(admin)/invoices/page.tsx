import Link from "next/link";
import { FilePlus2 } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { Pagination } from "@/components/ui/pagination";
import { can } from "@/config/permissions";
import { routes } from "@/config/routes";
import { getInvoices } from "@/features/invoices/api";
import { InvoiceFilters } from "@/features/invoices/components/invoice-filters";
import { InvoicesTable } from "@/features/invoices/components/invoices-table";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "فاکتورها" };

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function positivePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Only a well-formed Gregorian date reaches the backend. */
function isoDate(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

export default async function InvoicesPage({ searchParams }: PageProps<"/invoices">) {
  const session = await requirePermission("invoice:read");

  const params = await searchParams;
  const search = single(params.search).trim();
  const page = positivePage(single(params.page));
  const fromDate = isoDate(single(params.fromDate));
  const toDate = isoDate(single(params.toDate));

  const invoices = await getInvoices({
    search: search || undefined,
    page,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const hrefForPage = (nextPage: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (fromDate) query.set("fromDate", fromDate);
    if (toDate) query.set("toDate", toDate);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return suffix ? `${routes.invoices.list}?${suffix}` : routes.invoices.list;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle title="فاکتورها" />

        {can(session.permissions, "invoice:create") ? (
          <Link
            href={routes.invoices.create}
            className="inline-flex h-11 items-center gap-2 rounded-field bg-brand-700 px-5 text-sm font-medium text-white shadow-card transition-colors hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
          >
            <FilePlus2 className="size-4" aria-hidden="true" />
            فاکتور جدید
          </Link>
        ) : null}
      </div>

      <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <InvoiceFilters
          key={`${search}|${fromDate}|${toDate}`}
          search={search}
          fromDate={fromDate}
          toDate={toDate}
        />

        <div className="mt-5">
          <InvoicesTable invoices={invoices.result} />
        </div>

        <Pagination meta={invoices.meta} hrefFor={hrefForPage} className="mt-5" />
      </section>
    </div>
  );
}
