"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { Alert } from "./alert";
import { Button } from "./button";

/**
 * A yes/no confirmation built on the native `<dialog>` element.
 *
 * Native gives us the focus trap, the `Esc` key and the inert backdrop without
 * a dependency. The caller owns the open state; this component owns the
 * pending state so the confirm button cannot be pressed twice.
 */

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  /** A message to keep visible while the dialog stays open after a failure. */
  error?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  error,
  confirmLabel = "بله",
  cancelLabel = "خیر",
  tone = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !pending) onOpenChange(false);
      }}
      className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-card border border-line bg-surface p-0 text-ink shadow-panel backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex flex-col gap-2 p-6">
        <h2 className="text-base font-black text-ink">{title}</h2>
        {description ? (
          <div className="text-xs leading-6 text-ink-muted">{description}</div>
        ) : null}
        {error ? <Alert tone="error">{error}</Alert> : null}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line bg-surface-sunken px-6 py-4">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={tone === "danger" ? "danger" : "primary"}
          size="sm"
          isLoading={pending}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
