import Link from "next/link";
import { UserPlus } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { Pagination } from "@/components/ui/pagination";
import { can } from "@/config/permissions";
import { routes } from "@/config/routes";
import { getUsers } from "@/features/users/api";
import { UsersSearchForm } from "@/features/users/components/users-search-form";
import { UsersTable } from "@/features/users/components/users-table";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "کاربران" };

/** Reads a query value that may arrive repeated; the first one wins. */
function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function positivePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
  const session = await requirePermission("users:read");

  const params = await searchParams;
  const search = single(params.search).trim();
  const page = positivePage(single(params.page));

  const users = await getUsers({ search: search || undefined, page });

  const hrefForPage = (nextPage: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return suffix ? `${routes.users.list}?${suffix}` : routes.users.list;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle title="کاربران" description="جستجو، مشاهده و مدیریت کاربران سامانه." />

        {can(session.permissions, "users:create") ? (
          <Link
            href={routes.users.create}
            className="inline-flex h-11 items-center gap-2 rounded-field bg-brand-700 px-5 text-sm font-medium text-white shadow-card transition-colors hover:bg-brand-800 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
          >
            <UserPlus className="size-4" aria-hidden="true" />
            افزودن کاربر
          </Link>
        ) : null}
      </div>

      <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <UsersSearchForm key={search} search={search} />

        <div className="mt-4">
          <UsersTable
            users={users.result}
            canUpdate={can(session.permissions, "users:update")}
            canDelete={can(session.permissions, "users:delete")}
          />
        </div>

        <Pagination meta={users.meta} hrefFor={hrefForPage} className="mt-5" />
      </section>
    </div>
  );
}
