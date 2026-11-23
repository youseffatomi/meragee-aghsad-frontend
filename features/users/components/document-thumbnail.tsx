"use client";

import { X } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type DocumentThumbnailProps = {
  src: string;
  alt: string;
  label?: string;
  /** Image ratio: `video` (4/3, the default) or a compact `square` tile. */
  aspect?: "video" | "square";
  onOpen: () => void;
  onRemove?: () => void;
  className?: string;
};

const ASPECTS: Record<NonNullable<DocumentThumbnailProps["aspect"]>, string> = {
  video: "aspect-[3/2]",
  square: "aspect-square",
};

/** A clickable document preview with an optional remove corner button. */
export function DocumentThumbnail({
  src,
  alt,
  label,
  aspect = "video",
  onOpen,
  onRemove,
  className,
}: DocumentThumbnailProps) {
  return (
    <div className={cn("group relative", className)}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`نمایش بزرگ ${alt}`}
        className="block w-full overflow-hidden rounded-field border border-line bg-surface-sunken transition-shadow hover:shadow-card focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={cn(
            "w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]",
            ASPECTS[aspect],
          )}
        />
      </button>

      {label ? (
        <p className="mt-1.5 truncate text-[11px] text-ink-muted">{label}</p>
      ) : null}

      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`حذف ${alt}`}
          className="absolute end-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-ink/70 text-white transition-colors hover:bg-danger focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
