"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";

/**
 * Search that updates the URL without reloading the document.
 *
 * The `action` and `method` are still there for the no-JavaScript case, but the
 * submit handler intercepts the normal navigation and lets the App Router
 * fetch the next page instead. `scroll: false` keeps the table where it was.
 */
export function UsersSearchForm({ search }: { search: string }) {
  const router = useRouter();
  const [value, setValue] = useState(search);
  const [pending, startTransition] = useTransition();

  function go(next: string) {
    const trimmed = next.trim();
    const query = trimmed ? `?search=${encodeURIComponent(trimmed)}` : "";

    startTransition(() => {
      router.push(`${routes.users.list}${query}`, { scroll: false });
    });
  }

  return (
    <form
      action={routes.users.list}
      method="get"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        go(value);
      }}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute inset-y-0 start-4 my-auto size-4 text-ink-muted"
          aria-hidden="true"
        />
        <Input
          type="search"
          name="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="جستجو با نام، نام خانوادگی، کد ملی یا شماره تماس"
          aria-label="جستجوی کاربر"
          className="ps-11"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          isLoading={pending}
          className="flex-1 sm:flex-none"
        >
          جستجو
        </Button>

        {search || value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              go("");
            }}
            className="inline-flex h-11 items-center gap-1.5 rounded-field border border-line bg-surface px-4 text-sm text-ink-muted transition-colors hover:bg-surface-sunken focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:outline-none"
          >
            <X className="size-4" aria-hidden="true" />
            پاک کردن
          </button>
        ) : null}
      </div>
    </form>
  );
}
