import { ReceiptText } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "فاکتورها" };

export default async function InvoicesPage() {
  await requirePermission("invoice:read");

  return (
    <PagePlaceholder
      title="فاکتورها"
      description="جست‌وجو و مشاهده فاکتورهای ثبت‌شده"
      icon={<ReceiptText className="size-5" aria-hidden="true" />}
    />
  );
}
