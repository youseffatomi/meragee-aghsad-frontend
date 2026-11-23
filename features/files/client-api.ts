import { bffEndpoints } from "@/config/api-endpoints";
import { messages } from "@/config/messages";
import type { ActionResult } from "@/types/result";

/**
 * The browser's view of file uploads.
 *
 * Every call goes to our own Route Handler, so the `httpOnly` token never
 * reaches JavaScript. Network failures are flattened to `ActionResult`.
 */

async function request<T>(path: string, init: RequestInit): Promise<ActionResult<T>> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
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

export const filesApi = {
  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);

    return request<{ filePath: string }>(bffEndpoints.files.upload, {
      method: "POST",
      body: form,
    });
  },

  remove: (filename: string) =>
    request<null>(bffEndpoints.files.remove, {
      method: "POST",
      body: JSON.stringify({ filename }),
    }),
};
