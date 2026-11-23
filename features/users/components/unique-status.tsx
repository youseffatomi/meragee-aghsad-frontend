import { AlertCircle, CheckCircle2 } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils/cn";
import type { UniqueState } from "../use-unique-check";

/**
 * The one-line answer to an on-blur uniqueness check.
 *
 * `taken` and `error` look different on purpose: "already registered" is a
 * valid value the user must change, while a failed request is something to
 * retry. Both stay in the same slot so the field does not jump.
 */
export function UniqueStatus({ state }: { state: UniqueState }) {
  if (state.status === "idle") return null;

  if (state.status === "checking") {
    return (
      <p className="flex items-center gap-1.5 text-xs leading-5 text-ink-muted">
        <Spinner className="size-3.5" />
        در حال بررسی…
      </p>
    );
  }

  const available = state.status === "available";

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs leading-5",
        available ? "text-success" : "text-danger-text",
      )}
      role={available ? "status" : "alert"}
    >
      {available ? (
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
      ) : (
        <AlertCircle className="size-3.5" aria-hidden="true" />
      )}
      {state.message}
    </p>
  );
}
