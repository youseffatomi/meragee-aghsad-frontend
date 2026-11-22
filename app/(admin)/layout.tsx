import { Suspense } from "react";

import { AccountSection } from "@/components/layout/account-section";
import { AdminFrame } from "@/components/layout/admin-frame";
import { HeaderActions } from "@/components/layout/header-actions";
import { SidebarSection } from "@/components/layout/sidebar-section";
import {
  AccountSkeleton,
  ActionsSkeleton,
  SidebarSkeleton,
} from "@/components/layout/shell-skeletons";

/**
 * Each part of the chrome that needs the session gets its own boundary, and
 * `{children}` is deliberately outside all of them.
 *
 * That ordering is the whole point: if the layout awaited the session itself,
 * every navigation would wait for the user lookup before the page could even
 * start, and Cache Components reports that as a blocking route.
 */
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <AdminFrame
      sidebar={
        <Suspense fallback={<SidebarSkeleton />}>
          <SidebarSection />
        </Suspense>
      }
      account={
        <Suspense fallback={<AccountSkeleton />}>
          <AccountSection />
        </Suspense>
      }
      actions={
        <Suspense fallback={<ActionsSkeleton />}>
          <HeaderActions />
        </Suspense>
      }
    >
      {children}
    </AdminFrame>
  );
}
