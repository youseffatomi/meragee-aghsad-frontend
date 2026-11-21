import { Users } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "کاربران" };

export default async function UsersPage() {
  await requirePermission("users:read");

  return (
    <PagePlaceholder
      title="کاربران"
      description="فهرست مشتریان و اطلاعات هویتی آن‌ها"
      icon={<Users className="size-5" aria-hidden="true" />}
    />
  );
}
