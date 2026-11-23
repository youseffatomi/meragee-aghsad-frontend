import Link from "next/link";
import { CalendarDays, Eye, Phone } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/config/routes";
import { digitsOnly, formatNumber, toPersianDigits } from "@/lib/format/number";
import { cn } from "@/lib/utils/cn";
import type { Installment } from "@/types/domain";
import { InstallmentStatusBadge } from "./installment-status-badge";
import { PayInstallmentButton } from "./pay-installment-button";

function customerName(installment: Installment): string {
  if (typeof installment.user === "string" || !installment.user) return "—";
  return (
    `${installment.user.name ?? ""} ${installment.user.lastName ?? ""}`.trim() || "—"
  );
}

function customerPhone(installment: Installment): string | null {
  if (typeof installment.user === "string" || !installment.user) return null;
  return installment.user.phoneNumbers?.primary ?? null;
}

function invoiceName(installment: Installment): string {
  if (typeof installment.invoiceId === "string" || !installment.invoiceId) return "—";
  return installment.invoiceId.name || "—";
}

function invoiceId(installment: Installment): string | null {
  if (typeof installment.invoiceId === "string") return installment.invoiceId || null;
  return installment.invoiceId?._id ?? null;
}

/** The names of every product carried by the invoice this installment belongs to. */
function productNames(installment: Installment): string[] {
  if (typeof installment.invoiceId === "string" || !installment.invoiceId) return [];

  return (installment.invoiceId.products ?? [])
    .map((product) => product.name)
    .filter(Boolean);
}

/** The invoice name as a chip, linked to its detail page when the id is available. */
function InvoiceLink({ installment }: { installment: Installment }) {
  const id = invoiceId(installment);
  const name = invoiceName(installment);

  const chip =
    "inline-block max-w-full truncate rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium tabular-nums text-ink";

  if (!id || name === "—") return <span className={chip}>{name}</span>;

  return (
    <Link
      href={routes.invoices.one(id)}
      aria-label={`مشاهده فاکتور ${name}`}
      className={cn(
        chip,
        "transition-colors hover:border-brand-300 hover:bg-brand-tint hover:text-brand-text focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
      )}
    >
      {name}
    </Link>
  );
}

/** The explicit call to action that opens the whole invoice. */
function InvoiceButton({
  installment,
  className,
}: {
  installment: Installment;
  className?: string;
}) {
  const id = invoiceId(installment);

  if (!id) return null;

  return (
    <Link
      href={routes.invoices.one(id)}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-1.5 rounded-field border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none active:bg-surface-muted",
        className,
      )}
    >
      <Eye className="size-4" aria-hidden="true" />
      مشاهده فاکتور
    </Link>
  );
}

type InstallmentsTableProps = {
  installments: Installment[];
  canPay: boolean;
  emptyMessage?: string;
};

/**
 * The full installment feed: one card per due date, with a pay action.
 *
 * Phones get a stacked card; from `md` up the same card turns horizontal and
 * spans the full width, so every card sits in a single column regardless of
 * viewport. Blocks are separated by spacing alone — no rules between them.
 */
export function InstallmentsTable({
  installments,
  canPay,
  emptyMessage = "قسطی با این فیلترها پیدا نشد.",
}: InstallmentsTableProps) {
  if (installments.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="size-5" aria-hidden="true" />}
        title="قسطی پیدا نشد"
        description={emptyMessage}
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {installments.map((installment) => {
        const phone = customerPhone(installment);
        const payable = installment.payableAmount ?? installment.amountWithInterest;
        const canPayThis =
          canPay && installment.status !== "paid" && !installment.paymentReceipt;
        const isOverdue = installment.status === "overdue";
        const hasPenalty = (installment.latePenalty ?? 0) > 0;
        const daysOverdue = installment.daysOverdue ?? 0;
        const waivedDays = installment.waivedLateDays ?? 0;
        const products = productNames(installment);

        return (
          <li
            key={installment._id}
            className="flex flex-col overflow-hidden rounded-field border border-line bg-surface p-2 shadow-card"
          >
            {/* Header: which payment it is, and where it stands. */}
            <div className="order-1 flex items-center justify-between gap-2 px-3 py-2.5">
              <p className="text-sm font-bold text-ink">
                قسط {toPersianDigits(installment.no)}
              </p>
              <InstallmentStatusBadge status={installment.status} />
            </div>

            {/* Payable amount, with the late fee right under it when overdue. */}
            <div className="order-2 flex flex-col gap-1 px-3 py-2.5 md:shrink-0 md:px-0">
              <p className="text-[11px] text-brand-600">قابل پرداخت</p>
              <p className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-ink tabular-nums">
                  {formatNumber(payable)}
                </span>
                <span className="text-xs text-ink-muted">تومان</span>
              </p>

              {hasPenalty || daysOverdue > 0 ? (
                <div className="flex items-center justify-between gap-2 rounded-field bg-danger-soft px-3 py-1.5 text-[11px]">
                  <span className="font-bold text-danger-text tabular-nums">
                    جریمه: {formatNumber(installment.latePenalty ?? 0)} تومان
                  </span>
                  {daysOverdue > 0 ? (
                    <span className="text-danger-text">
                      {toPersianDigits(daysOverdue)} روز تأخیر
                    </span>
                  ) : null}
                </div>
              ) : null}

              {waivedDays > 0 ? (
                <div className="flex items-center justify-between gap-2 rounded-field bg-brand-tint px-3 py-1.5 text-[11px]">
                  <span className="font-bold text-brand-text">بخشودگی</span>
                  <span className="text-brand-text tabular-nums">
                    {toPersianDigits(waivedDays)} روز
                  </span>
                </div>
              ) : null}

              <dl className="mt-1 flex items-center justify-between gap-4 md:justify-start md:gap-6">
                <div className="flex flex-col gap-0.5">
                  <dt className="text-[11px] text-brand-600">مبلغ قسط</dt>
                  <dd className="text-[11px] font-bold text-ink tabular-nums">
                    {formatNumber(installment.amountWithInterest)}{" "}
                    <span className="font-normal text-ink-muted">تومان</span>
                  </dd>
                </div>

                <div className="flex flex-col gap-0.5 text-end md:text-start">
                  <dt className="text-[11px] text-brand-600">سررسید</dt>
                  <dd className="text-[11px] font-bold text-ink tabular-nums">
                    {toPersianDigits(installment.dueDateJalaly)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* The customer, with a one-tap call action. */}
            <div className="order-3 flex items-end justify-between gap-2 px-3 py-2.5 md:min-w-0 md:items-start md:px-0 md:py-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">
                  {customerName(installment)}
                </p>
              </div>

              {phone ? (
                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="text-sm text-ink tabular-nums" dir="ltr">
                    {toPersianDigits(phone)}
                  </span>
                  <a
                    href={`tel:${digitsOnly(phone)}`}
                    aria-label={`تماس با ${customerName(installment)}`}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-brand-text transition-colors hover:bg-brand-tint focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
                  >
                    <Phone className="size-3" aria-hidden="true" />
                  </a>
                </div>
              ) : null}
            </div>

            {/* What was sold, and on which invoice. */}
            <div className="order-4 flex flex-col gap-1.5 px-3 py-2.5">
              {products.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1.5">
                  {products.map((name, index) => (
                    <span
                      key={`${name}-${index}`}
                      className="inline-flex max-w-full items-center rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] text-ink"
                    >
                      <span className="truncate">{name}</span>
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Actions: stacked on the left in the horizontal layout. */}
            <div className="order-5 mt-auto grid grid-cols-5 gap-2 py-2.5">
              {canPayThis ? (
                <PayInstallmentButton
                  installment={installment}
                  variant={"primary"}
                  size="sm"
                  className="col-span-3 flex-1 md:flex-none"
                />
              ) : null}
              <InvoiceButton installment={installment} className="col-span-2" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
