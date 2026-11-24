import { ImageOff, Package, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/routes";
import { InstallmentsTable } from "@/features/installments/components/installments-table";
import { fileSrc } from "@/lib/files/url";
import { formatJalaliDate } from "@/lib/format/date";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import type { Installment, Invoice } from "@/types/domain";
import { PublicInvoiceLink } from "./public-invoice-link";

function totalOf(invoice: Invoice): number {
  if (typeof invoice.totalAmount === "number") return invoice.totalAmount;
  return (invoice.products ?? []).reduce((sum, product) => sum + (product.price ?? 0), 0);
}

/**
 * The detail endpoint populates full installments, but the shared table wants
 * the `Installment` shape with its invoice/user references already embedded.
 */
function toInstallments(invoice: Invoice): Installment[] {
  const user =
    typeof invoice.user === "object"
      ? {
          _id: invoice.user._id,
          name: invoice.user.name ?? "",
          lastName: invoice.user.lastName ?? "",
          phoneNumbers: {
            primary: invoice.user.phone ?? invoice.user.phoneNumbers?.primary ?? null,
          },
        }
      : invoice.user;

  const invoiceRef = {
    _id: invoice._id,
    name: invoice.name,
    products: (invoice.products ?? []).map((product) => ({
      _id: product._id,
      name: product.name ?? "",
      price: product.price,
    })),
  };

  return (invoice.installments ?? []).map((installment) => ({
    _id: installment._id,
    invoiceId: invoiceRef,
    user,
    no: installment.no ?? 0,
    amount: installment.amount ?? 0,
    amountWithInterest: installment.amountWithInterest ?? 0,
    status: installment.status,
    dueDate: installment.dueDate,
    dueDateJalaly: installment.dueDateJalaly,
    paidAt: installment.paidAt ?? null,
    paymentReceipt: installment.paymentReceipt ?? null,
    waivedLateDays: installment.waivedLateDays ?? null,
    daysOverdue: installment.daysOverdue,
    latePenalty: installment.latePenalty,
    payableAmount: installment.payableAmount ?? installment.amountWithInterest ?? 0,
  }));
}

export function InvoiceDetail({
  invoice,
  canPay,
}: {
  invoice: Invoice;
  canPay: boolean;
}) {
  const user = typeof invoice.user === "object" ? invoice.user : null;
  const products = invoice.products ?? [];
  const pledges = invoice.pledge ?? [];
  const total = totalOf(invoice);
  const status = invoice.installmentsStatus;

  return (
    <div className="flex flex-col gap-6">
      {invoice.publicToken ? (
        <PublicInvoiceLink path={routes.invoices.public(invoice.publicToken)} />
      ) : null}

      <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-bold text-ink">اطلاعات فاکتور</h2>
            <p className="text-xs text-ink-muted">
              شماره فاکتور: <span className="font-bold text-ink">{invoice.name}</span>
            </p>
          </div>

          {status ? (
            <div className="flex flex-wrap items-center gap-1">
              <Badge tone="neutral">{toPersianDigits(status.paid)} پرداخت‌شده</Badge>
              <Badge tone="brand">{toPersianDigits(status.pending)} مانده</Badge>
              {status.overdue > 0 ? (
                <Badge tone="danger">{toPersianDigits(status.overdue)} معوق</Badge>
              ) : null}
            </div>
          ) : null}
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Item
            label="مشتری"
            value={user ? `${user.name ?? ""} ${user.lastName ?? ""}`.trim() || "—" : "—"}
          />
          <Item
            label="کد ملی"
            value={user?.nationalId ? toPersianDigits(user.nationalId) : "—"}
            ltr
          />
          <Item
            label="شماره تماس"
            value={toPersianDigits(user?.phoneNumbers?.primary ?? user?.phone ?? "—")}
            ltr
          />
          <Item
            label="تاریخ شروع"
            value={toPersianDigits(invoice.start_date_jalaly ?? invoice.start_date)}
          />
          <Item label="تعداد اقساط" value={toPersianDigits(invoice.installmentCount)} />
          <Item label="مبلغ کل محصولات" value={formatNumber(total)} />
          <Item label="پیش‌پرداخت" value={formatNumber(invoice.downPayment)} />
          <Item
            label="مبلغ باقی‌مانده"
            value={formatNumber(Math.max(total - invoice.downPayment, 0))}
          />
          <Item label="تاریخ ثبت" value={formatJalaliDate(invoice.createdAt)} />
        </dl>
      </section>

      <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-brand-700" aria-hidden="true" />
          <h2 className="text-sm font-bold text-ink">محصولات</h2>
        </div>

        {products.length === 0 ? (
          <p className="mt-4 rounded-field bg-surface-sunken px-4 py-8 text-center text-xs text-ink-muted">
            محصولی برای این فاکتور ثبت نشده است.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const picture = fileSrc(product.pictures?.[0]);

              return (
                <article
                  key={product._id}
                  className="flex flex-col overflow-hidden rounded-field border border-line bg-surface-sunken/40"
                >
                  <div className="aspect-video bg-surface-muted">
                    {picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={picture}
                        alt={product.name ?? "محصول"}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-ink-muted">
                        <ImageOff className="size-6" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 p-3">
                    <h3 className="text-xs font-bold text-ink">{product.name ?? "—"}</h3>
                    {product.details ? (
                      <p className="text-[11px] leading-5 text-ink-muted">
                        {product.details}
                      </p>
                    ) : null}
                    {product.imei ? (
                      <p className="text-[11px] text-ink-muted" dir="ltr">
                        IMEI: {product.imei}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs font-bold text-ink tabular-nums">
                      {formatNumber(product.price ?? 0)} تومان
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {pledges.length > 0 ? (
        <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand-700" aria-hidden="true" />
            <h2 className="text-sm font-bold text-ink">ضمانت‌ها</h2>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pledges.map((pledge, index) => {
              const picture = fileSrc(pledge.picture);

              return (
                <article
                  key={pledge._id ?? index}
                  className="flex gap-3 rounded-field border border-line bg-surface-sunken/40 p-3"
                >
                  <div className="size-16 shrink-0 overflow-hidden rounded-field bg-surface-muted">
                    {picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={picture}
                        alt={pledge.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-ink-muted">
                        <ImageOff className="size-5" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="text-xs font-bold text-ink">{pledge.name}</h3>
                    <p className="text-[11px] leading-5 text-ink-muted">
                      {pledge.details}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-ink">اقساط این فاکتور</h2>
            <p className="mt-1 text-xs text-ink-muted">
              {toPersianDigits(invoice.installments?.length ?? 0)} قسط برای این فاکتور
              ساخته شده است.
            </p>
          </div>
        </header>

        <div className="mt-4">
          <InstallmentsTable
            installments={toInstallments(invoice)}
            canPay={canPay}
            emptyMessage="برای این فاکتور قسطی ساخته نشده است."
          />
        </div>
      </section>
    </div>
  );
}

function Item({
  label,
  value,
  ltr = false,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-line/70 pb-2">
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd
        className="text-sm font-medium break-words text-ink"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </dd>
    </div>
  );
}
