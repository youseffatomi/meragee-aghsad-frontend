"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Full-size view of a document thumbnail.
 *
 * Same native-dialog approach as `ConfirmDialog`: focus is trapped, `Esc`
 * closes it, and the image is the only interactive content.
 */

type LightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string | null;
  alt: string;
};

export function Lightbox({ open, onOpenChange, src, alt }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onOpenChange(false);
      }}
      className="m-auto max-h-[92vh] max-w-[92vw] rounded-card border border-line bg-surface p-0 shadow-panel backdrop:bg-ink/70"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="بستن تصویر"
          className="absolute end-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-ink/70 text-white transition-colors hover:bg-ink focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="max-h-[92vh] max-w-[92vw] rounded-card object-contain"
          />
        ) : null}
      </div>
    </dialog>
  );
}
