import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { can } from "@/config/permissions";
import { routes } from "@/config/routes";
import { getInvoice } from "@/features/invoices/api";
import { InvoiceDetail } from "@/features/invoices/components/invoice-detail";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/require-permission";

const OBJECT_ID = /^[a-f0-9]{24}$/i;

export async function generateMetadata({ params }: PageProps<"/invoices/[id]">) {
  const { id } = await params;

  return { title: OBJECT_ID.test(id) ? "جزئیات فاکتور" : "فاکتور یافت نشد" };
}

export default async function InvoicePage({ params }: PageProps<"/invoices/[id]">) {
  const session = await requirePermission("invoice:read");
  const { id } = await params;

  if (!OBJECT_ID.test(id)) notFound();

  let invoice;

  try {
    invoice = await getInvoice(id);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }

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

        <PageTitle
          title={`فاکتور ${invoice.name}`}
          description="مشاهدهٔ محصولات، ضمانت‌ها و اقساط این فاکتور."
        />
      </div>

      <InvoiceDetail
        invoice={invoice}
        canPay={can(session.permissions, "installment:pay")}
      />
    </div>
  );
}
