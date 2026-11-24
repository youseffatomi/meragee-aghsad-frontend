"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { JalaliDatePicker } from "@/components/ui/date-picker";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { routes } from "@/config/routes";
import { UserSearchPicker } from "@/features/users/components/user-search-picker";
import { installmentDatePresets, type DateRange } from "@/lib/date/range";
import { cn } from "@/lib/utils/cn";
import type { InstallmentFilterStatus, User } from "@/types/domain";

const STATUS_OPTIONS: { value: InstallmentFilterStatus; label: string }[] = [
  { value: "all", label: "همه" },
  { value: "pending", label: "در انتظار" },
  { value: "paid", label: "پرداخت‌شده" },
  { value: "overdue", label: "معوقه" },
];

/**
 * The presets that describe today or a future window. A `pending` installment
 * can never fall in the past, so the backward-looking presets would only ever
 * return an empty list and are hidden while that status is selected.
 */
const PENDING_PRESET_KEYS = new Set([
  "today",
  "thisWeek",
  "thisMonth",
  "tomorrow",
  "nextWeek",
  "nextMonth",
]);

type InstallmentFiltersProps = {
  status: InstallmentFilterStatus;
  fromDate: string;
  toDate: string;
  /** The URL explicitly asked for no lower bound (`fromDate=all`). */
  fromAll: boolean;
  /** Today, computed on the server so the client never disagrees. */
  defaultFromDate: string;
  selectedUser: User | null;
  userId: string;
};

/**
 * Status, customer and due-date filters.
 *
 * Every control applies itself: there is no submit button. The URL stays the
 * source of truth, and `replace` keeps a burst of filter changes from filling
 * the browser's back stack on a phone.
 *
 * `overdue` is a computed state, not a date range: the backend ignores dates
 * for it. The date section collapses out of the way with an animation instead
 * of disappearing, and the chosen range stays in the URL so it is back the
 * moment another status is picked.
 */
export function InstallmentFilters({
  status,
  fromDate,
  toDate,
  fromAll,
  defaultFromDate,
  selectedUser,
  userId,
}: InstallmentFiltersProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(status);
  const [from, setFrom] = useState(fromDate);
  const [to, setTo] = useState(toDate);
  const [allFrom, setAllFrom] = useState(fromAll);
  const [selected, setSelected] = useState<User | null>(selectedUser);
  const [pending, startTransition] = useTransition();

  const isOverdue = currentStatus === "overdue";
  const isPending = currentStatus === "pending";

  const visiblePresets = isPending
    ? installmentDatePresets.filter((preset) => PENDING_PRESET_KEYS.has(preset.key))
    : installmentDatePresets;

  function navigate(next: {
    status: InstallmentFilterStatus;
    fromDate: string;
    toDate: string;
    fromAll: boolean;
    userId: string;
  }) {
    const params = new URLSearchParams();

    if (next.status !== "all") params.set("status", next.status);

    // The range is always kept in the URL, even for `overdue`, so returning to
    // another status restores exactly the dates the operator had picked.
    if (next.fromAll) params.set("fromDate", "all");
    else if (next.fromDate && next.fromDate !== defaultFromDate)
      params.set("fromDate", next.fromDate);
    if (next.toDate) params.set("toDate", next.toDate);

    if (next.userId) params.set("user", next.userId);

    const query = params.toString();

    startTransition(() => {
      router.replace(
        query ? `${routes.installments.list}?${query}` : routes.installments.list,
        { scroll: false },
      );
    });
  }

  function changeStatus(next: InstallmentFilterStatus) {
    if (next === currentStatus) return;

    let nextFrom = from;
    let nextTo = to;
    let nextAll = allFrom;

    // Outstanding installments only exist from today onwards, so clamp any
    // backward-looking range instead of leaving a filter that returns nothing.
    if (next === "pending") {
      if (nextAll || !nextFrom || nextFrom < defaultFromDate) {
        nextFrom = defaultFromDate;
        nextAll = false;
      }
      if (nextTo && nextTo < defaultFromDate) {
        nextTo = "";
      }
    }

    setCurrentStatus(next);
    setFrom(nextFrom);
    setTo(nextTo);
    setAllFrom(nextAll);
    navigate({
      status: next,
      fromDate: nextFrom,
      toDate: nextTo,
      fromAll: nextAll,
      userId: selected?._id ?? "",
    });
  }

  function changeFrom(next: string | null) {
    const value = next ?? "";
    const cleared = !value;

    setFrom(value);
    setAllFrom(cleared);
    navigate({
      status: currentStatus,
      fromDate: value,
      toDate: to,
      fromAll: cleared,
      userId: selected?._id ?? "",
    });
  }

  function changeTo(next: string | null) {
    const value = next ?? "";

    setTo(value);
    navigate({
      status: currentStatus,
      fromDate: from,
      toDate: value,
      fromAll: allFrom,
      userId: selected?._id ?? "",
    });
  }

  function changeUser(user: User | null) {
    setSelected(user);
    navigate({
      status: currentStatus,
      fromDate: from,
      toDate: to,
      fromAll: allFrom,
      userId: user?._id ?? "",
    });
  }

  function applyPreset(range: DateRange) {
    // `thisWeek`/`thisMonth` start in the past; for pending they are clamped so
    // the range really does begin today.
    const start =
      isPending && range.from < defaultFromDate ? defaultFromDate : range.from;

    setFrom(start);
    setTo(range.to);
    setAllFrom(false);
    navigate({
      status: currentStatus,
      fromDate: start,
      toDate: range.to,
      fromAll: false,
      userId: selected?._id ?? "",
    });
  }

  function clear() {
    setCurrentStatus("all");
    setFrom(defaultFromDate);
    setTo("");
    setAllFrom(false);
    setSelected(null);
    navigate({
      status: "all",
      fromDate: defaultFromDate,
      toDate: "",
      fromAll: false,
      userId: "",
    });
  }

  const hasFilters =
    currentStatus !== "all" ||
    Boolean(to) ||
    Boolean(selected) ||
    Boolean(userId) ||
    allFrom ||
    from !== defaultFromDate;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-6 items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-ink">فیلترها</span>
          {pending ? <Spinner className="size-3.5 text-ink-muted" /> : null}
          {/*
            Kept in the layout at all times so toggling `overdue` never moves
            anything; only its opacity animates.
          */}
          <span
            aria-hidden={isOverdue ? undefined : true}
            className={cn(
              "text-[11px] text-ink-muted transition-opacity duration-300 motion-reduce:transition-none",
              isOverdue ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            بازهٔ تاریخ اعمال نمی‌شود
          </span>
        </div>

        {hasFilters ? (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger-text focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
          >
            <X className="size-3.5" aria-hidden="true" />
            پاک کردن فیلترها
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="col-span-2 flex flex-col gap-1 lg:col-span-2">
          <label htmlFor="installment-status" className="text-[11px] text-ink-muted">
            وضعیت
          </label>
          <Select
            id="installment-status"
            value={currentStatus}
            onChange={(event) =>
              changeStatus(event.target.value as InstallmentFilterStatus)
            }
            className="h-10 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1 lg:col-span-3">
          <label htmlFor="installment-from" className="text-[11px] text-ink-muted">
            از سررسید
          </label>
          <JalaliDatePicker
            id="installment-from"
            value={isOverdue ? null : from || null}
            onChange={changeFrom}
            disabled={isOverdue}
            minDate={isPending ? defaultFromDate : null}
            maxDate={to || null}
            className="h-10 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1 lg:col-span-3">
          <label htmlFor="installment-to" className="text-[11px] text-ink-muted">
            تا سررسید
          </label>
          <JalaliDatePicker
            id="installment-to"
            value={isOverdue ? null : to || null}
            onChange={changeTo}
            disabled={isOverdue}
            minDate={isPending ? defaultFromDate : from || null}
            className="h-10 text-sm"
          />
        </div>

        <div className="col-span-2 flex flex-col gap-1 lg:col-span-4">
          <span className="text-[11px] text-ink-muted">مشتری</span>

          {userId && !selected ? (
            <div className="flex h-10 flex-wrap items-center justify-between gap-2 rounded-field border border-brand-200 bg-brand-tint/60 px-3 text-xs">
              <span className="font-bold text-brand-text">فیلتر مشتری فعال است</span>
              <button
                type="button"
                onClick={() => changeUser(null)}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-bold text-ink-muted transition-colors hover:bg-surface hover:text-danger-text focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
              >
                <X className="size-3.5" aria-hidden="true" />
                حذف
              </button>
            </div>
          ) : (
            <UserSearchPicker
              selected={selected}
              onSelect={changeUser}
              ariaLabel="جستجوی مشتری برای فیلتر اقساط"
              changeLabel="حذف مشتری"
              compact
            />
          )}
        </div>
      </div>

      {/*
        `1fr`/`0fr` animates the row's own height without measuring it, so the
        preset count can change freely and `overdue` never causes a jump.
        `inert` + `aria-hidden` keep the collapsed chips out of the tab order.
      */}
      <div
        inert={isOverdue}
        aria-hidden={isOverdue ? true : undefined}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
          isOverdue ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {visiblePresets.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset.range(new Date()))}
                className={cn(
                  "inline-flex h-7 shrink-0 items-center rounded-full border border-line bg-surface px-2.5 text-[11px] font-bold text-ink-muted transition-colors",
                  "hover:border-brand-300 hover:bg-brand-tint hover:text-brand-text",
                  "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
