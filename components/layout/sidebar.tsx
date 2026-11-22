import Image from "next/image";
import Link from "next/link";

import { homeRoute } from "@/config/routes";
import { site } from "@/config/site";
import type { NavigationItem } from "@/config/navigation";
import { SidebarNav } from "./sidebar-nav";

/**
 * Presentational only — the same markup backs the floating desktop card and
 * the mobile drawer. It is a server component; the interactive part lives in
 * `SidebarNav`.
 *
 * The logo is scaled rather than stretched to the card: at full width it filled
 * a hundred pixels of the panel before the first menu row. It steps up once, on
 * the desktop card, and keeps its own aspect ratio so it can never be squashed
 * by a narrow drawer.
 */

type SidebarProps = {
  items: readonly NavigationItem[];
};

export function Sidebar({ items }: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-stack px-3 pt-4 pb-4">
      <Link
        href={homeRoute}
        className="grid w-full place-items-center rounded-field focus-visible:ring-2 focus-visible:ring-brand-100 focus-visible:outline-none"
      >
        <Image
          src={site.logo.src}
          alt={site.logo.alt}
          width={site.logo.width}
          height={site.logo.height}
          priority
          className="h-15 w-auto lg:h-15"
        />
      </Link>

      <nav aria-label="منوی اصلی">
        <SidebarNav items={items} />
      </nav>
    </div>
  );
}
