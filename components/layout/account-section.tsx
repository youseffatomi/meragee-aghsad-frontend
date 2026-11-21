import { getSession } from "@/lib/auth/session";
import { AccountSummary } from "./account-summary";

/**
 * The signed-in account, resolved on the server behind its own boundary.
 * See `SidebarSection` for why it is not read at the layout's top level.
 */
export async function AccountSection() {
  const session = await getSession();
  if (!session) return null;

  return <AccountSummary user={session.user} />;
}
