export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { CategoryFilters } from "./filters";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string; inStock?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: `${category.name} - FreshMart`,
    description: `Shop fresh ${category.name.toLowerCase()} online at FreshMart. Quality products delivered to your door.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await db.category.findUnique({
    where: { slug },
    include: { children: true },
  });

  if (!category) notFound();

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];

  const where: Record<string, unknown> = {
    categoryId: { in: categoryIds },
    isActive: true,
  };

  if (sp.inStock === "true") where.stock = { gt: 0 };
  if (sp.minPrice || sp.maxPrice) {
    where.price = {};
    if (sp.minPrice) (where.price as Record<string, number>).gte = parseFloat(sp.minPrice);
    if (sp.maxPrice) (where.price as Record<string, number>).lte = parseFloat(sp.maxPrice);
  }

  const orderBy: Record<string, string> = {};
  switch (sp.sort) {
    case "price-asc": orderBy.price = "asc"; break;
    case "price-desc": orderBy.price = "desc"; break;
    case "newest": orderBy.createdAt = "desc"; break;
    case "name": orderBy.name = "asc"; break;
    default: orderBy.createdAt = "desc";
  }

  const page = parseInt(sp.page || "1");
  const perPage = 12;

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground mt-1">{total} products</p>
      </div>

      {category.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {category.children.map((sub) => (
            <a
              key={sub.id}
              href={`/category/${sub.slug}`}
              className="rounded-full border px-4 py-1.5 text-sm hover:border-primary hover:text-primary"
            >
              {sub.name}
            </a>
          ))}
        </div>
      )}

      <CategoryFilters />

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
              href={`?page=${i + 1}&sort=${sp.sort || ""}&minPrice=${sp.minPrice || ""}&maxPrice=${sp.maxPrice || ""}&inStock=${sp.inStock || ""}`}
              className={`rounded-md px-4 py-2 text-sm ${
                page === i + 1
                  ? "bg-primary text-white"
                  : "border hover:bg-accent"
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
