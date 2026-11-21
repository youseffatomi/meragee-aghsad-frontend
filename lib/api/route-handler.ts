import "server-only";

import { NextResponse } from "next/server";
import type { ZodType } from "zod";

import { messages } from "@/config/messages";
import type { ActionResult } from "@/types/result";
import { ApiError, toActionFailure } from "./errors";

/**
 * Every Route Handler under `app/api` is built from these two helpers, so each
 * one stays a handful of lines: read the body, call the backend, return data.
 *
 * The browser never sees the backend envelope — it sees `ActionResult`, which
 * is the same shape on success and on failure. That is what lets a client
 * component render an error without knowing where it came from.
 */

type Handler<T> = (request: Request) => Promise<T>;

/** A backend status is meaningful to the browser; an internal one is not. */
function statusFor(error: unknown): number {
  if (error instanceof ApiError) return error.statusCode || 502;
  return 500;
}

export function routeHandler<T>(handler: Handler<T>) {
  return async (request: Request): Promise<NextResponse<ActionResult<T>>> => {
    try {
      const data = await handler(request);
      return NextResponse.json<ActionResult<T>>({ ok: true, data }, { status: 200 });
    } catch (error) {
      return NextResponse.json<ActionResult<never>>(toActionFailure(error), {
        status: statusFor(error),
      });
    }
  };
}

/**
 * Parses and validates a JSON body. A validation failure becomes an `ApiError`
 * carrying `fieldErrors`, which is exactly what the form needs to highlight the
 * offending input.
 */
export async function readJson<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    throw new ApiError({
      message: messages.errors.validation,
      statusCode: 400,
    });
  }

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new ApiError({
      message: messages.errors.validation,
      statusCode: 400,
      fieldErrors: parsed.error.issues.map((issue) => ({
        field: String(issue.path[0] ?? ""),
        message: issue.message,
      })),
    });
  }

  return parsed.data;
}
