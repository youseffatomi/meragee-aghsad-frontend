"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

import { digitsOnly } from "@/lib/format/number";
import { cn } from "@/lib/utils/cn";

/**
 * A one-time-code field, rendered as separate boxes.
 *
 * The value is always contiguous — a gap in the middle can never exist, because
 * focusing a later box jumps back to the first empty one. That keeps the value
 * a plain string the form can validate without repairing it first.
 *
 * The container is forced to `ltr`: a numeric code reads left to right even
 * inside an RTL page.
 */

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  describedBy?: string;
  /** Fired once every box is filled, so the form can submit without a click. */
  onComplete?: (value: string) => void;
};

function toSlots(value: string, length: number): string[] {
  return Array.from({ length }, (_, index) => value[index] ?? "");
}

export function OtpInput({
  value,
  onChange,
  length,
  disabled = false,
  invalid = false,
  autoFocus = false,
  describedBy,
  onComplete,
}: OtpInputProps) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const isMovingFocus = useRef(false);
  const slots = toSlots(value, length);

  function focusAt(index: number) {
    const target = Math.min(Math.max(index, 0), length - 1);
    isMovingFocus.current = true;
    inputs.current[target]?.focus();
    inputs.current[target]?.select();
    isMovingFocus.current = false;
  }

  function commit(next: string[]) {
    const joined = next.join("");

    onChange(joined);

    if (joined.length === length) onComplete?.(joined);
  }

  function handleFocus(index: number) {
    if (isMovingFocus.current) return;

    const firstEmpty = slots.findIndex((slot) => slot === "");
    if (firstEmpty !== -1 && index > firstEmpty) focusAt(firstEmpty);
  }

  function handleChange(index: number, raw: string) {
    const digit = digitsOnly(raw).slice(-1);
    const next = [...slots];

    if (!digit) {
      next[index] = "";
      onChange(next.slice(0, index).join(""));
      return;
    }

    next[index] = digit;
    commit(next);

    if (index < length - 1) focusAt(index + 1);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...slots];

      if (next[index]) {
        next[index] = "";
        onChange(next.slice(0, index).join(""));
        return;
      }

      if (index > 0) {
        next[index - 1] = "";
        onChange(next.slice(0, index - 1).join(""));
        focusAt(index - 1);
      }

      return;
    }

    // In an RTL page the boxes still run left to right, so "left" is forward.
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index + 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index - 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();

    const pasted = digitsOnly(event.clipboardData.getData("text")).slice(0, length);
    if (!pasted) return;

    commit(toSlots(pasted, length));
    focusAt(pasted.length - 1);
  }

  return (
    <div dir="ltr" className="flex justify-center gap-2 sm:gap-3">
      {slots.map((slot, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          value={slot}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onFocus={() => handleFocus(index)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`رقم ${index + 1} کد تأیید`}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(
            "size-12 rounded-field border bg-surface text-center text-lg font-medium text-ink sm:size-14",
            "transition-[border-color,box-shadow] duration-150 outline-none",
            "border-line focus:border-brand-600 focus:ring-4 focus:ring-brand-500/15",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted",
            invalid && "border-danger focus:border-danger focus:ring-danger/15",
          )}
        />
      ))}
    </div>
  );
}
