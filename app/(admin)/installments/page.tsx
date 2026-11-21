import { CalendarDays } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "اقساط" };

export default async function InstallmentsPage() {
  await requirePermission("installment:read");

  return (
    <PagePlaceholder
      title="اقساط"
      description="پیگیری سررسیدها، پرداخت‌ها و اقساط معوق"
      icon={<CalendarDays className="size-5" aria-hidden="true" />}
    />
  );
}
