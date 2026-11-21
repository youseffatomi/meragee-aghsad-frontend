/**
 * Every in-app URL, in one place. Nothing in the codebase should contain a
 * literal path: pages, links, redirects and the route guard all read from here,
 * so renaming a route cannot leave a dead link behind.
 */
export const routes = {
  login: "/login",

  /** Shown to a signed-in account that has been granted nothing at all. */
  noAccess: "/no-access",

  dashboard: "/dashboard",

  users: {
    list: "/users",
    create: "/users/create",
  },

  invoices: {
    list: "/invoices",
    create: "/invoices/create",
  },

  installments: {
    list: "/installments",
  },
} as const;

/** The landing page after a successful login, and the fallback for unknown paths. */
export const homeRoute = routes.dashboard;

/**
 * Routes reachable without a session. The guard treats everything not listed
 * here as protected, so a new page is protected by default rather than by
 * remembering to add it.
 */
const PUBLIC_ROUTES: readonly string[] = [routes.login];

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}
