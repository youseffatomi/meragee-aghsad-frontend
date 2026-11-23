import { PageTitle } from "@/components/layout/page-title";
import { Pagination } from "@/components/ui/pagination";
import { routes } from "@/config/routes";
import { getProducts } from "@/features/products/api";
import { ProductsGrid } from "@/features/products/components/products-grid";
import { ProductsSearchForm } from "@/features/products/components/products-search-form";
import { requirePermission } from "@/lib/auth/require-permission";
import { toPersianDigits } from "@/lib/format/number";

export const metadata = { title: "محصولات" };

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function positivePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  await requirePermission("product:read");

  const params = await searchParams;
  const search = single(params.search).trim();
  const page = positivePage(single(params.page));

  const products = await getProducts({
    search: search || undefined,
    page,
  });

  const hrefForPage = (nextPage: number) => {
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (nextPage > 1) query.set("page", String(nextPage));
    const suffix = query.toString();
    return suffix ? `${routes.products.list}?${suffix}` : routes.products.list;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle title="محصولات" />

        <p className="text-xs text-ink-muted">
          {toPersianDigits(products.meta.totalDocs)} محصول
        </p>
      </div>

      <section className="rounded-card border border-line bg-surface p-4 shadow-card sm:p-5">
        <ProductsSearchForm key={search} search={search} />

        <div className="mt-5">
          <ProductsGrid products={products.result} />
        </div>

        <Pagination meta={products.meta} hrefFor={hrefForPage} className="mt-5" />
      </section>
    </div>
  );
}
