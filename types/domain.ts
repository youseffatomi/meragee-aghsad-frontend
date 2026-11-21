import type { Role } from "@/config/permissions";

/**
 * Backend domain models, mirroring the schemas in the OpenAPI spec.
 *
 * These describe what the API actually sends — optional fields are optional
 * because the backend may omit them, not because we chose to model them loosely.
 */

export type User = {
  _id: string;
  name: string;
  lastName: string;
  nationalId: string;
  role: Role;
  phoneNumbers: {
    primary: string;
    secondary?: string | null;
  };
  residentialAddress?: string | null;
  employmentDetails?: {
    occupation?: string | null;
    workplace?: string | null;
  } | null;
  guarantorContact?: string | null;
  identityDocuments?: {
    nationalCardImage?: string | null;
    otherDocuments?: string[] | null;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};
