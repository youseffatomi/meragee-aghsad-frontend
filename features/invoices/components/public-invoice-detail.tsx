import { ImageOff, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { fileSrc } from "@/lib/files/url";
import { formatJalaliDate } from "@/lib/format/date";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import type { PublicInvoice } from "@/types/domain";
import { PublicInstallmentsTable } from "./public-installments-table";

/**
 * The customer-facing invoice view.
 *
 * Every field here comes from the backend's censored public projection, so the
 * component never has to remember which values are safe to show. There is no
 * action of any kind: no payment, no receipt upload, no link into the panel.
 */
export function PublicInvoiceDetail({ data }: { data: PublicInvoice }) {
  const { invoice, customer, products, installments, installmentsStatus } = data;
  const customerName = `${customer.name ?? ""} ${customer.lastName ?? ""}`.trim();
  const remaining = Math.max(invoice.totalAmount - invoice.downPayment, 0);

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium text-brand-700">فاکتور فروش</p>
            <h1 className="text-xl font-black text-ink tabular-nums">{invoice.name}</h1>
            <p className="text-xs text-ink-muted">
              {customerName || "مشتری"} —{" "}
              {/* `bdi` + `dir` keeps the masked number from being reordered by
                  the surrounding RTL text. */}
              <bdi dir="ltr">{toPersianDigits(customer.phone ?? "—")}</bdi>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Badge tone="neutral">
              {toPersianDigits(installmentsStatus.paid)} پرداخت‌شده
            </Badge>
            <Badge tone="brand">
              {toPersianDigits(installmentsStatus.pending)} مانده
            </Badge>
            {installmentsStatus.overdue > 0 ? (
              <Badge tone="danger">
                {toPersianDigits(installmentsStatus.overdue)} معوق
              </Badge>
            ) : null}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Item label="تاریخ شروع" value={toPersianDigits(invoice.startDateJalali)} />
          <Item label="تعداد اقساط" value={toPersianDigits(invoice.installmentCount)} />
          <Item label="مبلغ کل محصولات" value={formatNumber(invoice.totalAmount)} />
          <Item label="پیش‌پرداخت" value={formatNumber(invoice.downPayment)} />
          <Item label="مبلغ باقی‌مانده" value={formatNumber(remaining)} />
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
            {products.map((product, index) => {
              const picture = fileSrc(product.pictures?.[0]);

              return (
                <article
                  key={`${product.name}-${index}`}
                  className="flex flex-col overflow-hidden rounded-field border border-line bg-surface-sunken/40"
                >
                  <div className="aspect-video bg-surface-muted">
                    {picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={picture}
                        alt={product.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-ink-muted">
                        <ImageOff className="size-6" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1 p-3">
                    <h3 className="text-xs font-bold text-ink">{product.name}</h3>
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
                      {formatNumber(product.price)} تومان
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <header>
          <h2 className="text-sm font-bold text-ink">اقساط این فاکتور</h2>
        </header>

        <div className="mt-4">
          <PublicInstallmentsTable installments={installments} />
        </div>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line/70 pb-2">
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium break-words text-ink tabular-nums">{value}</dd>
    </div>
  );
}
