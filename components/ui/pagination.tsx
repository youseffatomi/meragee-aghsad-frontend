import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { toPersianDigits } from "@/lib/format/number";
import { cn } from "@/lib/utils/cn";
import type { PaginationMeta } from "@/types/api";

/**
 * Page navigation shared by every paginated table.
 *
 * `hrefFor` is a function rather than a base URL so each page decides which
 * query parameters to preserve (search, filters, …). It is a Server Component:
 * the links are plain anchors and need no client JavaScript.
 */

type PaginationProps = {
  meta: PaginationMeta;
  hrefFor: (page: number) => string;
  className?: string;
};

/** First, last, and the current page's neighbours — everything else collapses. */
function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);

  const items: (number | "gap")[] = [];
  let previous = 0;

  for (const page of sorted) {
    if (previous && page - previous > 1) items.push("gap");
    items.push(page);
    previous = page;
  }

  return items;
}

const ITEM_CLASS =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-field px-2 text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none";

export function Pagination({ meta, hrefFor, className }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <nav
      aria-label="صفحه‌بندی"
      className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
    >
      {meta.hasPrevPage && meta.prevPage ? (
        <Link
          href={hrefFor(meta.prevPage)}
          aria-label="صفحه قبل"
          className={cn(
            ITEM_CLASS,
            "border border-line text-ink-muted hover:bg-surface-sunken",
          )}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(ITEM_CLASS, "text-ink-muted/40")}>
          <ChevronRight className="size-4" />
        </span>
      )}

      {pageItems(meta.page, meta.totalPages).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="px-1 text-xs text-ink-muted">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === meta.page ? "page" : undefined}
            className={cn(
              ITEM_CLASS,
              item === meta.page
                ? "bg-brand-700 text-white"
                : "border border-line text-ink-muted hover:bg-surface-sunken",
            )}
          >
            {toPersianDigits(item)}
          </Link>
        ),
      )}

      {meta.hasNextPage && meta.nextPage ? (
        <Link
          href={hrefFor(meta.nextPage)}
          aria-label="صفحه بعد"
          className={cn(
            ITEM_CLASS,
            "border border-line text-ink-muted hover:bg-surface-sunken",
          )}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={cn(ITEM_CLASS, "text-ink-muted/40")}>
          <ChevronLeft className="size-4" />
        </span>
      )}
    </nav>
  );
}
