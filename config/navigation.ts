import { can, type Permission } from "./permissions";
import { routes } from "./routes";

/**
 * The application's navigable structure.
 *
 * Each entry declares the permission it needs, so the sidebar and the route
 * guards are generated from the same data and cannot drift apart. Icons are
 * referenced by name and resolved in `components/layout/nav-icon.tsx`; keeping
 * the mapping out of here means this module stays plain data that server code
 * can import freely.
 */

export type NavIconName =
  | "home"
  | "users"
  | "user-plus"
  | "receipt"
  | "file-plus"
  | "calendar"
  | "package"
  | "chart";

export type NavigationItem = {
  label: string;
  href: string;
  icon: NavIconName;
  permission: Permission;
  children?: readonly NavigationItem[];
};

export const navigation: readonly NavigationItem[] = [
  {
    label: "داشبورد",
    href: routes.dashboard,
    icon: "home",
    permission: "dashboard:view",
  },
  {
    label: "کاربران",
    href: routes.users.list,
    icon: "users",
    permission: "users:read",
    children: [
      {
        label: "اضافه کردن کاربر",
        href: routes.users.create,
        icon: "user-plus",
        permission: "users:create",
      },
    ],
  },
  {
    label: "فاکتورها",
    href: routes.invoices.list,
    icon: "receipt",
    permission: "invoice:read",
    children: [
      {
        label: "فاکتور جدید",
        href: routes.invoices.create,
        icon: "file-plus",
        permission: "invoice:create",
      },
    ],
  },
  {
    label: "اقساط",
    href: routes.installments.list,
    icon: "calendar",
    permission: "installment:read",
  },
  {
    label: "محصولات",
    href: routes.products.list,
    icon: "package",
    permission: "product:read",
  },
  {
    label: "گزارش مالی",
    href: routes.reports.financial,
    icon: "chart",
    permission: "report:read",
  },
];

/** Drops every entry the given permissions cannot reach, children included. */
export function visibleNavigation(
  permissions: ReadonlySet<Permission>,
): NavigationItem[] {
  return navigation
    .filter((item) => can(permissions, item.permission))
    .map((item) => ({
      ...item,
      children: item.children?.filter((child) => can(permissions, child.permission)),
    }));
}

/**
 * Where to send a user right after login. A SELLER has no dashboard access, so
 * they land on the first thing they can actually open.
 *
 * An account granted nothing lands on the "no access" page rather than on the
 * dashboard, which it would only be bounced away from again.
 */
export function landingPathFor(permissions: ReadonlySet<Permission>): string {
  return visibleNavigation(permissions)[0]?.href ?? routes.noAccess;
}

/** True when `href` is the current page or one of its descendants. */
export function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
