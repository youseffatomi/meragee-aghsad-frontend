import { Check } from "lucide-react";

import { toPersianDigits } from "@/lib/format/number";
import { cn } from "@/lib/utils/cn";

type WizardStepperProps = {
  steps: readonly { title: string }[];
  current: number;
};

/** A compact progress rail: completed steps show a check, the rest a number. */
export function WizardStepper({ steps, current }: WizardStepperProps) {
  return (
    <ol className="flex items-start justify-between gap-1">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;

        return (
          <li key={step.title} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-px flex-1",
                  index === 0
                    ? "bg-transparent"
                    : done || active
                      ? "bg-brand-400"
                      : "bg-line",
                )}
              />

              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                  done
                    ? "bg-brand-700 text-white"
                    : active
                      ? "bg-brand-soft text-brand-text ring-2 ring-brand-400"
                      : "bg-surface-muted text-ink-muted",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  toPersianDigits(index + 1)
                )}
              </span>

              <span
                className={cn(
                  "h-px flex-1",
                  index === steps.length - 1
                    ? "bg-transparent"
                    : done
                      ? "bg-brand-400"
                      : "bg-line",
                )}
              />
            </div>

            <span
              className={cn(
                "text-center text-[11px] leading-4",
                active ? "font-bold text-ink" : "text-ink-muted",
              )}
            >
              {step.title}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
