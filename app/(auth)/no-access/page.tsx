import { ShieldAlert } from "lucide-react";

import { LogoutButton } from "@/features/auth/components/logout-button";

export const metadata = {
  title: "بدون دسترسی",
};

/**
 * Where a signed-in account lands when it has been granted no permission at
 * all — an `ACCOUNTANT` or `USER` today. It exists so `landingPathFor` always
 * has somewhere to point, instead of bouncing the user between pages.
 */
export default function NoAccessPage() {
  return (
    <section className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center shadow-panel">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-brand-tint text-brand-700">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </span>

      <h1 className="mt-5 text-xl font-black text-ink">دسترسی شما فعال نیست</h1>
      <p className="mt-2 text-xs leading-6 text-ink-muted">
        حساب شما در سامانه ثبت شده است، اما هنوز به هیچ بخشی از پنل دسترسی ندارد. برای
        فعال‌سازی با مدیر سامانه تماس بگیرید.
      </p>

      <LogoutButton variant="full" className="mt-6" />
    </section>
  );
}
