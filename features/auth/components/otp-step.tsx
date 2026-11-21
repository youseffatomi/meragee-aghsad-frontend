"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/otp-input";
import { validation } from "@/config/validation";
import { applyFieldErrors } from "@/lib/forms/apply-field-errors";
import { toPersianDigits } from "@/lib/format/number";
import { authApi } from "../api";
import { otpSchema, type OtpInput as OtpValues } from "../schemas";

/**
 * Step two: the code.
 *
 * Submitting happens on its own once the last box is filled — asking a user to
 * type four digits and then hunt for a button is friction for no reason. The
 * button stays for the case where the code was filled by a paste that the form
 * could not auto-submit.
 */

const RESEND_SECONDS = 120;

type OtpStepProps = {
  phoneNumber: string;
  onChangeNumber: () => void;
  onVerified: (redirectTo: string) => void;
};

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${toPersianDigits(minutes)}:${toPersianDigits(seconds)}`;
}

export function OtpStep({ phoneNumber, onChangeNumber, onVerified }: OtpStepProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const { errors, isSubmitting, isSubmitted } = form.formState;
  const otp = useWatch({ control: form.control, name: "otp" });

  // A plain timeout rather than an interval: it re-arms only while there is
  // something left to count, and stops on its own at zero.
  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    setNotice(null);

    const result = await authApi.verifyOtp({ phoneNumber, otp: values.otp });

    if (!result.ok) {
      applyFieldErrors(result, form);
      setFormError(result.message);
      return;
    }

    onVerified(result.data.redirectTo);
  });

  async function resend() {
    setIsResending(true);
    setFormError(null);
    setNotice(null);

    const result = await authApi.sendOtp({ phoneNumber });

    setIsResending(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    setSecondsLeft(RESEND_SECONDS);
    setNotice("کد تأیید دوباره ارسال شد.");
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <p className="text-center text-xs leading-6 text-ink-muted">
        کد {toPersianDigits(validation.otp.length)} رقمی ارسال‌شده به{" "}
        <span dir="ltr" className="font-medium text-ink">
          {toPersianDigits(phoneNumber)}
        </span>{" "}
        را وارد کنید.
      </p>

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="sr-only">کد تأیید</legend>

        <OtpInput
          value={otp}
          onChange={(value) =>
            form.setValue("otp", value, { shouldValidate: isSubmitted })
          }
          length={validation.otp.length}
          disabled={isSubmitting}
          invalid={Boolean(errors.otp)}
          autoFocus
          describedBy={errors.otp ? "otp-error" : undefined}
          onComplete={() => {
            if (!isSubmitting) void submit();
          }}
        />

        {errors.otp ? (
          <p id="otp-error" role="alert" className="text-center text-xs text-danger-text">
            {errors.otp.message}
          </p>
        ) : null}
      </fieldset>

      {formError ? <Alert tone="error">{formError}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
        تأیید و ورود
      </Button>

      <div className="flex items-center justify-between gap-2 text-xs">
        <button
          type="button"
          onClick={onChangeNumber}
          className="rounded text-ink-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
        >
          تغییر شماره
        </button>

        {secondsLeft > 0 ? (
          <span className="text-ink-muted tabular-nums">
            ارسال مجدد تا {formatCountdown(secondsLeft)}
          </span>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={isResending}
            className="rounded font-medium text-brand-text transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none disabled:opacity-50"
          >
            {isResending ? "در حال ارسال…" : "ارسال مجدد کد"}
          </button>
        )}
      </div>
    </form>
  );
}
