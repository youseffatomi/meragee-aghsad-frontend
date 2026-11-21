import { UserPlus } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "اضافه کردن کاربر" };

export default async function CreateUserPage() {
  await requirePermission("users:create");

  return (
    <PagePlaceholder
      title="اضافه کردن کاربر"
      description="ثبت مشتری جدید همراه با اطلاعات هویتی و ضامن"
      icon={<UserPlus className="size-5" aria-hidden="true" />}
    />
  );
}
