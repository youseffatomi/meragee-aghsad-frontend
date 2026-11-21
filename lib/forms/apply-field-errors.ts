import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import type { ActionResult } from "@/types/result";

/**
 * Moves the backend's field-level complaints onto the matching form fields.
 *
 * The backend names fields the way its own schema does, which for these forms
 * is the same name the input is registered under. Anything it reports for a
 * field we do not render is dropped rather than silently attached to the form.
 */
export function applyFieldErrors<T extends FieldValues>(
  result: Extract<ActionResult<unknown>, { ok: false }>,
  form: UseFormReturn<T>,
): void {
  for (const { field, message } of result.fieldErrors) {
    if (!field) continue;
    form.setError(field as Path<T>, { type: "server", message });
  }
}
