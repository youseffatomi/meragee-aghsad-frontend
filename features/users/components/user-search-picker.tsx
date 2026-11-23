"use client";

import { useEffect, useRef, useState } from "react";
import { Search, UserRound, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { toPersianDigits } from "@/lib/format/number";
import { cn } from "@/lib/utils/cn";
import type { User } from "@/types/domain";
import { usersApi } from "../client-api";

type UserSearchPickerProps = {
  selected: User | null;
  onSelect: (user: User | null) => void;
  error?: string;
  placeholder?: string;
  ariaLabel?: string;
  /** Label of the button that drops the current selection. */
  changeLabel?: string;
  /** Shorter input and an overlay result list, for dense filter bars. */
  compact?: boolean;
};

function fullName(user: User): string {
  return `${user.name} ${user.lastName}`.trim();
}

/**
 * Customer lookup shared by the invoice wizard and the installment filters.
 *
 * The backend matches name, last name, national ID and phone by prefix, so one
 * search box covers every way an operator might identify a customer. Requests
 * are debounced and aborted so a fast typist never sees an older result win.
 */
export function UserSearchPicker({
  selected,
  onSelect,
  error,
  placeholder = "جستجو با نام، نام خانوادگی، کد ملی یا شماره تماس",
  ariaLabel = "جستجوی مشتری",
  changeLabel = "تغییر مشتری",
  compact = false,
}: UserSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  // The text that produced the current `results`. It lets us tell a real "no
  // matches" apart from a query whose request has not settled yet — otherwise
  // the input would flash red between a keystroke and the debounced response.
  const [settledQuery, setSettledQuery] = useState("");
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) return;

    const timer = setTimeout(async () => {
      controller.current?.abort();
      const next = new AbortController();
      controller.current = next;

      setLoading(true);
      setRequestError(null);

      const result = await usersApi.search(trimmed, next.signal);

      if (next.signal.aborted) return;

      setLoading(false);
      setSettledQuery(trimmed);

      if (!result.ok) {
        setResults([]);
        setRequestError(result.message);
        return;
      }

      setResults(result.data.result);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => () => controller.current?.abort(), []);

  if (selected) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 rounded-field border border-brand-200 bg-brand-tint/60",
          compact ? "px-3 py-2" : "gap-3 px-4 py-3",
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={cn(
              "grid shrink-0 place-items-center rounded-full bg-brand-soft text-brand-text",
              compact ? "size-8" : "size-10",
            )}
          >
            <UserRound className={compact ? "size-4" : "size-5"} aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className={cn(
                "truncate font-bold text-ink",
                compact ? "text-xs" : "text-sm",
              )}
            >
              {fullName(selected)}
            </span>
            <span className="text-[11px] text-ink-muted">
              کد ملی: <span dir="ltr">{toPersianDigits(selected.nationalId)}</span>
              {" · "}
              تماس:{" "}
              <span dir="ltr">
                {toPersianDigits(selected.phoneNumbers?.primary ?? "—")}
              </span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            onSelect(null);
            setQuery("");
            setResults([]);
            setSettledQuery("");
          }}
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-field border border-line bg-surface font-bold text-ink-muted transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
            compact ? "h-8 px-2 text-[11px]" : "h-9 px-3 text-xs",
          )}
        >
          <X className="size-3.5" aria-hidden="true" />
          {/* {changeLabel} */}
        </button>
      </div>
    );
  }

  const resultList =
    results.length > 0 ? (
      <ul
        className={cn(
          "flex flex-col divide-y divide-line overflow-y-auto rounded-field border border-line bg-surface",
          compact
            ? "absolute inset-x-0 top-full z-30 mt-1 max-h-64 shadow-card"
            : "max-h-72",
        )}
      >
        {results.map((user) => (
          <li key={user._id}>
            <button
              type="button"
              onClick={() => {
                onSelect(user);
                setResults([]);
              }}
              className={cn(
                "flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-start transition-colors",
                "hover:bg-surface-sunken focus-visible:bg-surface-sunken focus-visible:outline-none",
              )}
            >
              <span className="text-sm font-bold text-ink">{fullName(user)}</span>
              <span className="text-[11px] text-ink-muted">
                کد ملی: <span dir="ltr">{toPersianDigits(user.nationalId)}</span>
                {" · "}
                تماس:{" "}
                <span dir="ltr">
                  {toPersianDigits(user.phoneNumbers?.primary ?? "—")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    ) : null;

  const noResults =
    !loading &&
    !requestError &&
    query.trim() !== "" &&
    settledQuery === query.trim() &&
    results.length === 0;

  return (
    <div className={cn("flex flex-col", compact ? "gap-1.5" : "gap-3")}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-ink-muted"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);

            // Clearing the box cancels any in-flight lookup and drops the old
            // list immediately; the effect only ever runs for a real query.
            if (!next.trim()) {
              controller.current?.abort();
              setResults([]);
              setLoading(false);
              setRequestError(null);
              setSettledQuery("");
            }
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
          invalid={Boolean(error) || Boolean(requestError) || noResults}
          className={cn("ps-11", compact && "h-10 text-sm")}
        />

        {compact ? resultList : null}
      </div>

      {error ? (
        <p className="text-xs leading-5 text-danger-text" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 px-1 py-1 text-xs text-ink-muted">
          <Spinner className="size-4" />
          در حال جستجو…
        </div>
      ) : null}

      {requestError ? (
        <p className="text-xs leading-5 text-danger-text" role="alert">
          {requestError}
        </p>
      ) : null}

      {/*
        No visual box for an empty result — the input's red border carries the
        signal. This live region is what a screen reader announces instead.
      */}
      {noResults ? (
        <p className="sr-only" role="status" aria-live="polite">
          مشتری‌ای با این مشخصات پیدا نشد.
        </p>
      ) : null}

      {!compact ? resultList : null}
    </div>
  );
}
