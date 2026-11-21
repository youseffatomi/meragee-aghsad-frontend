import type { Role } from "@/config/permissions";

/**
 * The signed-in user, as far as the browser is concerned. Tokens are never part
 * of this type: they live in `httpOnly` cookies that JavaScript cannot read.
 */
export type SessionUser = {
  id: string;
  name: string;
  lastName: string;
  role: Role;
};

/** The `data` of `POST /auth/login/verify-otp` and `POST /auth/refresh`. */
export type AuthTokens = {
  access: string;
  refresh: string;
};
