import { bffEndpoints } from "@/config/api-endpoints";
import { messages } from "@/config/messages";
import type { ActionResult } from "@/types/result";
import type { User } from "@/types/domain";
import type { CheckUniqueInput, CreateUserInput, UpdateUserInput } from "./schemas";

/**
 * The browser's view of the users feature.
 *
 * Every call goes to our own Route Handler, never to the backend, so the
 * `httpOnly` token never reaches JavaScript. Network failures are flattened to
 * `ActionResult` here, which is the only shape a form has to handle.
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

export const usersApi = {
  create: (input: CreateUserInput) =>
    request<User>(bffEndpoints.users.create, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  update: (id: string, input: UpdateUserInput) =>
    request<User>(bffEndpoints.users.one(id), {
      method: "PUT",
      body: JSON.stringify(input),
    }),

  remove: (id: string) => request<null>(bffEndpoints.users.one(id), { method: "DELETE" }),

  upload: (file: File) => {
    const form = new FormData();
    form.append("file", file);

    return request<{ filePath: string }>(bffEndpoints.files.upload, {
      method: "POST",
      body: form,
    });
  },

  removeFile: (filename: string) =>
    request<null>(bffEndpoints.files.remove, {
      method: "POST",
      body: JSON.stringify({ filename }),
    }),

  checkUnique: (input: CheckUniqueInput) =>
    request<{ taken: boolean }>(bffEndpoints.users.checkUnique, {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
