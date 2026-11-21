import { visibleNavigation } from "@/config/navigation";
import { getSession } from "@/lib/auth/session";
import { Sidebar } from "./sidebar";

/**
 * The menu, resolved on the server.
 *
 * It sits behind its own `<Suspense>` boundary in the layout rather than being
 * awaited at the layout's top level: a top-level session read holds the whole
 * segment — the pages included — until it resolves, which makes every
 * navigation wait on a request.
 */
export async function SidebarSection() {
  const session = await getSession();
  if (!session) return null;

  return <Sidebar items={visibleNavigation(session.permissions)} />;
}
