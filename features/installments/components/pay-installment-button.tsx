"use client";

import { useState } from "react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import type { Installment } from "@/types/domain";
import { PayInstallmentDialog } from "./pay-installment-dialog";

type PayInstallmentButtonProps = {
  installment: Installment;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  className?: string;
};

export function PayInstallmentButton({
  installment,
  variant = "secondary",
  size = "sm",
  className,
}: PayInstallmentButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        پرداخت
      </Button>
      {/*
        Mounted only while open, so the receipt and error state start fresh on
        every visit without a reset effect.
      */}
      {open ? (
        <PayInstallmentDialog
          installment={installment}
          open={open}
          onOpenChange={setOpen}
        />
      ) : null}
    </>
  );
}
