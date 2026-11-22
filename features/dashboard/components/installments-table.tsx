import type { ReactNode } from "react";
import Link from "next/link";

import { formatNumber } from "@/lib/format/number";
import { cn } from "@/lib/utils/cn";
import type { InstallmentTableRow } from "../rows";
import { InstallmentStatusBadge } from "./installment-status-badge";

/**
 * The "today" and "overdue" tables share this component.
 *
 * The columns are data, not markup: each table names the ones it wants and the
 * component renders them in order. The overdue table needs a late-payment
 * breakdown the "today" table has no use for, and a column list expresses that
 * without the table knowing which table it is.
 *
 * Below `sm` the table keeps its columns and scrolls horizontally inside the
 * card — wrapping every value onto three lines would be worse than a scroll.
 */

export type TableColumn =
  | "customer"
  | "phone"
  | "product"
  | "amount"
  | "daysOverdue"
  | "penalty"
  | "payable"
  | "status"
  | "action";

type ColumnDef = {
  header: string;
  cell: (row: InstallmentTableRow) => ReactNode;
  /** Only the presentation that differs from the base cell. */
  cellClassName?: string;
};

const COLUMNS: Record<TableColumn, ColumnDef> = {
  customer: {
    header: "مشتری",
    cell: (row) => row.customerName || "—",
    cellClassName: "font-bold text-ink",
  },
  phone: {
    header: "شماره تماس",
    cell: (row) => <span dir="ltr">{row.phone ?? "—"}</span>,
    cellClassName: "text-ink-muted",
  },
  product: {
    header: "محصول",
    cell: (row) => row.productName || "—",
    cellClassName: "text-ink-muted",
  },
  amount: {
    header: "مبلغ قسط (تومان)",
    cell: (row) => formatNumber(row.amount),
    cellClassName: "font-bold text-ink tabular-nums",
  },
  daysOverdue: {
    header: "روز تأخیر",
    cell: (row) => (row.daysOverdue === undefined ? "—" : formatNumber(row.daysOverdue)),
    cellClassName: "text-ink-muted tabular-nums",
  },
  penalty: {
    header: "جریمه (تومان)",
    cell: (row) => (row.latePenalty === undefined ? "—" : formatNumber(row.latePenalty)),
    cellClassName: "text-danger-text tabular-nums",
  },
  payable: {
    header: "قابل پرداخت (تومان)",
    cell: (row) =>
      row.payableAmount === undefined ? "—" : formatNumber(row.payableAmount),
    cellClassName: "font-bold text-ink tabular-nums",
  },
  status: {
    header: "وضعیت",
    cell: (row) => <InstallmentStatusBadge status={row.status} />,
  },
  action: {
    header: "",
    // A neutral link for now; the target is wired once the installment page exists.
    cell: (row) => (
      <Link
        href="#"
        aria-label={`مشاهده قسط ${row.customerName}`}
        className="inline-flex h-7 items-center rounded-full border border-line px-3 text-[11px] font-bold text-ink-muted transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
      >
        مشاهده
      </Link>
    ),
  },
};

type InstallmentsTableProps = {
  title: string;
  href: string;
  rows: InstallmentTableRow[];
  emptyMessage: string;
  columns: readonly TableColumn[];
  /** Min table width, so narrow screens scroll rather than crush the columns. */
  minWidthClassName?: string;
};

export function InstallmentsTable({
  title,
  href,
  rows,
  emptyMessage,
  columns,
  minWidthClassName = "min-w-[36rem]",
}: InstallmentsTableProps) {
  return (
    <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-ink">{title}</h2>

        <Link
          href={href}
          className="inline-flex h-8 items-center rounded-full bg-brand-soft px-4 text-xs font-bold text-brand-text transition-colors hover:bg-brand-100 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
        >
          مشاهده همه
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-field bg-surface-sunken px-4 py-10 text-center text-xs text-ink-muted">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className={cn("w-full border-collapse text-xs", minWidthClassName)}>
            <thead>
              <tr className="text-ink-muted">
                {columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="pb-3 text-start font-medium whitespace-nowrap"
                  >
                    {COLUMNS[column].header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  {columns.map((column) => {
                    const { cell, cellClassName } = COLUMNS[column];

                    return (
                      <td
                        key={column}
                        className={cn("py-3 pe-3 whitespace-nowrap", cellClassName)}
                      >
                        {cell(row)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
