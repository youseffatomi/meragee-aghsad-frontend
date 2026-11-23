"use client";

import { useCallback, useRef, useState } from "react";

import { usersApi } from "./client-api";
import type { UniqueField } from "./schemas";

export type UniqueStatus = "idle" | "checking" | "available" | "taken" | "error";

export type UniqueState = {
  status: UniqueStatus;
  /** The value this state describes, so a stale result cannot leak across edits. */
  value?: string;
  message?: string;
};

const IDLE: UniqueState = { status: "idle" };

const EMPTY: Record<UniqueField, UniqueState> = {
  phone: IDLE,
  nationalId: IDLE,
};

const TAKEN_MESSAGE: Record<UniqueField, string> = {
  phone: "این شماره تماس قبلاً برای کاربر دیگری ثبت شده است.",
  nationalId: "این کد ملی قبلاً برای کاربر دیگری ثبت شده است.",
};

/**
 * Checks a national ID or primary phone for uniqueness on blur.
 *
 * A sequence number per field discards out-of-order responses: typing again
 * while a request is in flight must not let the older answer overwrite the
 * newer one. `check` also returns the answer so a wizard step can block before
 * advancing without reading state that has not rendered yet.
 */
export function useUniqueCheck(excludeUserId?: string) {
  const [state, setState] = useState<Record<UniqueField, UniqueState>>(EMPTY);
  const sequence = useRef<Record<UniqueField, number>>({
    phone: 0,
    nationalId: 0,
  });

  const reset = useCallback((field: UniqueField) => {
    sequence.current[field] += 1;
    setState((current) => ({ ...current, [field]: IDLE }));
  }, []);

  const check = useCallback(
    async (field: UniqueField, rawValue: string): Promise<{ taken: boolean } | null> => {
      const value = rawValue.trim();

      if (!value) {
        reset(field);
        return null;
      }

      const id = sequence.current[field] + 1;
      sequence.current[field] = id;

      setState((current) => ({
        ...current,
        [field]: { status: "checking", value },
      }));

      const result = await usersApi.checkUnique({
        field,
        value,
        excludeUserId,
      });

      if (sequence.current[field] !== id) return null;

      if (!result.ok) {
        setState((current) => ({
          ...current,
          [field]: { status: "error", value, message: result.message },
        }));
        return null;
      }

      const next: UniqueState = result.data.taken
        ? { status: "taken", value, message: TAKEN_MESSAGE[field] }
        : { status: "available", value, message: "قابل استفاده است." };

      setState((current) => ({ ...current, [field]: next }));

      return result.data;
    },
    [excludeUserId, reset],
  );

  const isAvailable = useCallback(
    (field: UniqueField, value: string) => {
      const current = state[field];
      return current.status === "available" && current.value === value.trim();
    },
    [state],
  );

  return { state, check, reset, isAvailable };
}
