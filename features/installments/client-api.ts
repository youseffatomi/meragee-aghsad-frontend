import { bffEndpoints } from "@/config/api-endpoints";
import { messages } from "@/config/messages";
import type { Installment } from "@/types/domain";
import type { ActionResult } from "@/types/result";

async function request<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });

    const payload = (await response.json()) as ActionResult<T> | null;

    if (!payload || typeof payload.ok !== "boolean") {
      return { ok: false, message: messages.errors.unexpected, fieldErrors: [] };
    }

    return payload;
  } catch {
    return { ok: false, message: messages.errors.network, fieldErrors: [] };
  }
}

export const installmentsApi = {
  pay: (installmentId: string, paymentReceipt: string) =>
    request<unknown>(bffEndpoints.installments.pay, {
      method: "POST",
      body: JSON.stringify({ installmentId, paymentReceipt }),
    }),

  /**
   * Records the waived overdue days and returns the recalculated installment.
   * `null` clears a previously recorded waiver.
   */
  updateWaiver: (installmentId: string, waivedLateDays: number | null) =>
    request<Installment>(bffEndpoints.installments.update(installmentId), {
      method: "PATCH",
      body: JSON.stringify({ waivedLateDays }),
    }),
};
