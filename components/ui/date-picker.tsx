"use client";

import { CalendarDays, X } from "lucide-react";
import DatePicker, {
  type CalendarProps,
  type DatePickerProps,
} from "react-multi-date-picker";
import DateObject from "react-date-object";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import { fromIsoDate, toIsoDate } from "@/lib/date/range";
import { cn } from "@/lib/utils/cn";
import { Input } from "./input";

/**
 * A Jalali calendar that stores its value as the Gregorian `YYYY-MM-DD` the
 * backend expects.
 *
 * The picker itself renders Persian digits and an RTL calendar; the value that
 * leaves this component is always a plain ISO date, so callers never deal with
 * `DateObject` or calendar conversion.
 */

type Props = {
  id?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  minDate?: string | null;
  maxDate?: string | null;
  /** Extra classes for the text input, e.g. a compact height. */
  className?: string;
  "aria-describedby"?: string;
};

function toDateObject(value: string | null | undefined): DateObject | null {
  if (!value) return null;
  const date = fromIsoDate(value);
  if (!date) return null;
  return new DateObject({ date, calendar: persian, locale: persian_fa });
}

export function JalaliDatePicker({
  id,
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  disabled = false,
  invalid = false,
  minDate,
  maxDate,
  className,
  "aria-describedby": describedBy,
}: Props) {
  // The component accepts `CalendarProps` (which owns `calendar`) plus
  // `DatePickerProps`; the published props type alone omits `calendar`.
  const pickerProps: Omit<CalendarProps, "onChange"> & DatePickerProps = {
    calendar: persian,
    locale: persian_fa,
    format: "YYYY/MM/DD",
    calendarPosition: "bottom-start",
    portal: true,
    disabled,
    value: toDateObject(value) ?? "",
    minDate: toDateObject(minDate) ?? undefined,
    maxDate: toDateObject(maxDate) ?? undefined,
    onChange: (date) => {
      const selected = Array.isArray(date) ? date[0] : date;
      onChange(selected ? toIsoDate(selected.toDate()) : null);
    },
    render: (formatted, openCalendar) => (
      <div className="relative">
        <CalendarDays
          className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-ink-muted"
          aria-hidden="true"
        />

        <Input
          id={id}
          value={formatted}
          readOnly
          disabled={disabled}
          invalid={invalid}
          aria-describedby={describedBy}
          placeholder={placeholder}
          onClick={openCalendar}
          onFocus={openCalendar}
          className={cn("cursor-pointer ps-11", value && "pe-11", className)}
        />

        {value && !disabled ? (
          <button
            type="button"
            aria-label="پاک کردن تاریخ"
            onClick={(event) => {
              event.stopPropagation();
              onChange(null);
            }}
            className="absolute inset-y-0 end-3 my-auto grid size-6 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    ),
  };

  return <DatePicker {...pickerProps} />;
}
