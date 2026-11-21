import { redirect } from "next/navigation";

import { homeRoute } from "@/config/routes";

/**
 * There is no marketing page. The root sends the visitor to the panel, and the
 * proxy forwards them to the login page if they have no session.
 */
export default function RootPage() {
  redirect(homeRoute);
}
