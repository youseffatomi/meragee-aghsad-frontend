"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { cn } from "@/lib/utils/cn";

/**
 * The panel shell. This is the only client component in the chrome; the sidebar
 * content and the account block arrive from the server as props, so no session
 * data has to be fetched from the browser.
 *
 * The frame is a decorative full-bleed strip with two floating cards on top of
 * it: the header, spanning the container, and the sidebar, beside the page.
 * Both stick, so the menu and the account stay reachable on a long page.
 *
 * There is a single `<aside>`. From `lg` it is the sidebar card, in flow at the
 * start of the body row; below `lg` it becomes the drawer, sliding in from the
 * right edge it already occupies. One element rather than two keeps the menu
 * definition in one place and guarantees the two presentations cannot drift
 * apart.
 *
 * When it is closed on a narrow screen the panel is `inert`, so a keyboard user
 * cannot tab into links they cannot see. `matchMedia` decides that, because the
 * rule is "narrow screen", which CSS alone cannot express as an attribute.
 */

const DESKTOP_QUERY = "(min-width: 64rem)";

type AdminFrameProps = {
  sidebar: ReactNode;
  account: ReactNode;
  children: ReactNode;
};

export function AdminFrame({ sidebar, account, children }: AdminFrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const sync = () => {
      setIsDesktop(query.matches);
      // Widening past `lg` while the drawer is open would otherwise leave the
      // panel dressed as a drawer and the page with its scroll locked.
      if (query.matches) setMenuOpen(false);
    };

    sync();
    query.addEventListener("change", sync);

    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    // Read once: the cleanup runs after the ref may have been re-pointed.
    const trigger = triggerRef.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [menuOpen]);

  const drawerHidden = !isDesktop && !menuOpen;

  /**
   * Picking anything in the menu closes the drawer. The listener sits on the
   * panel rather than on each link because the menu is rendered on the server,
   * and a callback cannot cross that boundary — and this way the rule holds for
   * the logo and for the already-active item too.
   */
  function handleMenuClick(event: MouseEvent<HTMLElement>) {
    if (isDesktop) return;
    if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
  }

  return (
    <div className="relative min-h-dvh bg-surface">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-band bg-chrome-band"
      />

      <div
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 transition-opacity duration-200 motion-reduce:transition-none lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div className="relative px-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-panel flex-col">
          <header className="sticky top-0 z-30 mt-topbar flex h-header-card items-center justify-between gap-3 rounded-header border-b-2 border-brand bg-surface px-4 shadow-float sm:px-5">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                ref={triggerRef}
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="باز کردن منو"
                aria-expanded={menuOpen}
                className="grid size-9 shrink-0 place-items-center rounded-field text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none lg:hidden"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>

              {account}
            </div>

            <LogoutButton />
          </header>

          <div className="mt-stack flex items-start gap-gutter pb-10">
            <aside
              inert={drawerHidden}
              onClick={handleMenuClick}
              className={cn(
                "fixed inset-y-3 right-3 z-50 flex w-sidebar max-w-[85vw] flex-col overflow-y-auto rounded-card bg-surface pt-12 shadow-panel",
                "transition-transform duration-300 ease-out motion-reduce:transition-none",
                "lg:sticky lg:inset-auto lg:z-auto lg:max-w-none lg:translate-x-0 lg:self-start lg:pt-0 lg:shadow-float",
                "lg:top-[calc(var(--spacing-header-card)_+_var(--spacing-stack))] lg:max-h-[calc(100dvh_-_var(--spacing-header-card)_-_var(--spacing-stack))]",
                menuOpen ? "translate-x-0" : "translate-x-[calc(100%+0.75rem)]",
              )}
            >
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="بستن منو"
                className="absolute end-3 top-3 z-10 grid size-8 place-items-center rounded-tile text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none lg:hidden"
              >
                <X className="size-4" aria-hidden="true" />
              </button>

              {sidebar}
            </aside>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}
