import { FilePlus2 } from "lucide-react";

import { PagePlaceholder } from "@/components/layout/page-placeholder";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "فاکتور جدید" };

export default async function CreateInvoicePage() {
  await requirePermission("invoice:create");

  return (
    <PagePlaceholder
      title="فاکتور جدید"
      description="ثبت فاکتور و تولید خودکار اقساط آن"
      icon={<FilePlus2 className="size-5" aria-hidden="true" />}
    />
  );
}
