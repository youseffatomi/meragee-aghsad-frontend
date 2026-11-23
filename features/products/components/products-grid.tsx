import { PackageSearch } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/types/domain";
import { ProductCard } from "./product-card";

/** The product grid, or the shared empty state when the search finds nothing. */
export function ProductsGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="size-5" aria-hidden="true" />}
        title="محصولی پیدا نشد"
        description="عبارت جستجو را تغییر دهید یا آن را پاک کنید تا همهٔ محصولات نمایش داده شوند."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
