"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type Path } from "react-hook-form";
import { toast } from "sonner";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Lightbox } from "@/components/ui/lightbox";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { messages } from "@/config/messages";
import { ROLES, type Role } from "@/config/permissions";
import { routes } from "@/config/routes";
import { validation } from "@/config/validation";
import { fileSrc } from "@/lib/files/url";
import { digitsOnly, toPersianDigits } from "@/lib/format/number";
import { usersApi } from "../client-api";
import { createUserSchema, toUserPayload, type CreateUserInput } from "../schemas";
import { useUniqueCheck } from "../use-unique-check";
import { DocumentUploader } from "./document-uploader";
import { DocumentThumbnail } from "./document-thumbnail";
import { UniqueStatus } from "./unique-status";
import { WizardStepper } from "./wizard-stepper";

/**
 * Creating a user is a four-step wizard rather than one long form: the role
 * decides how much of the rest matters, and documents are a different kind of
 * input (upload) from the text fields before them.
 */

const STEPS = [
  { title: "نقش و اطلاعات هویتی" },
  { title: "اطلاعات تکمیلی" },
  { title: "مدارک" },
  { title: "مرور و ثبت" },
] as const;

const STEP_FIELDS: readonly (readonly Path<CreateUserInput>[])[] = [
  [
    "role",
    "name",
    "lastName",
    "nationalId",
    "phoneNumbers.primary",
    "phoneNumbers.secondary",
  ],
  [
    "residentialAddress",
    "employmentDetails.occupation",
    "employmentDetails.workplace",
    "guarantorContact",
  ],
  ["identityDocuments"],
  [],
];

function stepForField(field: string): number {
  if (
    ["role", "name", "lastName", "nationalId"].includes(field) ||
    field.startsWith("phoneNumbers")
  ) {
    return 0;
  }

  if (field.startsWith("identityDocuments")) return 2;

  return 1;
}

const ROLE_HINTS: Record<Role, string> = {
  SUPER_ADMIN: "دسترسی کامل به همه بخش‌های پنل",
  SELLER: "مشاهده کاربران و ثبت فاکتور",
  ACCOUNTANT: "حساب‌داری (بدون دسترسی به بخش‌های فعلی)",
  USER: "مشتری؛ صاحب فاکتور و اقساط",
};

export function CreateUserWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<{
    src: string;
    label: string;
  } | null>(null);
  const unique = useUniqueCheck();
  const checkTimers = useRef<{
    nationalId?: ReturnType<typeof setTimeout>;
    phone?: ReturnType<typeof setTimeout>;
  }>({});

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      role: "USER",
      name: "",
      lastName: "",
      nationalId: "",
      phoneNumbers: { primary: "", secondary: "" },
      residentialAddress: "",
      employmentDetails: { occupation: "", workplace: "" },
      guarantorContact: "",
      identityDocuments: { otherDocuments: [] },
    },
  });

  const { errors, isSubmitting } = form.formState;
  const values = useWatch({ control: form.control }) as CreateUserInput;

  const nationalId = useWatch({ control: form.control, name: "nationalId" });
  const primaryPhone = useWatch({
    control: form.control,
    name: "phoneNumbers.primary",
  });
  const secondaryPhone = useWatch({
    control: form.control,
    name: "phoneNumbers.secondary",
  });
  const nationalCardImage = useWatch({
    control: form.control,
    name: "identityDocuments.nationalCardImage",
  });
  const otherDocuments = useWatch({
    control: form.control,
    name: "identityDocuments.otherDocuments",
  });
  const nationalCardSrc = nationalCardImage ? fileSrc(`temp/${nationalCardImage}`) : null;

  const documentItems: { key: string; src: string; label: string }[] = [];

  if (nationalCardSrc) {
    documentItems.push({ key: "national-card", src: nationalCardSrc, label: "کارت ملی" });
  }

  for (const [index, filename] of (otherDocuments ?? []).entries()) {
    const src = fileSrc(`temp/${filename}`);
    if (src) {
      documentItems.push({
        key: `document-${index}`,
        src,
        label: `مدرک ${toPersianDigits(index + 1)}`,
      });
    }
  }

  useEffect(
    () => () => {
      if (checkTimers.current.nationalId) clearTimeout(checkTimers.current.nationalId);
      if (checkTimers.current.phone) clearTimeout(checkTimers.current.phone);
    },
    [],
  );

  /**
   * Runs the uniqueness check as soon as the value is complete, instead of
   * waiting for blur. The short debounce keeps a fast typist from firing one
   * request per keystroke (and for phones, once per digit past the minimum).
   */
  function scheduleUniqueCheck(field: "nationalId" | "phone", value: string) {
    if (checkTimers.current[field]) clearTimeout(checkTimers.current[field]);

    const complete =
      field === "nationalId"
        ? value.length === validation.nationalId.length
        : value.length >= validation.phoneNumber.minLength;

    if (!complete) return;

    checkTimers.current[field] = setTimeout(() => {
      void (field === "nationalId" ? checkNationalId() : checkPrimaryPhone());
    }, 400);
  }

  async function checkNationalId() {
    const value = digitsOnly(form.getValues("nationalId"));

    if (!value) {
      unique.reset("nationalId");
      return null;
    }

    if (value.length !== validation.nationalId.length) {
      unique.reset("nationalId");
      // Stay silent no longer: a pasted value with separators used to be cut
      // to fewer than 10 digits and the check simply never ran.
      form.setError("nationalId", {
        type: "length",
        message: `کد ملی باید ${toPersianDigits(validation.nationalId.length)} رقم باشد.`,
      });
      return null;
    }

    // The answer is surfaced by `UniqueStatus`, never through `form.setError`:
    // reporting the same fact twice put two identical lines under the field.
    return unique.check("nationalId", value);
  }

  async function checkPrimaryPhone() {
    const value = digitsOnly(form.getValues("phoneNumbers.primary"));

    if (value.length < validation.phoneNumber.minLength) {
      unique.reset("phone");
      return null;
    }

    return unique.check("phone", value);
  }

  async function next() {
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!valid) return;

    if (step === 0) {
      const nationalIdValue = digitsOnly(form.getValues("nationalId"));
      const phoneValue = digitsOnly(form.getValues("phoneNumbers.primary"));

      if (
        nationalIdValue.length === validation.nationalId.length &&
        !unique.isAvailable("nationalId", nationalIdValue)
      ) {
        if (checkTimers.current.nationalId) {
          clearTimeout(checkTimers.current.nationalId);
          checkTimers.current.nationalId = undefined;
        }
        const result = await checkNationalId();
        if (result?.taken) return;
      }

      if (
        phoneValue.length >= validation.phoneNumber.minLength &&
        !unique.isAvailable("phone", phoneValue)
      ) {
        if (checkTimers.current.phone) {
          clearTimeout(checkTimers.current.phone);
          checkTimers.current.phone = undefined;
        }
        const result = await checkPrimaryPhone();
        if (result?.taken) return;
      }
    }

    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0));
  }

  /**
   * Next keeps a previously visited route's client state alive, so leaving the
   * wizard and coming back would otherwise restore the old step and values.
   * Clearing everything here makes both "cancel" and "created" end in a fresh
   * form when the route is revisited.
   */
  function resetWizard() {
    if (checkTimers.current.nationalId) {
      clearTimeout(checkTimers.current.nationalId);
      checkTimers.current.nationalId = undefined;
    }
    if (checkTimers.current.phone) {
      clearTimeout(checkTimers.current.phone);
      checkTimers.current.phone = undefined;
    }

    form.reset();
    unique.reset("nationalId");
    unique.reset("phone");
    setStep(0);
    setFormError(null);
  }

  const submit = form.handleSubmit(async (formValues) => {
    setFormError(null);

    const result = await usersApi.create(toUserPayload(formValues) as CreateUserInput);

    if (!result.ok) {
      let targetStep = STEPS.length - 1;

      for (const { field, message } of result.fieldErrors) {
        form.setError(field as Path<CreateUserInput>, {
          type: "server",
          message,
        });
        targetStep = Math.min(targetStep, stepForField(field));
      }

      if (result.fieldErrors.length > 0) setStep(targetStep);

      // A server rejection is authoritative, so drop the stale on-blur hint:
      // otherwise a green "available" line would sit beside the field error.
      if (result.fieldErrors.some((error) => error.field === "nationalId")) {
        unique.reset("nationalId");
      }

      if (result.fieldErrors.some((error) => error.field === "phoneNumbers.primary")) {
        unique.reset("phone");
      }

      setFormError(result.message);
      return;
    }

    toast.success("کاربر با موفقیت ثبت شد.");
    resetWizard();
    router.replace(routes.users.one(result.data._id));
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-line bg-surface p-5 shadow-card">
        <WizardStepper steps={STEPS} current={step} />
      </div>

      <form
        onSubmit={submit}
        noValidate
        className="rounded-card border border-line bg-surface p-5 shadow-card sm:p-6"
      >
        {step === 0 ? (
          <div className="flex flex-col gap-5">
            <header>
              <h2 className="text-sm font-bold text-ink">نقش و اطلاعات هویتی</h2>
              <p className="mt-1 text-xs text-ink-muted">
                نقش را انتخاب کنید؛ بقیه مراحل بر اساس همین نقش معنا پیدا می‌کنند.
              </p>
            </header>

            <Field
              id="role"
              label="نقش کاربر"
              required
              error={errors.role?.message}
              hint={ROLE_HINTS[values.role]}
            >
              {(control) => (
                <Select {...control} {...form.register("role")}>
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {messages.roles[role]}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="name" label="نام" required error={errors.name?.message}>
                {(control) => (
                  <Input
                    {...control}
                    {...form.register("name")}
                    invalid={Boolean(errors.name)}
                    autoComplete="given-name"
                  />
                )}
              </Field>

              <Field
                id="lastName"
                label="نام خانوادگی"
                required
                error={errors.lastName?.message}
              >
                {(control) => (
                  <Input
                    {...control}
                    {...form.register("lastName")}
                    invalid={Boolean(errors.lastName)}
                    autoComplete="family-name"
                  />
                )}
              </Field>

              <Field
                id="nationalId"
                label="کد ملی"
                required
                error={errors.nationalId?.message}
                hint="۱۰ رقم، بدون خط تیره"
              >
                {(control) => (
                  <>
                    <Input
                      {...control}
                      value={nationalId ?? ""}
                      onChange={(event) => {
                        // Cap after stripping separators: `maxLength` on the raw
                        // input truncated "123-456-7890" to "12345678".
                        const next = digitsOnly(event.target.value).slice(
                          0,
                          validation.nationalId.length,
                        );
                        form.setValue("nationalId", next, {
                          shouldValidate: form.formState.isSubmitted,
                        });
                        form.clearErrors("nationalId");
                        unique.reset("nationalId");
                        scheduleUniqueCheck("nationalId", next);
                      }}
                      invalid={
                        Boolean(errors.nationalId) ||
                        unique.state.nationalId.status === "taken"
                      }
                      dir="ltr"
                      inputMode="numeric"
                      autoComplete="off"
                    />
                    <UniqueStatus state={unique.state.nationalId} />
                  </>
                )}
              </Field>

              <Field
                id="primaryPhone"
                label="شماره تماس اصلی"
                required
                error={errors.phoneNumbers?.primary?.message}
                hint="مثال: 09123456789"
              >
                {(control) => (
                  <>
                    <Input
                      {...control}
                      value={primaryPhone ?? ""}
                      onChange={(event) => {
                        const next = digitsOnly(event.target.value);
                        form.setValue("phoneNumbers.primary", next, {
                          shouldValidate: form.formState.isSubmitted,
                        });
                        form.clearErrors("phoneNumbers.primary");
                        unique.reset("phone");
                        scheduleUniqueCheck("phone", next);
                      }}
                      invalid={
                        Boolean(errors.phoneNumbers?.primary) ||
                        unique.state.phone.status === "taken"
                      }
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                    <UniqueStatus state={unique.state.phone} />
                  </>
                )}
              </Field>

              <Field
                id="secondaryPhone"
                label="شماره تماس دوم"
                error={errors.phoneNumbers?.secondary?.message}
                hint="اختیاری"
                className="sm:col-span-2"
              >
                {(control) => (
                  <Input
                    {...control}
                    value={secondaryPhone ?? ""}
                    onChange={(event) =>
                      form.setValue(
                        "phoneNumbers.secondary",
                        digitsOnly(event.target.value),
                        { shouldValidate: form.formState.isSubmitted },
                      )
                    }
                    invalid={Boolean(errors.phoneNumbers?.secondary)}
                    dir="ltr"
                    inputMode="tel"
                  />
                )}
              </Field>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <header>
              <h2 className="text-sm font-bold text-ink">اطلاعات تکمیلی</h2>
              <p className="mt-1 text-xs text-ink-muted">
                این بخش اختیاری است و می‌توانید آن را رد کنید.
              </p>
            </header>

            <Field
              id="residentialAddress"
              label="آدرس محل سکونت"
              error={errors.residentialAddress?.message}
            >
              {(control) => (
                <Textarea
                  {...control}
                  {...form.register("residentialAddress")}
                  invalid={Boolean(errors.residentialAddress)}
                  className="min-h-20"
                />
              )}
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="occupation"
                label="شغل"
                error={errors.employmentDetails?.occupation?.message}
              >
                {(control) => (
                  <Input
                    {...control}
                    {...form.register("employmentDetails.occupation")}
                    invalid={Boolean(errors.employmentDetails?.occupation)}
                  />
                )}
              </Field>

              <Field
                id="workplace"
                label="محل کار"
                error={errors.employmentDetails?.workplace?.message}
              >
                {(control) => (
                  <Input
                    {...control}
                    {...form.register("employmentDetails.workplace")}
                    invalid={Boolean(errors.employmentDetails?.workplace)}
                  />
                )}
              </Field>

              <Field
                id="guarantorContact"
                label="شماره تماس ضامن"
                error={errors.guarantorContact?.message}
                className="sm:col-span-2"
              >
                {(control) => (
                  <Input
                    {...control}
                    {...form.register("guarantorContact")}
                    invalid={Boolean(errors.guarantorContact)}
                    dir="ltr"
                    inputMode="tel"
                  />
                )}
              </Field>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-6">
            <header>
              <h2 className="text-sm font-bold text-ink">مدارک هویتی</h2>
              <p className="mt-1 text-xs text-ink-muted">
                آپلود مدارک اختیاری است. هر تصویری که اضافه می‌کنید تا لحظه ثبت در پوشه
                موقت نگهداری می‌شود.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <DocumentUploader
                label="تصویر کارت ملی"
                description="یک تصویر، ترجیحاً واضح و بدون بازتاب نور"
                compact
                value={nationalCardImage ? [nationalCardImage] : []}
                onChange={(next) =>
                  form.setValue("identityDocuments.nationalCardImage", next[0], {
                    shouldDirty: true,
                  })
                }
              />

              <DocumentUploader
                label="سایر مدارک"
                description="می‌توانید چند تصویر اضافه کنید"
                multiple
                compact
                value={otherDocuments ?? []}
                onChange={(next) =>
                  form.setValue("identityDocuments.otherDocuments", next, {
                    shouldDirty: true,
                  })
                }
              />
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-5">
            <header>
              <h2 className="text-sm font-bold text-ink">مرور و ثبت</h2>
              <p className="mt-1 text-xs text-ink-muted">
                اطلاعات را یک بار دیگر بررسی کنید. پس از ثبت، نقش قابل تغییر نیست.
              </p>
            </header>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <ReviewItem label="نقش" value={messages.roles[values.role]} />
              <ReviewItem
                label="نام و نام خانوادگی"
                value={`${values.name} ${values.lastName}`.trim()}
              />
              <ReviewItem label="کد ملی" value={toPersianDigits(values.nationalId)} ltr />
              <ReviewItem
                label="شماره تماس اصلی"
                value={toPersianDigits(values.phoneNumbers.primary)}
                ltr
              />
              <ReviewItem
                label="شماره تماس دوم"
                value={
                  values.phoneNumbers.secondary
                    ? toPersianDigits(values.phoneNumbers.secondary)
                    : "—"
                }
                ltr
              />
              <ReviewItem label="آدرس" value={values.residentialAddress || "—"} />
              <ReviewItem
                label="شغل"
                value={values.employmentDetails?.occupation || "—"}
              />
              <ReviewItem
                label="محل کار"
                value={values.employmentDetails?.workplace || "—"}
              />
              <ReviewItem label="ضامن" value={values.guarantorContact || "—"} />
              <ReviewItem
                label="مدارک"
                value={`${nationalCardImage ? 1 : 0} کارت ملی، ${otherDocuments?.length ?? 0} مدرک دیگر`}
              />
            </dl>

            {documentItems.length > 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-[11px] text-ink-muted">مدارک هویتی</p>
                <div className="flex flex-wrap gap-3">
                  {documentItems.map((item) => (
                    <DocumentThumbnail
                      key={item.key}
                      src={item.src}
                      alt={item.label}
                      label={item.label}
                      className="w-28"
                      onOpen={() =>
                        setSelectedDocument({ src: item.src, label: item.label })
                      }
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {formError ? (
          <Alert tone="error" className="mt-5">
            {formError}
          </Alert>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Link
            href={routes.users.list}
            onClick={resetWizard}
            className="text-xs font-medium text-ink-muted transition-colors hover:text-ink"
          >
            انصراف
          </Link>

          <div className="flex items-center gap-2">
            {step > 0 ? (
              <Button type="button" variant="secondary" onClick={back}>
                مرحله قبل
              </Button>
            ) : null}

            {step === 1 || step === 2 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((current) => current + 1)}
              >
                رد کردن
              </Button>
            ) : null}

            {step < STEPS.length - 1 && (
              <Button type="button" onClick={next}>
                مرحله بعد
              </Button>
            )}

            {step == STEPS.length - 1 && (
              <Button type="submit" isLoading={isSubmitting}>
                ثبت کاربر
              </Button>
            )}
          </div>
        </div>
      </form>

      <Lightbox
        open={Boolean(selectedDocument)}
        onOpenChange={(open) => {
          if (!open) setSelectedDocument(null);
        }}
        src={selectedDocument?.src ?? null}
        alt={selectedDocument?.label ?? ""}
      />
    </div>
  );
}

function ReviewItem({
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
