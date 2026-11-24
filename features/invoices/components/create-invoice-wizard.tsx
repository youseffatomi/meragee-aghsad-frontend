"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch, type Path } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { JalaliDatePicker } from "@/components/ui/date-picker";
import { Textarea } from "@/components/ui/textarea";
import { WizardStepper } from "@/components/ui/wizard-stepper";
import { routes } from "@/config/routes";
import { validation } from "@/config/validation";
import { isoToJalaliInput, jalaliInputToIso, todayJalaliInput } from "@/lib/date/range";
import { formatNumber, toPersianDigits } from "@/lib/format/number";
import type { User } from "@/types/domain";
import { invoicesApi } from "../client-api";
import {
  calculateInstallments,
  emptyPledge,
  emptyProduct,
  invoiceInputSchema,
  type CreateInvoiceInput,
} from "../schemas";
import { CustomerPicker } from "./customer-picker";

const STEPS = [
  { title: "انتخاب مشتری" },
  { title: "محصولات" },
  { title: "مشخصات فاکتور" },
  { title: "ضمانت‌ها" },
  { title: "جمع‌بندی و ثبت" },
] as const;

const STEP_FIELDS: Path<CreateInvoiceInput>[][] = [
  ["user"],
  ["products"],
  ["start_date", "downPayment", "installmentCount"],
  ["pledge"],
  [],
];

function defaultValues(): CreateInvoiceInput {
  return {
    user: "",
    products: [emptyProduct()],
    pledge: [],
    downPayment: 0,
    start_date: todayJalaliInput(),
    installmentCount: 12,
  };
}

function stepForField(field: string): number {
  if (field === "user") return 0;
  if (field.startsWith("products")) return 1;
  if (field.startsWith("pledge")) return 3;
  return 2;
}

function numericValue(value: string): number {
  return value === "" ? 0 : Number(value);
}

export function CreateInvoiceWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<CreateInvoiceInput>({
    resolver: zodResolver(invoiceInputSchema),
    defaultValues: defaultValues(),
  });

  const productsArray = useFieldArray({ control: form.control, name: "products" });
  const pledgeArray = useFieldArray({ control: form.control, name: "pledge" });

  const { errors, isSubmitting } = form.formState;
  const values = useWatch({ control: form.control }) as CreateInvoiceInput;
  const watchedProducts = values.products ?? [];
  const watchedPledges = values.pledge ?? [];

  const total = watchedProducts.reduce(
    (sum, product) => sum + (Number.isFinite(product?.price) ? product.price : 0),
    0,
  );
  const downPayment = Number(values.downPayment) || 0;
  const installmentCount = Number(values.installmentCount) || 0;
  const summary = calculateInstallments(total, downPayment, installmentCount);

  async function next() {
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!valid) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function back() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function resetWizard() {
    form.reset(defaultValues());
    setSelectedUser(null);
    setStep(0);
    setFormError(null);
  }

  const submit = form.handleSubmit(async (formValues) => {
    setFormError(null);

    const result = await invoicesApi.create(formValues);

    if (!result.ok) {
      let targetStep = STEPS.length - 1;

      for (const { field, message } of result.fieldErrors) {
        form.setError(field as Path<CreateInvoiceInput>, {
          type: "server",
          message,
        });
        targetStep = Math.min(targetStep, stepForField(field));
      }

      if (result.fieldErrors.length > 0) setStep(targetStep);
      setFormError(result.message);
      return;
    }

    toast.success("فاکتور با موفقیت ثبت شد و اقساط آن ساخته شد.");
    resetWizard();
    router.replace(routes.invoices.one(result.data._id));
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
              <h2 className="text-sm font-bold text-ink">انتخاب مشتری</h2>
              <p className="mt-1 text-xs text-ink-muted">
                مشتری را با نام، کد ملی یا شماره تماس پیدا کنید. فاکتور به همین کاربر تعلق
                می‌گیرد.
              </p>
            </header>

            <CustomerPicker
              selected={selectedUser}
              onSelect={(user) => {
                setSelectedUser(user);
                form.setValue("user", user?._id ?? "", { shouldValidate: true });
              }}
              error={errors.user?.message}
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-5">
            <header>
              <h2 className="text-sm font-bold text-ink">مشخصات فاکتور</h2>
              <p className="mt-1 text-xs text-ink-muted">
                تاریخ شروع، پیش‌پرداخت و تعداد اقساط را مشخص کنید.
              </p>
            </header>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-field border border-brand-200 bg-brand-50 px-4 py-3">
              <span className="text-xs font-medium text-ink-muted">مبلغ کل محصولات</span>
              <strong className="text-base font-bold text-ink tabular-nums">
                {formatNumber(total)}{" "}
                <span className="text-xs font-medium text-ink-muted">تومان</span>
              </strong>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field
                id="startDate"
                label="تاریخ شروع"
                required
                error={errors.start_date?.message}
                hint="تاریخ شمسی؛ روز حداکثر ۳۰"
              >
                {(control) => (
                  <JalaliDatePicker
                    id={control.id}
                    value={jalaliInputToIso(values.start_date)}
                    onChange={(iso) =>
                      form.setValue("start_date", iso ? isoToJalaliInput(iso) : "", {
                        shouldValidate: form.formState.isSubmitted,
                      })
                    }
                    invalid={Boolean(errors.start_date)}
                    aria-describedby={control["aria-describedby"]}
                  />
                )}
              </Field>

              <Field
                id="installmentCount"
                label="تعداد اقساط"
                required
                error={errors.installmentCount?.message}
                hint={`بین ${toPersianDigits(validation.invoice.installmentCount.min)} تا ${toPersianDigits(validation.invoice.installmentCount.max)} قسط`}
              >
                {(control) => (
                  <Input
                    {...control}
                    {...form.register("installmentCount", {
                      setValueAs: numericValue,
                    })}
                    type="number"
                    min={validation.invoice.installmentCount.min}
                    max={validation.invoice.installmentCount.max}
                    inputMode="numeric"
                    invalid={Boolean(errors.installmentCount)}
                  />
                )}
              </Field>

              <Field
                id="downPayment"
                label="پیش‌پرداخت (تومان)"
                required
                error={errors.downPayment?.message}
                className="sm:col-span-2"
              >
                {(control) => (
                  <Input
                    {...control}
                    {...form.register("downPayment", { setValueAs: numericValue })}
                    type="number"
                    min={0}
                    inputMode="numeric"
                    invalid={Boolean(errors.downPayment)}
                  />
                )}
              </Field>
            </div>

            {total > 0 && installmentCount > 0 ? (
              <section className="flex flex-col gap-3 rounded-field border border-line bg-surface-sunken p-4">
                <h3 className="text-xs font-bold text-ink">پیش‌نمایش اقساط</h3>

                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                  <InstallmentPreviewItem
                    label="مبلغ باقی‌مانده"
                    value={formatNumber(summary.remaining)}
                  />
                  <InstallmentPreviewItem
                    label="سود کل (۵٪)"
                    value={formatNumber(Math.round(summary.interest))}
                  />
                  <InstallmentPreviewItem
                    label="مبلغ هر قسط بدون سود"
                    value={formatNumber(summary.base)}
                  />
                  <InstallmentPreviewItem
                    label="مبلغ هر قسط با سود"
                    value={formatNumber(summary.final)}
                    highlight
                  />
                </dl>
              </section>
            ) : null}
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-6">
            <header>
              <h2 className="text-sm font-bold text-ink">محصولات</h2>
              <p className="mt-1 text-xs text-ink-muted">
                هر محصول را جداگانه اضافه کنید. هر محصول باید حداقل یک تصویر داشته باشد.
              </p>
            </header>

            {errors.products?.message ? (
              <p className="text-xs leading-5 text-danger-text" role="alert">
                {errors.products.message}
              </p>
            ) : null}

            <div className="flex flex-col gap-5">
              {productsArray.fields.map((field, index) => {
                const product = watchedProducts[index];
                const productErrors = errors.products?.[index];

                return (
                  <section
                    key={field.id}
                    className="flex flex-col gap-4 rounded-field border border-line bg-surface-sunken/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-bold text-ink">
                        محصول {toPersianDigits(index + 1)}
                      </h3>

                      {productsArray.fields.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => productsArray.remove(index)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-danger-text transition-colors hover:text-danger focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                          حذف
                        </button>
                      ) : null}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        id={`product-${index}-name`}
                        label="نام محصول"
                        required
                        error={productErrors?.name?.message}
                      >
                        {(control) => (
                          <Input
                            {...control}
                            {...form.register(`products.${index}.name`)}
                            invalid={Boolean(productErrors?.name)}
                          />
                        )}
                      </Field>

                      <Field
                        id={`product-${index}-price`}
                        label="قیمت (تومان)"
                        required
                        error={productErrors?.price?.message}
                      >
                        {(control) => (
                          <Input
                            {...control}
                            {...form.register(`products.${index}.price`, {
                              setValueAs: numericValue,
                            })}
                            type="number"
                            min={0}
                            inputMode="numeric"
                            invalid={Boolean(productErrors?.price)}
                          />
                        )}
                      </Field>

                      <Field
                        id={`product-${index}-imei`}
                        label="IMEI"
                        error={productErrors?.imei?.message}
                        hint="اختیاری"
                      >
                        {(control) => (
                          <Input
                            {...control}
                            {...form.register(`products.${index}.imei`)}
                            dir="ltr"
                            inputMode="numeric"
                            invalid={Boolean(productErrors?.imei)}
                          />
                        )}
                      </Field>

                      <Field
                        id={`product-${index}-details`}
                        label="جزئیات"
                        required
                        error={productErrors?.details?.message}
                        className="sm:col-span-2"
                      >
                        {(control) => (
                          <Textarea
                            {...control}
                            {...form.register(`products.${index}.details`)}
                            invalid={Boolean(productErrors?.details)}
                            className="min-h-20"
                          />
                        )}
                      </Field>
                    </div>

                    <ImageUploader
                      label="تصاویر محصول"
                      description="می‌توانید چند تصویر اضافه کنید"
                      multiple
                      compact
                      value={product?.pictures ?? []}
                      onChange={(next) =>
                        form.setValue(`products.${index}.pictures`, next, {
                          shouldValidate: form.formState.isSubmitted,
                          shouldDirty: true,
                        })
                      }
                    />

                    {productErrors?.pictures?.message ? (
                      <p className="text-xs leading-5 text-danger-text" role="alert">
                        {productErrors.pictures.message}
                      </p>
                    ) : null}
                  </section>
                );
              })}
            </div>

            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => productsArray.append(emptyProduct())}
              >
                <Plus className="size-4" aria-hidden="true" />
                افزودن محصول
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-6">
            <header>
              <h2 className="text-sm font-bold text-ink">ضمانت‌ها</h2>
              <p className="mt-1 text-xs text-ink-muted">
                این مرحله اختیاری است. اگر ضمانتی ثبت نمی‌کنید، از آن رد شوید.
              </p>
            </header>

            {pledgeArray.fields.length === 0 ? (
              <p className="rounded-field bg-surface-sunken px-4 py-8 text-center text-xs text-ink-muted">
                هنوز ضمانتی اضافه نشده است.
              </p>
            ) : null}

            <div className="flex flex-col gap-5">
              {pledgeArray.fields.map((field, index) => {
                const pledge = watchedPledges[index];
                const pledgeErrors = errors.pledge?.[index];

                return (
                  <section
                    key={field.id}
                    className="flex flex-col gap-4 rounded-field border border-line bg-surface-sunken/40 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-xs font-bold text-ink">
                        ضمانت {toPersianDigits(index + 1)}
                      </h3>

                      <button
                        type="button"
                        onClick={() => pledgeArray.remove(index)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-danger-text transition-colors hover:text-danger focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        حذف
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field
                        id={`pledge-${index}-name`}
                        label="نام ضمانت"
                        required
                        error={pledgeErrors?.name?.message}
                      >
                        {(control) => (
                          <Input
                            {...control}
                            {...form.register(`pledge.${index}.name`)}
                            invalid={Boolean(pledgeErrors?.name)}
                          />
                        )}
                      </Field>

                      <Field
                        id={`pledge-${index}-details`}
                        label="جزئیات"
                        required
                        error={pledgeErrors?.details?.message}
                      >
                        {(control) => (
                          <Input
                            {...control}
                            {...form.register(`pledge.${index}.details`)}
                            invalid={Boolean(pledgeErrors?.details)}
                          />
                        )}
                      </Field>
                    </div>

                    <ImageUploader
                      label="تصویر ضمانت"
                      compact
                      value={pledge?.picture ? [pledge.picture] : []}
                      onChange={(next) =>
                        form.setValue(`pledge.${index}.picture`, next[0] ?? "", {
                          shouldValidate: form.formState.isSubmitted,
                          shouldDirty: true,
                        })
                      }
                    />

                    {pledgeErrors?.picture?.message ? (
                      <p className="text-xs leading-5 text-danger-text" role="alert">
                        {pledgeErrors.picture.message}
                      </p>
                    ) : null}
                  </section>
                );
              })}
            </div>

            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => pledgeArray.append(emptyPledge())}
              >
                <Plus className="size-4" aria-hidden="true" />
                افزودن ضمانت
              </Button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="flex flex-col gap-6">
            <header>
              <h2 className="text-sm font-bold text-ink">جمع‌بندی و ثبت</h2>
              <p className="mt-1 text-xs text-ink-muted">
                اطلاعات را یک بار دیگر بررسی کنید. با ثبت، اقساط به‌صورت خودکار ساخته
                می‌شوند.
              </p>
            </header>

            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <ReviewItem
                label="مشتری"
                value={
                  selectedUser
                    ? `${selectedUser.name} ${selectedUser.lastName}`.trim()
                    : "—"
                }
              />
              <ReviewItem
                label="کد ملی"
                value={selectedUser ? toPersianDigits(selectedUser.nationalId) : "—"}
                ltr
              />
              <ReviewItem
                label="تاریخ شروع"
                value={toPersianDigits(values.start_date || "—")}
              />
              <ReviewItem
                label="تعداد اقساط"
                value={toPersianDigits(installmentCount || 0)}
              />
              <ReviewItem label="مبلغ کل محصولات" value={formatNumber(total)} />
              <ReviewItem label="پیش‌پرداخت" value={formatNumber(downPayment)} />
              <ReviewItem
                label="مبلغ باقی‌مانده"
                value={formatNumber(summary.remaining)}
              />
              <ReviewItem
                label="سود (۵٪)"
                value={formatNumber(Math.round(summary.interest))}
              />
              <ReviewItem
                label="مبلغ هر قسط (بدون سود)"
                value={formatNumber(summary.base)}
              />
              <ReviewItem
                label="مبلغ هر قسط (با سود)"
                value={formatNumber(summary.final)}
              />
              <ReviewItem
                label="ضمانت‌ها"
                value={
                  watchedPledges.length > 0
                    ? `${toPersianDigits(watchedPledges.length)} مورد`
                    : "بدون ضمانت"
                }
              />
            </dl>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-ink-muted">محصولات</p>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[28rem] border-collapse text-xs">
                  <thead>
                    <tr className="text-ink-muted">
                      <th scope="col" className="pb-2 text-start font-medium">
                        نام
                      </th>
                      <th scope="col" className="pb-2 text-start font-medium">
                        جزئیات
                      </th>
                      <th scope="col" className="pb-2 text-start font-medium">
                        قیمت (تومان)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {watchedProducts.map((product, index) => (
                      <tr key={index} className="border-t border-line">
                        <td className="py-2 pe-3 font-bold text-ink">
                          {product?.name || "—"}
                        </td>
                        <td className="py-2 pe-3 text-ink-muted">
                          {product?.details || "—"}
                        </td>
                        <td className="py-2 font-bold text-ink tabular-nums">
                          {formatNumber(Number(product?.price) || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}

        {formError ? (
          <Alert tone="error" className="mt-5">
            {formError}
          </Alert>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Link
            href={routes.invoices.list}
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

            {step === 3 ? (
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
                ثبت فاکتور
              </Button>
            )}
          </div>
        </div>
      </form>
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

function InstallmentPreviewItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2">
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd
        className={
          highlight
            ? "text-sm font-bold text-brand-text tabular-nums"
            : "text-sm font-medium text-ink tabular-nums"
        }
      >
        {value} <span className="text-[10px] font-normal text-ink-muted">تومان</span>
      </dd>
    </div>
  );
}
