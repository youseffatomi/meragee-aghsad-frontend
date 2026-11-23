import { z } from "zod";

import { ROLES } from "@/config/permissions";
import { validation } from "@/config/validation";
import { digitsOnly } from "@/lib/format/number";

/**
 * The user payload, mirroring the backend's `UserInput`.
 *
 * Numeric identifiers are normalised here as well as in the form: a Route
 * Handler is a public boundary, and a caller that bypasses the form must not be
 * able to submit Persian digits the backend would reject.
 */

const nationalId = z
  .string()
  .trim()
  .refine((value) => digitsOnly(value).length === validation.nationalId.length, {
    message: `کد ملی باید ${validation.nationalId.length} رقم باشد.`,
  });

const primaryPhone = z
  .string()
  .trim()
  .refine((value) => digitsOnly(value).length >= validation.phoneNumber.minLength, {
    message: `شماره تماس باید حداقل ${validation.phoneNumber.minLength} رقم باشد.`,
  })
  .refine((value) => digitsOnly(value).length <= validation.phoneNumber.maxLength, {
    message: `شماره تماس حداکثر ${validation.phoneNumber.maxLength} رقم است.`,
  });

/** The secondary number is optional and deliberately not uniqueness-checked. */
const secondaryPhone = z.string().trim().optional().nullable();

const identityDocuments = z
  .object({
    nationalCardImage: z.string().min(1).optional(),
    otherDocuments: z.array(z.string()).optional(),
  })
  .optional();

export const userInputSchema = z.object({
  name: z.string().trim().min(1, "نام را وارد کنید."),
  lastName: z.string().trim().min(1, "نام خانوادگی را وارد کنید."),
  nationalId,
  phoneNumbers: z.object({
    primary: primaryPhone,
    secondary: secondaryPhone,
  }),
  residentialAddress: z.string().trim().optional(),
  employmentDetails: z
    .object({
      occupation: z.string().trim().optional(),
      workplace: z.string().trim().optional(),
    })
    .optional(),
  guarantorContact: z.string().trim().optional(),
  identityDocuments,
});

export const createUserSchema = userInputSchema.extend({
  role: z.enum(ROLES),
});

/**
 * Role is chosen once, at creation; the edit schema deliberately has no `role`
 * key, so an update can never change it.
 */
export const updateUserSchema = userInputSchema;

export type UserInput = z.infer<typeof userInputSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const UNIQUE_FIELDS = ["phone", "nationalId"] as const;

export type UniqueField = (typeof UNIQUE_FIELDS)[number];

/** The body of the on-blur uniqueness check. */
export const checkUniqueSchema = z.object({
  field: z.enum(UNIQUE_FIELDS),
  value: z.string().trim().min(1),
  excludeUserId: z
    .string()
    .regex(/^[a-f0-9]{24}$/i)
    .optional(),
});

export type CheckUniqueInput = z.infer<typeof checkUniqueSchema>;

/**
 * Normalises a validated form value into the backend body.
 *
 * An empty document set is omitted entirely rather than sent as empty strings:
 * `nationalCardImage` still carries a `min(1)` rule on the backend.
 */
export function toUserPayload<T extends UserInput>(values: T) {
  const documents = values.identityDocuments;
  const hasDocuments =
    Boolean(documents?.nationalCardImage) || (documents?.otherDocuments?.length ?? 0) > 0;

  return {
    ...values,
    nationalId: digitsOnly(values.nationalId),
    phoneNumbers: {
      primary: digitsOnly(values.phoneNumbers.primary),
      secondary: values.phoneNumbers.secondary?.trim()
        ? digitsOnly(values.phoneNumbers.secondary)
        : null,
    },
    identityDocuments: hasDocuments
      ? {
          ...(documents?.nationalCardImage
            ? { nationalCardImage: documents.nationalCardImage }
            : {}),
          otherDocuments: documents?.otherDocuments ?? [],
        }
      : undefined,
  };
}
