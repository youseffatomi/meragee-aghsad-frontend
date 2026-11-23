"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageOff, Package, ReceiptText } from "lucide-react";

import { Lightbox } from "@/components/ui/lightbox";
import { routes } from "@/config/routes";
import { fileSrc } from "@/lib/files/url";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import { site } from "@/config/site";
import type { Product, ProductInvoiceRef, ProductUserRef } from "@/types/domain";

function invoiceRef(product: Product): ProductInvoiceRef | null {
  if (!product.invoiceId) return null;
  return typeof product.invoiceId === "string"
    ? { _id: product.invoiceId }
    : product.invoiceId;
}

function customerName(product: Product): string {
  if (!product.user || typeof product.user === "string") return "—";
  const user: ProductUserRef = product.user;
  return `${user.name ?? ""} ${user.lastName ?? ""}`.trim() || "—";
}

function customerPhone(product: Product): string | null {
  if (!product.user || typeof product.user === "string") return null;
  return product.user.phoneNumbers?.primary ?? null;
}

/** One product tile with its picture, price, owner and invoice shortcut. */
export function ProductCard({ product }: { product: Product }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const pictures = (product.pictures ?? []).filter(Boolean);
  const cover = fileSrc(pictures[0]);
  const invoice = invoiceRef(product);
  const phone = customerPhone(product);

  return (
    <article className="flex flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="relative aspect-[4/3] bg-surface-sunken">
        {cover ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label={`نمایش بزرگ تصویر ${product.name}`}
            className="group block size-full focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cover}
              alt={product.name}
              loading="lazy"
              className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </button>
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-2 text-ink-muted">
            <ImageOff className="size-8" aria-hidden="true" />
            <span className="text-[11px]">بدون تصویر</span>
          </div>
        )}

        {pictures.length > 1 ? (
          <span className="absolute end-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[11px] font-bold text-white">
            {toPersianDigits(pictures.length)} تصویر
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h2 className="line-clamp-1 text-sm font-bold text-ink">{product.name}</h2>

        <p className="text-base font-black text-brand-700 tabular-nums">
          {formatNumber(product.price)}{" "}
          <span className="text-[11px] font-medium text-ink-muted">{site.currency}</span>
        </p>

        <dl className="flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center justify-between gap-2">
            <dt className="text-ink-muted">IMEI</dt>
            <dd dir="ltr" className="font-bold text-ink tabular-nums">
              {product.imei ? toPersianDigits(product.imei) : "—"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-2">
            <dt className="text-ink-muted">مشتری</dt>
            <dd className="max-w-[60%] truncate font-bold text-ink">
              {customerName(product)}
            </dd>
          </div>

          {phone ? (
            <div className="flex items-center justify-between gap-2">
              <dt className="text-ink-muted">تماس</dt>
              <dd dir="ltr" className="font-bold text-ink tabular-nums">
                {toPersianDigits(phone)}
              </dd>
            </div>
          ) : null}
        </dl>

        {product.details ? (
          <p className="line-clamp-3 border-t border-line pt-3 text-[11px] leading-5 text-ink-muted">
            {product.details}
          </p>
        ) : null}

        <div className="mt-auto pt-1">
          {invoice ? (
            <Link
              href={routes.invoices.one(invoice._id)}
              className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-field bg-brand-700 text-xs font-bold text-white shadow-card transition-colors hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
            >
              <ReceiptText className="size-4" aria-hidden="true" />
              مشاهده فاکتور
            </Link>
          ) : (
            <span className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-field border border-line bg-surface-sunken text-xs font-bold text-ink-muted/60">
              <Package className="size-4" aria-hidden="true" />
              فاکتور ثبت نشده
            </span>
          )}
        </div>
      </div>

      <Lightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        src={cover}
        alt={product.name}
      />
    </article>
  );
}
