export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/store/product-card";
import { AddToCartButton } from "./add-to-cart";
import { ProductImages } from "./product-images";
import { Badge } from "@mantine/core";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return {};
  return {
    title: `${product.name} - FreshMart`,
    description: product.description || `Buy ${product.name} online at FreshMart.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.isActive) notFound();

  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: { category: true },
    take: 4,
  });

  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 text-sm text-muted-foreground">
        <a href="/" className="hover:text-primary">Home</a>
        {" / "}
        <a href={`/category/${product.category.slug}`} className="hover:text-primary">{product.category.name}</a>
        {" / "}
        <span>{product.name}</span>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImages images={product.images} name={product.name} />

        <div>
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            {isOnSale && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice!)}
                </span>
                <Badge color="red">
                  Save {formatPrice(product.compareAtPrice! - product.price)}
                </Badge>
              </>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">per {product.unit}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            GST included ({formatPrice(product.price / 11)} GST)
          </p>

          <div className="mt-4">
            {product.stock > 0 ? (
              <Badge variant="outline" color="green">
                In Stock ({product.stock} available)
              </Badge>
            ) : (
              <Badge color="red">Out of Stock</Badge>
            )}
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <AddToCartButton
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.images[0] || ""}
            unit={product.unit}
            slug={product.slug}
            stock={product.stock}
          />
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                price={p.price}
                compareAtPrice={p.compareAtPrice}
                images={p.images}
                stock={p.stock}
                unit={p.unit}
                category={p.category.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
