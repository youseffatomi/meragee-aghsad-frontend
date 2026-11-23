import { apiEndpoints } from "@/config/api-endpoints";
import { digitsOnly } from "@/lib/format/number";
import { apiClient } from "@/lib/api/client";
import { readJson, routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireAnyApiPermission } from "@/lib/auth/require-permission";
import { checkUniqueSchema } from "@/features/users/schemas";

/**
 * The on-blur uniqueness check used by the create and edit forms.
 *
 * It is deliberately separate from the write endpoints: this is a UX hint, not
 * a guarantee. The create/update handlers repeat the check so a race between
 * two forms still ends with one rejection.
 */
export const POST = routeHandler(async (request) => {
  await requireAnyApiPermission(["users:create", "users:update"]);

  const body = await readJson(request, checkUniqueSchema);
  const { access } = await readSessionCookies();
  const value = digitsOnly(body.value);

  if (body.field === "phone") {
    const { exitingPhone } = await apiClient.post<{ exitingPhone: boolean }>(
      apiEndpoints.users.checkPhoneUnique,
      { phoneNumber: value, excludeUserId: body.excludeUserId },
      { token: access },
    );

    return { taken: exitingPhone };
  }

  const { exitingNationalId } = await apiClient.post<{
    exitingNationalId: boolean;
  }>(
    apiEndpoints.users.checkNationalIdUnique,
    { nationalId: value, excludeUserId: body.excludeUserId },
    { token: access },
  );

  return { taken: exitingNationalId };
});
