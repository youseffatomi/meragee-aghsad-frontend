import {
  CalendarDays,
  ChartColumn,
  FilePlus2,
  Home,
  Package,
  ReceiptText,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { NavIconName } from "@/config/navigation";

/**
 * The only place that knows which icon library is in use.
 *
 * `config/navigation.ts` names icons as strings so it stays plain data — a
 * server module with no React dependency — and this map turns those names into
 * components.
 */
const ICONS: Record<NavIconName, LucideIcon> = {
  home: Home,
  users: Users,
  "user-plus": UserPlus,
  receipt: ReceiptText,
  "file-plus": FilePlus2,
  calendar: CalendarDays,
  package: Package,
  chart: ChartColumn,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = ICONS[name];

  return <Icon className={className} aria-hidden="true" />;
}
