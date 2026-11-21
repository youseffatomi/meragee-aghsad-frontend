import { site } from "@/config/site";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const PERSIAN_ZERO = 0x06f0;
const ARABIC_ZERO = 0x0660;

const numberFormatter = new Intl.NumberFormat("fa-IR");

/**
 * Rewrites Persian and Arabic-Indic digits as Latin ones.
 *
 * Needed on every numeric field: a Persian keyboard produces `۰۹۱۲…`, but the
 * backend only understands `0912…`. Normalising as the user types means the
 * value in the form is already valid, so nothing has to be translated later.
 */
export function normalizeDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code >= PERSIAN_ZERO ? code - PERSIAN_ZERO : code - ARABIC_ZERO);
  });
}

/** Strips everything that is not a digit, then normalises: "۰۹۱۲ ۳۴۵" -> "0912345" */
export function digitsOnly(value: string): string {
  return normalizeDigits(value).replace(/\D/g, "");
}

/**
 * Converts Latin digits to Persian ones without any grouping or padding.
 * Use this for identifiers that must stay verbatim — OTP codes, phone numbers,
 * national IDs — where `Intl` would be wrong or unnecessary.
 */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

/** Formats a count with Persian digits and the Persian thousands separator: 12500 -> "۱۲٬۵۰۰" */
export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

/** Formats an amount with the domain currency: 12500000 -> "۱۲٬۵۰۰٬۰۰۰ تومان" */
export function formatToman(value: number): string {
  return `${numberFormatter.format(value)} ${site.currency}`;
}

/** Formats a 0–100 ratio as a percentage: 64 -> "۶۴٪" */
export function formatPercent(value: number): string {
  return `${numberFormatter.format(Math.round(value))}٪`;
}
