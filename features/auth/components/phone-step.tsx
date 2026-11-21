"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { validation } from "@/config/validation";
import { applyFieldErrors } from "@/lib/forms/apply-field-errors";
import { digitsOnly } from "@/lib/format/number";
import { authApi } from "../api";
import { sendOtpSchema, type SendOtpInput } from "../schemas";

/**
 * Step one: the phone number.
 *
 * The input is controlled rather than registered, because the value has to be
 * normalised on every keystroke — a Persian keyboard types `۰۹۱۲…` and the
 * backend only accepts `0912…`. Normalising here means the field never holds a
 * value that would fail validation for a reason the user cannot see.
 */

type PhoneStepProps = {
  defaultPhoneNumber?: string;
  onSent: (phoneNumber: string) => void;
};

export function PhoneStep({ defaultPhoneNumber = "", onSent }: PhoneStepProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SendOtpInput>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { phoneNumber: defaultPhoneNumber },
  });

  const { errors, isSubmitting, isSubmitted } = form.formState;
  const phoneNumber = useWatch({ control: form.control, name: "phoneNumber" });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);

    const result = await authApi.sendOtp(values);

    if (!result.ok) {
      applyFieldErrors(result, form);
      setFormError(result.message);
      return;
    }

    onSent(values.phoneNumber);
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Field
        id="phoneNumber"
        label="شماره موبایل"
        required
        error={errors.phoneNumber?.message}
        hint={`مثال: ${validation.phoneNumber.example}`}
      >
        {(control) => (
          <Input
            {...control}
            value={phoneNumber}
            onChange={(event) =>
              form.setValue("phoneNumber", digitsOnly(event.target.value), {
                shouldValidate: isSubmitted,
              })
            }
            invalid={Boolean(errors.phoneNumber)}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder={validation.phoneNumber.example}
            dir="ltr"
            className="text-center tracking-[0.2em]"
          />
        )}
      </Field>

      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
        دریافت کد تأیید
      </Button>
    </form>
  );
}
