import { isValidJalaaliDate } from "jalaali-js";
import { z } from "zod";

import { validation } from "@/config/validation";

/**
 * The invoice payload, mirroring the backend's `InvoiceInput`.
 *
 * `start_date` stays a Jalali string (`1405/08/25`) because that is exactly what
 * the backend expects; the date picker converts to and from it.
 */

const objectId = z.string().regex(/^[a-f0-9]{24}$/i, "مشتری را انتخاب کنید.");

export const invoiceProductSchema = z.object({
  name: z.string().trim().min(1, "نام محصول را وارد کنید."),
  pictures: z.array(z.string().min(1)).min(1, "حداقل یک تصویر برای محصول لازم است."),
  price: z
    .number({ error: "قیمت محصول را وارد کنید." })
    .nonnegative("قیمت محصول نمی‌تواند منفی باشد."),
  details: z.string().trim().min(1, "جزئیات محصول را وارد کنید."),
  imei: z.string().trim().optional(),
});

export const invoicePledgeSchema = z.object({
  name: z.string().trim().min(1, "نام ضمانت را وارد کنید."),
  picture: z.string().min(1, "تصویر ضمانت را اضافه کنید."),
  details: z.string().trim().min(1, "جزئیات ضمانت را وارد کنید."),
});

const jalaliDate = z
  .string()
  .regex(/^\d{4}\/\d{2}\/\d{2}$/, "تاریخ شروع را انتخاب کنید.");

export const invoiceInputSchema = z
  .object({
    user: objectId,
    products: z.array(invoiceProductSchema).min(1, "حداقل یک محصول اضافه کنید."),
    pledge: z.array(invoicePledgeSchema),
    downPayment: z
      .number({ error: "مبلغ پیش‌پرداخت را وارد کنید." })
      .nonnegative("پیش‌پرداخت نمی‌تواند منفی باشد."),
    start_date: jalaliDate,
    installmentCount: z
      .number({ error: "تعداد اقساط را وارد کنید." })
      .int("تعداد اقساط باید عدد صحیح باشد.")
      .min(validation.invoice.installmentCount.min, "حداقل یک قسط لازم است.")
      .max(
        validation.invoice.installmentCount.max,
        `حداکثر ${validation.invoice.installmentCount.max} قسط مجاز است.`,
      ),
  })
  .superRefine((values, ctx) => {
    const [jy, jm, jd] = values.start_date.split("/").map(Number);

    // The backend's installment generator rejects a day above 30, even in a
    // Jalali month that has 31 days.
    if (!isValidJalaaliDate(jy, jm, jd) || jd > 30) {
      ctx.addIssue({
        code: "custom",
        path: ["start_date"],
        message: "تاریخ شروع معتبر نیست؛ روز باید بین ۱ تا ۳۰ باشد.",
      });
    }

    const total = values.products.reduce(
      (sum, product) => sum + (Number.isFinite(product.price) ? product.price : 0),
      0,
    );

    if (total > 0 && values.downPayment >= total) {
      ctx.addIssue({
        code: "custom",
        path: ["downPayment"],
        message: "پیش‌پرداخت باید کمتر از مبلغ کل محصولات باشد.",
      });
    }
  });

export type CreateInvoiceInput = z.infer<typeof invoiceInputSchema>;
export type InvoiceProductInput = z.infer<typeof invoiceProductSchema>;
export type InvoicePledgeInput = z.infer<typeof invoicePledgeSchema>;

export function emptyProduct(): InvoiceProductInput {
  return { name: "", pictures: [], price: 0, details: "", imei: "" };
}

export function emptyPledge(): InvoicePledgeInput {
  return { name: "", picture: "", details: "" };
}

/**
 * The installment figures the backend will generate.
 *
 * Mirrors `CalculateInstallments`: interest is 5% of the remaining amount (not
 * per installment), and the final amount is the rounded base plus that interest.
 */
export function calculateInstallments(
  totalAmount: number,
  downPayment: number,
  installmentCount: number,
) {
  const remaining = Math.max(totalAmount - downPayment, 0);
  const interest = remaining * 0.05;
  const base = installmentCount > 0 ? Math.round(remaining / installmentCount) : 0;
  const final = Math.round(base + interest);

  return { remaining, interest, base, final };
}
