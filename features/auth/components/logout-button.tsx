"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { messages } from "@/config/messages";
import { cn } from "@/lib/utils/cn";
import { authApi } from "../api";

/**
 * Ends the session and returns to the login page.
 *
 * `router.refresh()` matters: without it the cached server render of the panel
 * would stay on screen with the previous user's data.
 *
 * `header` is the panel's mark. The glyph is the icon set's `LogOut` rather
 * than the brand's own exit artwork: the brand drawing is a figure mid-stride
 * that only reads as "leave" at a size the header cannot spare, and every
 * other icon in the shell comes from the same family.
 *
 * The label is set before the glyph so that, in the right-to-left header, the
 * word starts where the eye does and the glyph lands on the outer edge — the
 * order the design uses.
 */

type LogoutButtonProps = {
  variant?: "header" | "full";
  className?: string;
};

export function LogoutButton({ variant = "header", className }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function logout() {
    setIsPending(true);
    await authApi.logout();
    router.replace(routes.login);
    router.refresh();
  }

  if (variant === "full") {
    return (
      <Button
        variant="secondary"
        size="md"
        onClick={logout}
        isLoading={isPending}
        className={cn("w-full", className)}
      >
        {messages.actions.logout}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={isPending}
      className={cn(
        "flex h-9 shrink-0 items-center gap-2 rounded-field px-2.5 text-sm font-bold text-ink transition-colors",
        "hover:bg-brand-tint hover:text-brand-text",
        "disabled:pointer-events-none disabled:opacity-50",
        "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
        className,
      )}
    >
      <span>{messages.actions.logout}</span>
      <LogOut className="size-5 shrink-0 text-brand-strong" aria-hidden="true" />
    </button>
  );
}
