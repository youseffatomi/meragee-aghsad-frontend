"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { safeInternalPath } from "@/lib/utils/safe-path";
import { OtpStep } from "./otp-step";
import { PhoneStep } from "./phone-step";

/**
 * Owns the two-step state; each step owns its own form.
 *
 * The phone number is kept here rather than inside a step so going back to
 * change it does not lose what was typed.
 */

type Step = "phone" | "otp";

const HEADINGS: Record<Step, { title: string; description: string }> = {
  phone: {
    title: "ورود به پنل مدیریت",
    description: "شماره موبایل خود را وارد کنید تا کد تأیید برایتان پیامک شود.",
  },
  otp: {
    title: "کد تأیید را وارد کنید",
    description: "کد پیامک‌شده را وارد کنید تا وارد پنل شوید.",
  },
};

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phoneNumber, setPhoneNumber] = useState("");

  function handleSent(value: string) {
    setPhoneNumber(value);
    setStep("otp");
  }

  function handleVerified(redirectTo: string) {
    // `next` is attacker-controlled, so it is only honoured when it points
    // inside this application.
    router.replace(safeInternalPath(next, redirectTo));
    router.refresh();
  }

  const heading = HEADINGS[step];

  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-1.5 text-center">
        <h1 className="text-xl font-black text-ink">{heading.title}</h1>
        <p className="text-xs leading-6 text-ink-muted">{heading.description}</p>
      </header>

      {step === "phone" ? (
        <PhoneStep defaultPhoneNumber={phoneNumber} onSent={handleSent} />
      ) : (
        <OtpStep
          phoneNumber={phoneNumber}
          onChangeNumber={() => setStep("phone")}
          onVerified={handleVerified}
        />
      )}
    </div>
  );
}
