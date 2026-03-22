export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";

type Props = {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props) {
  const sp = await searchParams;
  return { title: sp.q ? `Search: ${sp.q} - FreshMart` : "Search - FreshMart" };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const query = sp.q || "";
  const page = parseInt(sp.page || "1");
  const perPage = 12;

  const orderBy: Record<string, string> = {};
  switch (sp.sort) {
    case "price-asc": orderBy.price = "asc"; break;
    case "price-desc": orderBy.price = "desc"; break;
    default: orderBy.createdAt = "desc";
  }

  const where = query
    ? {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" as const } },
          { description: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : { isActive: true };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-bold">
        {query ? `Results for "${query}"` : "All Products"}
      </h1>
      <p className="text-muted-foreground mt-1">{total} products found</p>

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No products found{query ? ` for "${query}"` : ""}. Try a different search.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              images={product.images}
              stock={product.stock}
              unit={product.unit}
              category={product.category.name}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i + 1}
              href={`?q=${encodeURIComponent(query)}&page=${i + 1}&sort=${sp.sort || ""}`}
              className={`rounded-md px-4 py-2 text-sm ${
                page === i + 1 ? "bg-primary text-white" : "border hover:bg-accent"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
