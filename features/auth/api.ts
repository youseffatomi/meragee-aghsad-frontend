import { bffEndpoints } from "@/config/api-endpoints";
import { messages } from "@/config/messages";
import type { ActionResult } from "@/types/result";
import type { SendOtpInput, VerifyOtpInput } from "./schemas";

/**
 * The browser's only view of authentication.
 *
 * Every call goes to our own Route Handler, never to the backend: the tokens
 * are set as `httpOnly` cookies there and never travel through JavaScript.
 *
 * Network failures are converted into an `ActionResult` here so a form never
 * has to wrap its submit in a try/catch — one shape to handle, always.
 */
async function post<T>(path: string, body: unknown): Promise<ActionResult<T>> {
  try {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
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

export const authApi = {
  sendOtp: (input: SendOtpInput) => post<null>(bffEndpoints.auth.sendOtp, input),

  verifyOtp: (input: VerifyOtpInput) =>
    post<{ redirectTo: string }>(bffEndpoints.auth.verifyOtp, input),

  logout: () => post<null>(bffEndpoints.auth.logout, {}),
};
