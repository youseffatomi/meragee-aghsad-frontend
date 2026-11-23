import "server-only";

import { redirect } from "next/navigation";

import { landingPathFor } from "@/config/navigation";
import { messages } from "@/config/messages";
import { can, type Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
import { ApiError } from "@/lib/api/errors";
import { getSession, type Session } from "./session";

/**
 * The server-side half of the permission check. `proxy.ts` only knows whether
 * a session exists; it cannot know what the role is allowed to open, so every
 * page asserts its own permission here.
 *
 * A missing session redirects to the login page. A session without the
 * permission redirects to whatever that user *can* open — the alternative,
 * Next's experimental `forbidden()` interrupt, requires enabling another
 * experimental flag for a case that is rare in this panel.
 */
export async function requirePermission(permission: Permission): Promise<Session> {
  const session = await getSession();

  if (!session) redirect(routes.login);

  if (!can(session.permissions, permission)) {
    redirect(landingPathFor(session.permissions));
  }

  return session;
}

/**
 * The Route Handler counterpart of `requirePermission`.
 *
 * A redirect is meaningless to a `fetch` from the browser, so a missing
 * session becomes a `401` and a missing permission a `403` — both in the same
 * `ActionResult` envelope every handler already returns.
 */
export async function requireApiPermission(permission: Permission): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new ApiError({
      message: messages.errors.unauthorized,
      statusCode: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  if (!can(session.permissions, permission)) {
    throw new ApiError({
      message: messages.errors.forbidden,
      statusCode: 403,
      errorCode: "FORBIDDEN",
    });
  }

  return session;
}

/**
 * Like `requireApiPermission`, but the session only needs one of the listed
 * permissions. Used by shared endpoints — the uniqueness check is reachable
 * from both the create and the edit form.
 */
export async function requireAnyApiPermission(
  permissions: readonly Permission[],
): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new ApiError({
      message: messages.errors.unauthorized,
      statusCode: 401,
      errorCode: "UNAUTHORIZED",
    });
  }

  if (!permissions.some((permission) => can(session.permissions, permission))) {
    throw new ApiError({
      message: messages.errors.forbidden,
      statusCode: 403,
      errorCode: "FORBIDDEN",
    });
  }

  return session;
}
