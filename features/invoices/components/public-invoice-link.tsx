"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";

/**
 * The shareable, read-only link to one invoice.
 *
 * The absolute URL is built in the browser because the server env only knows
 * the backend origin. Before hydration the relative path is shown, which is
 * still a working link. It renders as a single compact row: the address itself,
 * with a copy button beside it.
 */
export function PublicInvoiceLink({
  path,
  className,
}: {
  path: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    () => window.location.origin,
    () => "",
  );
  const url = origin ? new URL(path, origin).toString() : path;

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      copyWithFallback(url);
    }

    setCopied(true);
    toast.success("لینک عمومی فاکتور کپی شد.");
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-1.5", className)}>
      <button
        type="button"
        onClick={copy}
        aria-label="کپی لینک عمومی فاکتور"
        title="کپی لینک"
        className={cn(
          "inline-flex shrink-0 items-center justify-center gap-2 rounded-field border border-line bg-surface px-3 py-2 transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
          copied ? "text-success" : "text-ink-muted",
        )}
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
        <span className="text-xs">کپی آدرس فاکتور</span>
      </button>
    </div>
  );
}

/** The origin never changes during a page's life, so there is nothing to watch. */
function subscribeToOrigin() {
  return () => {};
}

/** `navigator.clipboard` is unavailable on insecure origins; keep a fallback. */
function copyWithFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
