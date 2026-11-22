import Link from "next/link";
import { Plus } from "lucide-react";

import { messages } from "@/config/messages";
import { can } from "@/config/permissions";
import { routes } from "@/config/routes";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { getSession } from "@/lib/auth/session";
import { cn } from "@/lib/utils/cn";

/**
 * The header's controls, resolved on the server so the session is read once and
 * the "add invoice" shortcut only appears for an account that may actually
 * create one — otherwise it would lead a SELLER straight to a forbidden page.
 *
 * On a wide screen this is a row in the header: logout, a hairline, then the
 * primary action. On a phone the primary action lifts out of the header and
 * becomes a small floating pill anchored to the bottom-left, worn with the
 * short label so it stays compact; the same element is both, so the two
 * presentations cannot drift.
 *
 * The glyph trails the label (the outer edge in the right-to-left row), the way
 * the design draws it — for the floating pill that puts the `+` on the left and
 * «فاکتور» beside it.
 */

export async function HeaderActions() {
  const session = await getSession();
  if (!session) return null;

  const canCreateInvoice = can(session.permissions, "invoice:create");

  return (
    <div className="flex items-center gap-2.5">
      {canCreateInvoice ? (
        <>
          <span aria-hidden="true" className="hidden h-6 w-px bg-line sm:block" />

          <Link
            href={routes.invoices.create}
            aria-label={messages.header.addInvoiceCta}
            className={cn(
              "inline-flex shrink-0 items-center justify-center gap-1.5 bg-black font-bold text-white shadow-card transition-colors sm:bg-brand-700",
              "hover:bg-brand-800 active:bg-brand-900",
              "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none",
              // Phone: lifted out of the header into a compact floating pill.
              "fixed bottom-5 left-5 z-30 h-11 rounded-full px-4 text-sm",
              // Wide screen: back in flow as the header's primary action.
              "sm:static sm:rounded-field sm:px-5",
            )}
          >
            <span className="hidden sm:inline">{messages.header.addInvoiceCta}</span>
            <Plus className="size-5 shrink-0" aria-hidden="true" />
            <span className="sm:hidden">{messages.header.addInvoiceShort}</span>
          </Link>
        </>
      ) : null}

      <LogoutButton />
    </div>
  );
}
