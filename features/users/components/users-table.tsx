import Link from "next/link";
import { Eye, Pencil, Users } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { routes } from "@/config/routes";
import { formatJalaliDate } from "@/lib/format/date";
import { toPersianDigits } from "@/lib/format/number";
import type { User } from "@/types/domain";
import { DeleteUserButton } from "./delete-user-button";
import { RoleBadge } from "./role-badge";

type UsersTableProps = {
  users: User[];
  canUpdate: boolean;
  canDelete: boolean;
};

const ACTION_CLASS =
  "inline-flex size-8 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:bg-surface-sunken hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none";

/** The users list. Actions are rendered only for permissions the session has. */
export function UsersTable({ users, canUpdate, canDelete }: UsersTableProps) {
  if (users.length === 0) {
    return (
      <EmptyState
        icon={<Users className="size-5" aria-hidden="true" />}
        title="کاربری پیدا نشد"
        description="عبارت جستجو را تغییر دهید یا کاربر جدیدی ثبت کنید."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[54rem] border-collapse text-xs">
        <thead>
          <tr className="text-ink-muted">
            <th scope="col" className="pb-3 text-start font-medium">
              نام و نام خانوادگی
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              کد ملی
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              شماره تماس
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              نقش
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              تاریخ ثبت
            </th>
            <th scope="col" className="pb-3 text-start font-medium">
              عملیات
            </th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => {
            const fullName = `${user.name} ${user.lastName}`.trim();

            return (
              <tr key={user._id} className="border-t border-line">
                <td className="py-3 pe-3 whitespace-nowrap">
                  <Link
                    href={routes.users.one(user._id)}
                    className="font-bold text-ink transition-colors hover:text-brand-text"
                  >
                    {fullName || "—"}
                  </Link>
                </td>
                <td className="py-3 pe-3 whitespace-nowrap text-ink-muted tabular-nums">
                  <span dir="ltr">{toPersianDigits(user.nationalId)}</span>
                </td>
                <td className="py-3 pe-3 whitespace-nowrap text-ink-muted tabular-nums">
                  <span dir="ltr">
                    {toPersianDigits(user.phoneNumbers?.primary ?? "")}
                  </span>
                </td>
                <td className="py-3 pe-3 whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </td>
                <td className="py-3 pe-3 whitespace-nowrap text-ink-muted">
                  {formatJalaliDate(user.createdAt)}
                </td>
                <td className="py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={routes.users.one(user._id)}
                      aria-label={`مشاهده ${fullName}`}
                      className={ACTION_CLASS}
                    >
                      <Eye className="size-3.5" aria-hidden="true" />
                    </Link>

                    {canUpdate ? (
                      <Link
                        href={routes.users.one(user._id)}
                        aria-label={`ویرایش ${fullName}`}
                        className={ACTION_CLASS}
                      >
                        <Pencil className="size-3.5" aria-hidden="true" />
                      </Link>
                    ) : null}

                    {canDelete ? (
                      <DeleteUserButton userId={user._id} userName={fullName} />
                    ) : null}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
