import { apiEndpoints } from "@/config/api-endpoints";
import { messages } from "@/config/messages";
import { createUserSchema, toUserPayload } from "@/features/users/schemas";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { readJson, routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireApiPermission } from "@/lib/auth/require-permission";
import type { ApiFieldError } from "@/types/api";
import type { User } from "@/types/domain";

/**
 * Creates a user.
 *
 * Uniqueness is checked before the write so the form can point at the exact
 * field; the backend's unique indexes remain the final authority. Only the
 * primary phone is checked — the secondary number is informational.
 */
export const POST = routeHandler(async (request) => {
  await requireApiPermission("users:create");

  const body = await readJson(request, createUserSchema);
  const { access } = await readSessionCookies();

  const [phone, nationalId] = await Promise.all([
    apiClient.post<{ exitingPhone: boolean }>(
      apiEndpoints.users.checkPhoneUnique,
      { phoneNumber: body.phoneNumbers.primary },
      { token: access },
    ),
    apiClient.post<{ exitingNationalId: boolean }>(
      apiEndpoints.users.checkNationalIdUnique,
      { nationalId: body.nationalId },
      { token: access },
    ),
  ]);

  const fieldErrors: ApiFieldError[] = [];

  if (phone.exitingPhone) {
    fieldErrors.push({
      field: "phoneNumbers.primary",
      message: "این شماره تماس قبلاً برای کاربر دیگری ثبت شده است.",
    });
  }

  if (nationalId.exitingNationalId) {
    fieldErrors.push({
      field: "nationalId",
      message: "این کد ملی قبلاً برای کاربر دیگری ثبت شده است.",
    });
  }

  if (fieldErrors.length > 0) {
    throw new ApiError({
      message: messages.errors.validation,
      statusCode: 400,
      fieldErrors,
    });
  }

  return apiClient.post<User>(apiEndpoints.users.create, toUserPayload(body), {
    token: access,
  });
});
