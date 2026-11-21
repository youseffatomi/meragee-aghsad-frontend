import { z } from "zod";

import { validation } from "@/config/validation";
import { toPersianDigits } from "@/lib/format/number";

/**
 * The login contract, shared by the browser form and the Route Handler.
 *
 * One schema for both sides is deliberate: a rule that only exists on the
 * client is a rule the server does not enforce, and two copies always drift.
 *
 * Digits are normalised in the input components before they reach here, so
 * these schemas can assume Latin numerals. Messages are written with Persian
 * digits at the source rather than relying on the font to redraw them.
 */

const phoneNumber = z
  .string()
  .trim()
  .min(1, "شماره موبایل را وارد کنید.")
  .regex(/^\d+$/, "شماره موبایل فقط می‌تواند شامل رقم باشد.")
  .min(
    validation.phoneNumber.minLength,
    `شماره موبایل باید حداقل ${toPersianDigits(validation.phoneNumber.minLength)} رقم باشد.`,
  )
  .max(
    validation.phoneNumber.maxLength,
    `شماره موبایل نمی‌تواند بیشتر از ${toPersianDigits(validation.phoneNumber.maxLength)} رقم باشد.`,
  );

const otp = z
  .string()
  .trim()
  .min(1, "کد تأیید را وارد کنید.")
  .regex(
    new RegExp(`^\\d{${validation.otp.length}}$`),
    `کد تأیید باید ${toPersianDigits(validation.otp.length)} رقم باشد.`,
  );

export const sendOtpSchema = z.object({ phoneNumber });

export const otpSchema = z.object({ otp });

export const verifyOtpSchema = z.object({ phoneNumber, otp });

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
