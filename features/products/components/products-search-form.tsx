"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { routes } from "@/config/routes";

type ProductsSearchFormProps = {
  search: string;
};

/**
 * Search bar for the product grid.
 *
 * The URL is the source of truth: submitting navigates and the App Router
 * refetches on the server, so a shared link reproduces the same result set.
 */
export function ProductsSearchForm({ search }: ProductsSearchFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(search);
  const [pending, startTransition] = useTransition();

  function navigate(nextSearch: string) {
    const trimmed = nextSearch.trim();
    const query = trimmed ? `?${new URLSearchParams({ search: trimmed })}` : "";

    startTransition(() => {
      router.push(`${routes.products.list}${query}`, { scroll: false });
    });
  }

  return (
    <form
      action={routes.products.list}
      method="get"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(value);
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
          placeholder="جستجو با نام محصول یا بخشی از IMEI"
          aria-label="جستجوی محصول"
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

        {search ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              navigate("");
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
