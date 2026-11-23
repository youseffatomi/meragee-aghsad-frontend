import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageTitle } from "@/components/layout/page-title";
import { routes } from "@/config/routes";
import { CreateUserWizard } from "@/features/users/components/create-user-wizard";
import { requirePermission } from "@/lib/auth/require-permission";

export const metadata = { title: "افزودن کاربر" };

export default async function CreateUserPage() {
  await requirePermission("users:create");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={routes.users.list}
          className="inline-flex w-fit items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
        >
          <ArrowRight className="size-3.5" aria-hidden="true" />
          بازگشت به کاربران
        </Link>

        <PageTitle title="افزودن کاربر" />
      </div>

      <CreateUserWizard />
    </div>
  );
}
