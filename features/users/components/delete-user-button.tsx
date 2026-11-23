"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usersApi } from "../client-api";

type DeleteUserButtonProps = {
  userId: string;
  userName: string;
  /** Where to go after a successful delete; omitted means refresh in place. */
  redirectTo?: string;
  variant?: "icon" | "button";
};

/**
 * Delete with a yes/no confirmation. The dialog stays open on failure so the
 * user can read the error and try again.
 */
export function DeleteUserButton({
  userId,
  userName,
  redirectTo,
  variant = "icon",
}: DeleteUserButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setError(null);
    const result = await usersApi.remove(userId);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setOpen(false);
    toast.success("کاربر حذف شد.");

    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`حذف ${userName}`}
          className="inline-flex size-8 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-danger/30 hover:bg-danger-soft hover:text-danger-text focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
        >
          <Trash2 className="size-3.5" aria-hidden="true" />
        </button>
      ) : (
        <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
          <Trash2 className="size-4" aria-hidden="true" />
          حذف کاربر
        </Button>
      )}

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="حذف کاربر"
        description={
          <>
            آیا از حذف <strong className="font-bold text-ink">{userName}</strong> مطمئن
            هستید؟
            <br />
            این عملیات قابل بازگشت نیست.
          </>
        }
        error={error}
        confirmLabel="بله، حذف شود"
        cancelLabel="خیر"
        onConfirm={handleConfirm}
      />
    </>
  );
}
