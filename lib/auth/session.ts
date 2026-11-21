import "server-only";

import { apiEndpoints } from "@/config/api-endpoints";
import { isRole, permissionsFor, type Permission } from "@/config/permissions";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { SessionUser } from "@/types/auth";
import type { User } from "@/types/domain";
import { readSessionCookies } from "./cookies";

export type Session = {
  user: SessionUser;
  permissions: ReadonlySet<Permission>;
};

/**
 * Reads the signed-in user.
 *
 * The role comes from `GET /users/find/me` rather than from the token payload:
 * the token is not verified here, and a role that changed server-side must take
 * effect on the next request, not on the next login.
 *
 * `use cache: private` is what makes navigation feel instant. Without it every
 * navigation waits on a session lookup before it can render, which Cache
 * Components flags as a blocking route — and rightly so, because the page
 * cannot know what to draw until it knows who is asking. A private cache is the
 * only kind that may read `cookies()`: the entry is kept in the browser for the
 * current session and never on the server, so two users can never share one.
 *
 * Returns `null` only when there is no session to speak of. A backend that is
 * unreachable throws instead — silently signing the user out because the
 * network blipped would be a lie, and would loop them through the login page.
 */
export async function getSession(): Promise<Session | null> {
  "use cache: private";

  const { access } = await readSessionCookies();
  if (!access) return null;

  try {
    const me = await apiClient.get<User>(apiEndpoints.users.me, { token: access });

    if (!isRole(me.role)) return null;

    return {
      user: { id: me._id, name: me.name, lastName: me.lastName, role: me.role },
      permissions: permissionsFor(me.role),
    };
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) return null;
    throw error;
  }
}
