import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { can } from "@/config/permissions";
import { routes } from "@/config/routes";
import { getUserWithInvoices } from "@/features/users/api";
import { DeleteUserButton } from "@/features/users/components/delete-user-button";
import { UserDocuments } from "@/features/users/components/user-documents";
import { UserInvoicesTable } from "@/features/users/components/user-invoices-table";
import { UserProfile } from "@/features/users/components/user-profile";
import { ApiError } from "@/lib/api/errors";
import { requirePermission } from "@/lib/auth/require-permission";

const OBJECT_ID = /^[a-f0-9]{24}$/i;

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function positivePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export async function generateMetadata({ params }: PageProps<"/users/[id]">) {
  const { id } = await params;

  return { title: OBJECT_ID.test(id) ? "پروفایل کاربر" : "کاربر یافت نشد" };
}

export default async function UserPage({
  params,
  searchParams,
}: PageProps<"/users/[id]">) {
  const session = await requirePermission("users:read");

  const [{ id }, query] = await Promise.all([params, searchParams]);

  if (!OBJECT_ID.test(id)) notFound();

  const invoicePage = positivePage(single(query.invoicePage));

  let data;

  try {
    data = await getUserWithInvoices(id, { page: invoicePage });
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }

  const fullName = `${data.name} ${data.lastName}`.trim();

  const hrefForInvoicePage = (page: number) =>
    page > 1 ? `${routes.users.one(id)}?invoicePage=${page}` : routes.users.one(id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <Link
            href={routes.users.list}
            className="inline-flex w-fit items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
          >
            <ArrowRight className="size-3.5" aria-hidden="true" />
            بازگشت به کاربران
          </Link>

          <PageTitle
            title={fullName || "کاربر"}
            description="مشاهده و ویرایش اطلاعات، مدارک هویتی و فاکتورهای کاربر."
          />
        </div>

        {can(session.permissions, "users:delete") ? (
          <DeleteUserButton
            userId={data._id}
            userName={fullName}
            redirectTo={routes.users.list}
            variant="button"
          />
        ) : null}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        <UserProfile user={data} canUpdate={can(session.permissions, "users:update")} />

        <UserDocuments documents={data.identityDocuments} />
      </div>

      <UserInvoicesTable
        invoices={data.invoices.result}
        meta={data.invoices.meta}
        hrefForPage={hrefForInvoicePage}
      />
    </div>
  );
}
