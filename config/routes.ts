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
    one: (id: string) => `/users/${encodeURIComponent(id)}`,
  },

  invoices: {
    list: "/invoices",
    create: "/invoices/create",
    one: (id: string) => `/invoices/${encodeURIComponent(id)}`,
    /**
     * The public, read-only invoice view. The path is deliberately short and
     * carries no invoice id: the token itself is the unguessable secret.
     */
    public: (token: string) => `/p/${encodeURIComponent(token)}`,
  },

  installments: {
    list: "/installments",
  },

  products: {
    list: "/products",
  },
} as const;

/** The landing page after a successful login, and the fallback for unknown paths. */
export const homeRoute = routes.dashboard;

/**
 * Routes only a signed-out visitor may open. A signed-in user is sent back to
 * the panel instead of seeing the login form again.
 */
const GUEST_ONLY_ROUTES: readonly string[] = [routes.login];

/**
 * Routes reachable without a session but also useful to a signed-in user.
 * The public invoice link is one: an admin may open a customer's link to check
 * what they see, and must not be bounced to the dashboard.
 */
const PUBLIC_ROUTE_PATTERNS: readonly RegExp[] = [/^\/p\/[A-Za-z0-9_-]{20,100}\/?$/];

export function isGuestOnlyRoute(pathname: string): boolean {
  return GUEST_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function isPublicRoute(pathname: string): boolean {
  return (
    isGuestOnlyRoute(pathname) ||
    PUBLIC_ROUTE_PATTERNS.some((pattern) => pattern.test(pathname))
  );
}
