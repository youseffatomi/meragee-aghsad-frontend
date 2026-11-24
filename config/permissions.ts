/**
 * The single source of truth for authorisation.
 *
 * Nothing outside this file may compare against a role. Pages, menu entries and
 * guards all ask for a *permission*, so granting a role new access is a one-line
 * change here and never a hunt through components.
 *
 * The grants mirror the `x-allowed-roles` values in the backend OpenAPI spec.
 * `ACCOUNTANT` can only read products; `USER` is a customer account and never
 * signs in to the panel — customers only open their public invoice link.
 */

export const ROLES = ["SUPER_ADMIN", "SELLER", "ACCOUNTANT", "USER"] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "dashboard:view",
  "users:read",
  "users:create",
  "users:update",
  "users:delete",
  "invoice:read",
  "invoice:create",
  "installment:read",
  "installment:pay",
  "product:read",
  "report:read",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const GRANTS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: PERMISSIONS,
  SELLER: ["users:read", "product:read"],
  ACCOUNTANT: ["product:read", "report:read"],
  USER: [],
};

/** The roles allowed to sign in to the panel. `USER` is deliberately excluded. */
export const STAFF_ROLES = ["SUPER_ADMIN", "SELLER", "ACCOUNTANT"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isStaffRole(value: unknown): value is StaffRole {
  return typeof value === "string" && (STAFF_ROLES as readonly string[]).includes(value);
}

export function permissionsFor(role: Role): ReadonlySet<Permission> {
  return new Set(GRANTS[role]);
}

export function can(
  permissions: ReadonlySet<Permission>,
  permission: Permission,
): boolean {
  return permissions.has(permission);
}

export function canAll(
  permissions: ReadonlySet<Permission>,
  required: readonly Permission[],
): boolean {
  return required.every((permission) => permissions.has(permission));
}
