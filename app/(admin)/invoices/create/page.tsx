import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { routes } from "@/config/routes";
import { CreateInvoiceWizard } from "@/features/invoices/components/create-invoice-wizard";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "فاکتور جدید" };

export default async function CreateInvoicePage() {
  await requirePermission("invoice:create");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={routes.invoices.list}
          className="inline-flex w-fit items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
        >
          <ArrowRight className="size-3.5" aria-hidden="true" />
          بازگشت به فاکتورها
        </Link>

        <PageTitle title="فاکتور جدید" />
      </div>

      <CreateInvoiceWizard />
    </div>
  );
}
