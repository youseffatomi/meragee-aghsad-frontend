import { jalaaliMonthLength, toGregorian, toJalaali } from "jalaali-js";

/**
 * Date ranges for the filter presets.
 *
 * The UI speaks Jalali and the backend filters in Gregorian `YYYY-MM-DD`, so
 * every helper here returns the Gregorian form that goes straight into the URL
 * and the API query. Weeks start on Saturday, as they do in Iran.
 */

export type DateRange = { from: string; to: string };

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Local calendar date as `YYYY-MM-DD` (never UTC, which can shift the day). */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parses `YYYY-MM-DD` as a local date; returns `null` for anything else. */
export function fromIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Saturday is the first day of the week: `getDay()` returns 6 for it. */
export function startOfWeek(date: Date): Date {
  const diff = (date.getDay() + 1) % 7;
  return addDays(startOfDay(date), -diff);
}

export function endOfWeek(date: Date): Date {
  return addDays(startOfWeek(date), 6);
}

function jalaliParts(date: Date) {
  return toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function startOfJalaliMonth(date: Date): Date {
  const { jy, jm } = jalaliParts(date);
  const g = toGregorian(jy, jm, 1);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function endOfJalaliMonth(date: Date): Date {
  const { jy, jm } = jalaliParts(date);
  const g = toGregorian(jy, jm, jalaaliMonthLength(jy, jm));
  return new Date(g.gy, g.gm - 1, g.gd);
}

/** The Jalali month before `date`; January rolls back into the previous year. */
function previousJalaliMonth(date: Date): { jy: number; jm: number } {
  const { jy, jm } = jalaliParts(date);
  return jm === 1 ? { jy: jy - 1, jm: 12 } : { jy, jm: jm - 1 };
}

export function startOfPreviousJalaliMonth(date: Date): Date {
  const { jy, jm } = previousJalaliMonth(date);
  const g = toGregorian(jy, jm, 1);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function endOfPreviousJalaliMonth(date: Date): Date {
  const { jy, jm } = previousJalaliMonth(date);
  const g = toGregorian(jy, jm, jalaaliMonthLength(jy, jm));
  return new Date(g.gy, g.gm - 1, g.gd);
}

/** The Jalali month after `date`; December rolls forward into the next year. */
function nextJalaliMonth(date: Date): { jy: number; jm: number } {
  const { jy, jm } = jalaliParts(date);
  return jm === 12 ? { jy: jy + 1, jm: 1 } : { jy, jm: jm + 1 };
}

export function startOfNextJalaliMonth(date: Date): Date {
  const { jy, jm } = nextJalaliMonth(date);
  const g = toGregorian(jy, jm, 1);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function endOfNextJalaliMonth(date: Date): Date {
  const { jy, jm } = nextJalaliMonth(date);
  const g = toGregorian(jy, jm, jalaaliMonthLength(jy, jm));
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function startOfJalaliYear(date: Date): Date {
  const { jy } = jalaliParts(date);
  const g = toGregorian(jy, 1, 1);
  return new Date(g.gy, g.gm - 1, g.gd);
}

export function endOfJalaliYear(date: Date): Date {
  const { jy } = jalaliParts(date);
  const g = toGregorian(jy, 12, jalaaliMonthLength(jy, 12));
  return new Date(g.gy, g.gm - 1, g.gd);
}

/** Gregorian `YYYY-MM-DD` -> the Jalali `YYYY/MM/DD` the backend stores. */
export function isoToJalaliInput(value?: string | null): string {
  if (!value) return "";
  const date = fromIsoDate(value);
  if (!date) return "";

  const { jy, jm, jd } = toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );

  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

/** The Jalali `YYYY/MM/DD` the backend stores -> Gregorian `YYYY-MM-DD`. */
export function jalaliInputToIso(value?: string | null): string | null {
  if (!value) return null;

  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(value);
  if (!match) return null;

  const g = toGregorian(Number(match[1]), Number(match[2]), Number(match[3]));
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
}

export function todayJalaliInput(): string {
  return isoToJalaliInput(toIsoDate(new Date()));
}

export type DatePreset = {
  key: string;
  label: string;
  range: (today: Date) => DateRange;
};

function range(from: Date, to: Date): DateRange {
  return { from: toIsoDate(from), to: toIsoDate(to) };
}

/** Invoice search filters on `start_date`. */
export const invoiceDatePresets: readonly DatePreset[] = [
  {
    key: "lastWeek",
    label: "هفته گذشته",
    range: (today) =>
      range(addDays(startOfWeek(today), -7), addDays(startOfWeek(today), -1)),
  },
  {
    key: "lastMonth",
    label: "یک ماه اخیر",
    range: (today) => range(addDays(today, -30), today),
  },
  {
    key: "lastQuarter",
    label: "سه ماه اخیر",
    range: (today) => range(addDays(today, -90), today),
  },
  {
    key: "thisYear",
    label: "امسال",
    range: (today) => range(startOfJalaliYear(today), endOfJalaliYear(today)),
  },
];

/** Installment search filters on the due date. */
export const installmentDatePresets: readonly DatePreset[] = [
  {
    key: "lastMonth",
    label: "ماه گذشته",
    range: (today) =>
      range(startOfPreviousJalaliMonth(today), endOfPreviousJalaliMonth(today)),
  },
  {
    key: "lastWeek",
    label: "هفته گذشته",
    range: (today) =>
      range(addDays(startOfWeek(today), -7), addDays(startOfWeek(today), -1)),
  },
  {
    key: "yesterday",
    label: "دیروز",
    range: (today) => range(addDays(today, -1), addDays(today, -1)),
  },
  { key: "today", label: "امروز", range: (today) => range(today, today) },
  {
    key: "thisWeek",
    label: "هفته جاری",
    range: (today) => range(startOfWeek(today), endOfWeek(today)),
  },
  {
    key: "thisMonth",
    label: "ماه جاری",
    range: (today) => range(startOfJalaliMonth(today), endOfJalaliMonth(today)),
  },
  {
    key: "tomorrow",
    label: "فردا",
    range: (today) => range(addDays(today, 1), addDays(today, 1)),
  },
  {
    key: "nextWeek",
    label: "هفته آینده",
    range: (today) => range(addDays(startOfWeek(today), 7), addDays(endOfWeek(today), 7)),
  },
  {
    key: "nextMonth",
    label: "ماه آینده",
    range: (today) => range(startOfNextJalaliMonth(today), endOfNextJalaliMonth(today)),
  },
];
