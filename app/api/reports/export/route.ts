import { NextResponse } from "next/server";

import { apiEndpoints } from "@/config/api-endpoints";
import { env } from "@/config/env";
import { ApiError, toActionFailure } from "@/lib/api/errors";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireApiPermission } from "@/lib/auth/require-permission";
import { toAuthorizationHeader } from "@/lib/auth/token";

/**
 * Streams the backend's CSV export through the BFF.
 *
 * A plain `<a href>` cannot carry the `httpOnly` access token, so the browser
 * downloads from here and this handler attaches the token on the server. The
 * file's own `Content-Type` and `Content-Disposition` are forwarded untouched;
 * failures keep the `ActionResult` JSON shape the export button already knows.
 */

const FORWARDED_PARAMS = [
  "type",
  "fromDate",
  "toDate",
  "search",
  "status",
  "sort",
] as const;

export async function GET(request: Request) {
  try {
    await requireApiPermission("report:read");
  } catch (error) {
    const failure = toActionFailure(error);
    const status = error instanceof ApiError ? error.statusCode || 500 : 500;

    return NextResponse.json(failure, { status });
  }

  const { access } = await readSessionCookies();
  const incoming = new URL(request.url);
  const target = new URL(`${env.API_BASE_URL}${apiEndpoints.reports.export}`);

  for (const key of FORWARDED_PARAMS) {
    const value = incoming.searchParams.get(key);
    if (value) target.searchParams.set(key, value);
  }

  let response: Response;

  try {
    response = await fetch(target, {
      headers: access ? { Authorization: toAuthorizationHeader(access) } : {},
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      toActionFailure(
        new ApiError({
          message: "ارتباط با سرور برقرار نشد. دوباره تلاش کنید.",
          statusCode: 502,
        }),
      ),
      { status: 502 },
    );
  }

  if (!response.ok) {
    // The backend answers errors with its JSON envelope; pass the status and
    // body through so the button can show the same message as the rest of the app.
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    response.headers.get("content-type") ?? "text/csv; charset=utf-8",
  );

  const disposition = response.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  headers.set("Cache-Control", "no-store");

  return new NextResponse(response.body, { status: 200, headers });
}
