"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { isActivePath, type NavigationItem } from "@/config/navigation";
import { cn } from "@/lib/utils/cn";
import { NavIcon } from "./nav-icon";

/**
 * The menu, shared by the fixed sidebar and the mobile drawer so the two can
 * never drift apart.
 *
 * A row is dressed one of three ways, and the three are deliberate:
 *
 *   current   the page itself — the gradient pill from the design
 *   section   an ancestor of the current page — a soft fill, so a group and
 *             the screen open inside it never both shout
 *   rest      the default, with a tinted icon tile
 *
 * `aria-current` marks only the first: a group is not the page you are on.
 *
 * A group with children expands when the current page is inside it, and
 * otherwise remembers what the user opened. The chevron sits outside the link
 * because a button may not be nested in an anchor, and is anchored to the
 * pill's end so the pill still spans the full row.
 */

type SidebarNavProps = {
  items: readonly NavigationItem[];
};

function rowClasses(current: boolean): string {
  return cn(
    "flex h-11 items-center gap-2.5 rounded-field ps-2 pe-2.5 text-sm transition-colors",
    "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
    current
      ? "bg-nav-active font-bold text-white shadow-nav-active"
      : "hover:bg-brand-tint focus-visible:bg-brand-tint",
  );
}

function tileClasses(current: boolean, section: boolean): string {
  return cn(
    "grid size-9 shrink-0 place-items-center rounded-tile",
    current ? "text-white" : "text-nav-icon",
    !current && (section ? "bg-brand-soft" : "bg-nav-tile"),
  );
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>(() =>
    items
      .filter((item) => item.children?.length && isActivePath(pathname, item.href))
      .map((item) => item.href),
  );

  function toggle(href: string) {
    setExpanded((current) =>
      current.includes(href)
        ? current.filter((value) => value !== href)
        : [...current, href],
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const current = pathname === item.href;
        const section = !current && isActivePath(pathname, item.href);
        const hasChildren = Boolean(item.children?.length);
        const isOpen = expanded.includes(item.href) || section;

        return (
          <li key={item.href}>
            <div className="relative">
              <Link
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  rowClasses(current),
                  hasChildren && "pe-11",
                  !current && (section ? "font-bold text-brand-text" : "text-ink"),
                )}
              >
                <span className={tileClasses(current, section)}>
                  <NavIcon name={item.icon} className="size-4" />
                </span>
                <span>{item.label}</span>
              </Link>

              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggle(item.href)}
                  aria-expanded={isOpen}
                  aria-label={`زیرمنوی ${item.label}`}
                  className={cn(
                    "absolute top-1/2 left-1 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-tile bg-[rgba(255,229,218,.3)] transition-colors",
                    "-rotate-90 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
                    current
                      ? "text-white/90 hover:text-white"
                      : "text-ink-muted hover:text-brand-text",
                  )}
                >
                  <ChevronLeft
                    className={cn("size-4 transition-transform", isOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
              ) : null}
            </div>

            {hasChildren && isOpen ? (
              <ul className="mt-1 flex flex-col gap-1 border-s border-line ps-2.5">
                {item.children?.map((child) => {
                  const childCurrent = pathname === child.href;

                  return (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        aria-current={childCurrent ? "page" : undefined}
                        className={cn(
                          "flex h-9 items-center gap-2.5 rounded-field px-2.5 text-sm transition-colors",
                          "focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none",
                          childCurrent
                            ? "bg-nav-active font-bold text-white shadow-nav-active"
                            : "text-ink-muted hover:bg-brand-tint hover:text-ink",
                        )}
                      >
                        <NavIcon name={child.icon} className="size-4 shrink-0" />
                        <span>{child.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
