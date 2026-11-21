import "server-only";

import { redirect } from "next/navigation";

import { landingPathFor } from "@/config/navigation";
import { can, type Permission } from "@/config/permissions";
import { routes } from "@/config/routes";
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
