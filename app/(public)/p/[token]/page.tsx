import { notFound } from "next/navigation";

import { getPublicInvoice } from "@/features/invoices/api";
import { PublicInvoiceDetail } from "@/features/invoices/components/public-invoice-detail";
import { ApiError } from "@/lib/api/errors";

/** The token is 24 random bytes encoded as base64url; validate before calling. */
const PUBLIC_TOKEN = /^[A-Za-z0-9_-]{20,100}$/;

export const metadata = {
  title: "مشاهدهٔ فاکتور",
  robots: { index: false, follow: false },
};

export default async function PublicInvoicePage({ params }: PageProps<"/p/[token]">) {
  const { token } = await params;

  if (!PUBLIC_TOKEN.test(token)) notFound();

  let data;

  try {
    data = await getPublicInvoice(token);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }

  return <PublicInvoiceDetail data={data} />;
}
