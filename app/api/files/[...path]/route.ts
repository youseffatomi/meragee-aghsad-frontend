import { env } from "@/config/env";

/**
 * Serves an uploaded document through our own origin.
 *
 * The backend sets Helmet's `Cross-Origin-Resource-Policy: same-origin`, so an
 * `<img>` on the frontend origin cannot load it directly. Proxying also keeps
 * the backend URL out of the HTML.
 */

const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;

  if (
    path.length === 0 ||
    path.some((segment) => segment === ".." || !SAFE_SEGMENT.test(segment))
  ) {
    return new Response(null, { status: 404 });
  }

  const origin = new URL(env.BASE_URL).origin;
  const target = `${origin}/files/${path.map(encodeURIComponent).join("/")}`;

  console.log(target);

  let response: Response;

  try {
    response = await fetch(target, { cache: "no-store" });
  } catch {
    return new Response(null, { status: 502 });
  }

  if (!response.ok || !response.body) {
    return new Response(null, { status: response.status || 404 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
