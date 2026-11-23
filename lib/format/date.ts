import { toJalaali } from "jalaali-js";

import { toPersianDigits } from "./number";

/**
 * Formats an ISO timestamp as a Jalali date (`1405/08/25`).
 *
 * The backend already sends `dueDateJalaly` / `start_date_jalaly` for domain
 * dates; this helper is for timestamps that only exist in ISO form, such as
 * `createdAt`. Invalid or missing values render as an em dash rather than
 * "Invalid Date".
 */
export function formatJalaliDate(value?: string | null): string {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const { jy, jm, jd } = toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );

  return toPersianDigits(
    `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
  );
}

/**
 * Formats a Gregorian `YYYY-MM-DD` (the form the date filters use) as Jalali.
 *
 * Parsing it with `new Date("2026-01-01")` would read it as UTC midnight and
 * could land on the previous day locally, so the parts are read directly.
 */
export function formatJalaliIsoDate(value?: string | null): string {
  if (!value) return "—";

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return formatJalaliDate(value);

  const { jy, jm, jd } = toJalaali(Number(match[1]), Number(match[2]), Number(match[3]));

  return toPersianDigits(
    `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
  );
}
