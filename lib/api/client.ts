import "server-only";

import { env } from "@/config/env";
import type { ApiEnvelope } from "@/types/api";
import { ApiError } from "./errors";
import { toAuthorizationHeader } from "@/lib/auth/token";

/**
 * The only way this codebase talks to the backend.
 *
 * A thin wrapper over `fetch` rather than an HTTP library: the token is passed
 * per call instead of living on a shared client, so two concurrent requests in
 * the same Node process can never leak credentials into each other's headers.
 *
 * Responsibilities, in order: resolve the URL, attach auth, read the envelope,
 * turn a failure into a thrown `ApiError`.
 */

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
  /** `undefined`, `null` and `""` values are dropped instead of sent empty. */
  query?: Record<string, QueryValue>;
  /** The raw token. It already carries a `Bearer ` prefix; we never add a second. */
  token?: string | null;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(`${env.API_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  try {
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    throw ApiError.unreadable(response.status);
  }
}

async function request<T>(
  method: HttpMethod,
  path: string,
  body: unknown,
  options: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const isFormData = body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = toAuthorizationHeader(options.token);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
      // Authenticated data is per-user; caching it would be a correctness bug.
      cache: "no-store",
      signal: options.signal,
    });
  } catch (cause) {
    // A cancellation is the caller's own doing — surface it unchanged so it is
    // not reported to the user as a connectivity problem.
    if (cause instanceof Error && cause.name === "AbortError") throw cause;
    throw ApiError.network();
  }

  const envelope = await readEnvelope<T>(response);

  if (!envelope.success) {
    throw ApiError.fromEnvelope(envelope);
  }

  return envelope.data;
}

export const apiClient = {
  get: <T>(path: string, options: RequestOptions = {}) =>
    request<T>("GET", path, undefined, options),

  post: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    request<T>("POST", path, body, options),

  /** Multipart upload: the browser's `FormData` is forwarded untouched. */
  postForm: <T>(path: string, form: FormData, options: RequestOptions = {}) =>
    request<T>("POST", path, form, options),

  put: <T>(path: string, body?: unknown, options: RequestOptions = {}) =>
    request<T>("PUT", path, body, options),

  delete: <T>(path: string, options: RequestOptions = {}) =>
    request<T>("DELETE", path, undefined, options),
};
