"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { digitsOnly, formatNumber, toPersianDigits } from "@/lib/format/number";
import type { Installment } from "@/types/domain";
import { installmentsApi } from "../client-api";

type PayInstallmentDialogProps = {
  installment: Installment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function customerName(installment: Installment): string {
  if (typeof installment.user === "string" || !installment.user) return "—";
  return (
    `${installment.user.name ?? ""} ${installment.user.lastName ?? ""}`.trim() || "—"
  );
}

/**
 * Uploads a receipt and marks the installment paid.
 *
 * The backend only accepts a pending installment whose receipt is still null,
 * so the button that opens this dialog is hidden for anything already settled.
 */
export function PayInstallmentDialog({
  installment,
  open,
  onOpenChange,
}: PayInstallmentDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [receipt, setReceipt] = useState<string[]>([]);
  const [waiverInput, setWaiverInput] = useState(() =>
    installment.waivedLateDays ? String(installment.waivedLateDays) : "",
  );
  const [preview, setPreview] = useState<Installment | null>(null);
  const [waiverError, setWaiverError] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const daysOverdue = installment.daysOverdue ?? 0;
  const waivedLateDays = preview
    ? (preview.waivedLateDays ?? null)
    : (installment.waivedLateDays ?? null);
  const payableAmount = preview
    ? preview.payableAmount
    : (installment.payableAmount ?? installment.amountWithInterest);
  const latePenalty = preview
    ? (preview.latePenalty ?? 0)
    : (installment.latePenalty ?? 0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function handleCalculate() {
    const raw = waiverInput.trim();
    const value = raw === "" ? null : Number(raw);

    if (value !== null) {
      if (!Number.isInteger(value) || value < 0) {
        setWaiverError("تعداد روزهای بخشودگی باید عدد صحیح و نامنفی باشد.");
        return;
      }

      if (value > daysOverdue) {
        setWaiverError(
          `تعداد روزهای بخشودگی نمی‌تواند بیشتر از ${toPersianDigits(daysOverdue)} روز دیرکرد باشد.`,
        );
        return;
      }
    }

    setWaiverError(null);
    setCalculating(true);
    const result = await installmentsApi.updateWaiver(installment._id, value);
    setCalculating(false);

    if (!result.ok) {
      setWaiverError(result.message);
      return;
    }

    setPreview(result.data);
  }

  async function handlePay() {
    if (!receipt[0]) {
      setError("تصویر رسید پرداخت را اضافه کنید.");
      return;
    }

    setError(null);
    setPending(true);
    const result = await installmentsApi.pay(installment._id, receipt[0]);
    setPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    toast.success("قسط با موفقیت پرداخت شد.");
    setReceipt([]);
    setPreview(null);
    setWaiverInput("");
    setWaiverError(null);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !pending) onOpenChange(false);
      }}
      className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-0 text-ink shadow-panel backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-black text-ink">ثبت پرداخت قسط</h2>
          <p className="text-xs leading-6 text-ink-muted">
            تصویر رسید پرداخت را اضافه کنید. پس از ثبت، وضعیت قسط به «پرداخت شده» تغییر
            می‌کند.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-field bg-surface-sunken px-4 py-3 text-xs">
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-ink-muted">مشتری</dt>
            <dd className="font-bold text-ink">{customerName(installment)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-ink-muted">شماره قسط</dt>
            <dd className="font-bold text-ink">{toPersianDigits(installment.no)}</dd>
          </div>
          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-ink-muted">سررسید</dt>
            <dd className="font-bold text-ink">
              {toPersianDigits(installment.dueDateJalaly)}
            </dd>
          </div>

          <div className="flex flex-col gap-0.5">
            <dt className="text-[11px] text-ink-muted">مبلغ قسط</dt>
            <dd className="font-bold tabular-nums">
              {formatNumber(installment.amountWithInterest)} تومان
            </dd>
          </div>

          {daysOverdue > 0 ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-[11px] text-ink-muted">روزهای دیرکرد</dt>
              <dd className="font-bold text-danger-text tabular-nums">
                {toPersianDigits(daysOverdue)} روز
              </dd>
            </div>
          ) : null}
          {latePenalty > 0 ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-[11px] text-ink-muted">جریمه دیرکرد</dt>
              <dd className="font-bold text-danger-text tabular-nums">
                {formatNumber(latePenalty)} تومان
              </dd>
            </div>
          ) : null}
          {waivedLateDays ? (
            <div className="flex flex-col gap-0.5">
              <dt className="text-[11px] text-ink-muted">بخشودگی</dt>
              <dd className="font-bold text-green-600 tabular-nums">
                {toPersianDigits(waivedLateDays)} روز
              </dd>
            </div>
          ) : null}
        </dl>

        {daysOverdue > 0 && (
          <div className="flex items-center gap-2">
            <Field
              id="waived-late-days"
              label="بخشودگی (روز)"
              hint={
                daysOverdue > 0
                  ? `حداکثر ${toPersianDigits(daysOverdue)} روز دیرکرد قابل بخشش است.`
                  : "این قسط دیرکردی ندارد."
              }
              error={waiverError ?? undefined}
              className="flex-1"
            >
              {(control) => (
                <Input
                  {...control}
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  placeholder="۰"
                  value={waiverInput}
                  disabled={daysOverdue === 0 || calculating || pending}
                  onChange={(event) => setWaiverInput(digitsOnly(event.target.value))}
                />
              )}
            </Field>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={calculating}

              onClick={handleCalculate}
              className="py-6"
            >
              محاسبه
            </Button>
          </div>
        )}

        <ImageUploader
          label="تصویر رسید پرداخت"
          description="JPG، PNG یا WEBP — حداکثر ۵ مگابایت"
          value={receipt}
          onChange={setReceipt}
        />

        {error ? <Alert tone="error">{error}</Alert> : null}
      </div>

      <div className="flex items-end justify-between gap-2 border-t border-line bg-surface-sunken px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[11px] text-ink-muted">قابل پرداخت</dt>
          <dd className="font-bold text-ink tabular-nums">
            {formatNumber(payableAmount)} تومان
          </dd>
        </div>
        <div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
          <Button type="button" size="sm" isLoading={pending} onClick={handlePay}>
            ثبت پرداخت
          </Button>
        </div>
      </div>
    </dialog>
  );
}
