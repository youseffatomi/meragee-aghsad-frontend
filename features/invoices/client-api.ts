import { bffEndpoints } from "@/config/api-endpoints";
import { messages } from "@/config/messages";
import type { ActionResult } from "@/types/result";
import type { Invoice } from "@/types/domain";
import type { CreateInvoiceInput } from "./schemas";

async function request<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
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

export const invoicesApi = {
  create: (input: CreateInvoiceInput) =>
    request<Invoice>(bffEndpoints.invoices.create, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
