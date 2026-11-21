import { LayoutDashboard } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "داشبورد" };

export default async function DashboardPage() {
  await requirePermission("dashboard:view");

  return (
    <PagePlaceholder
      title="داشبورد"
      description="نمای کلی وضعیت اقساط و فاکتورها"
      icon={<LayoutDashboard className="size-5" aria-hidden="true" />}
    />
  );
}
