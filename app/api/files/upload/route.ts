import { apiEndpoints } from "@/config/api-endpoints";
import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { routeHandler } from "@/lib/api/route-handler";
import { readSessionCookies } from "@/lib/auth/cookies";
import { requireApiPermission } from "@/lib/auth/require-permission";
import { validation } from "@/config/validation";

/**
 * Forwards a document upload to the backend's temp folder.
 *
 * The browser never sees the backend origin or the token. The backend enforces
 * type and size again; checking here as well keeps the error immediate.
 */
export const POST = routeHandler(async (request) => {
  await requireApiPermission("users:create");

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    throw new ApiError({ message: "فایلی انتخاب نشده است.", statusCode: 400 });
  }

  if (!(validation.upload.mimeTypes as readonly string[]).includes(file.type)) {
    throw new ApiError({
      message: "فرمت فایل مجاز نیست. فقط JPG، PNG و WEBP پذیرفته می‌شود.",
      statusCode: 400,
    });
  }

  if (file.size > validation.upload.maxBytes) {
    throw new ApiError({
      message: "حجم فایل بیشتر از حد مجاز (۵ مگابایت) است.",
      statusCode: 400,
    });
  }

  const { access } = await readSessionCookies();
  const backendForm = new FormData();
  backendForm.append("file", file, file.name);

  return apiClient.postForm<{ filePath: string }>(apiEndpoints.files.send, backendForm, {
    token: access,
  });
});
