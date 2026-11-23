import { apiEndpoints } from "@/config/api-endpoints";
import { messages } from "@/config/messages";
import { toUserPayload, updateUserSchema } from "@/features/users/schemas";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { readJson, routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireApiPermission } from "@/lib/auth/require-permission";
import type { ApiFieldError } from "@/types/api";
import type { User } from "@/types/domain";

type RouteContext = { params: Promise<{ id: string }> };

const OBJECT_ID = /^[a-f0-9]{24}$/i;

async function readId(context: RouteContext): Promise<string> {
  const { id } = await context.params;

  if (!OBJECT_ID.test(id)) {
    throw new ApiError({ message: messages.errors.notFound, statusCode: 404 });
  }

  return id;
}

/**
 * Updates a user. `role` is intentionally absent from the schema: a role is
 * chosen once, when the account is created.
 */
export const PUT = routeHandler(async (request, context: RouteContext) => {
  await requireApiPermission("users:update");

  const id = await readId(context);
  const body = await readJson(request, updateUserSchema);
  const { access } = await readSessionCookies();

  const [phone, nationalId] = await Promise.all([
    apiClient.post<{ exitingPhone: boolean }>(
      apiEndpoints.users.checkPhoneUnique,
      { phoneNumber: body.phoneNumbers.primary, excludeUserId: id },
      { token: access },
    ),
    apiClient.post<{ exitingNationalId: boolean }>(
      apiEndpoints.users.checkNationalIdUnique,
      { nationalId: body.nationalId, excludeUserId: id },
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

  return apiClient.put<User>(apiEndpoints.users.update(id), toUserPayload(body), {
    token: access,
  });
});

export const DELETE = routeHandler(async (_request, context: RouteContext) => {
  await requireApiPermission("users:delete");

  const id = await readId(context);
  const { access } = await readSessionCookies();

  return apiClient.delete<null>(apiEndpoints.users.remove(id), {
    token: access,
  });
});
