export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { AnimateOnScroll } from "@/components/store/animate-on-scroll";
import { Button } from "@mantine/core";
import { ArrowRight, Truck, Shield, Clock, Leaf } from "lucide-react";

async function getFeaturedProducts() {
  return db.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

async function getCategories() {
  return db.category.findMany({
    where: { parentId: null },
    take: 6,
    orderBy: { name: "asc" },
  });
}

async function getOnSaleProducts() {
  return db.product.findMany({
    where: { isActive: true, compareAtPrice: { not: null } },
    include: { category: true },
    take: 4,
    orderBy: { createdAt: "desc" },
  });
}

export default async function HomePage() {
  const [featured, categories, onSale] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getOnSaleProducts(),
  ]);

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold md:text-5xl lg:text-6xl">
              Fresh Groceries,
              <br />
              Delivered to You
            </h1>
            <p className="mt-4 text-lg text-green-100 md:text-xl">
              Shop quality fruits, vegetables, dairy, meat, and pantry essentials.
              Free delivery on orders over $75.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/category/fruits-vegetables">
                <Button size="lg" color="white" variant="filled" c="green.7" rightSection={<ArrowRight size={16} />}>
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3">
              <Truck className="text-primary" size={24} />
              <div>
                <p className="text-sm font-medium">Free Delivery</p>
                <p className="text-xs text-muted-foreground">On orders over $75</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Leaf className="text-primary" size={24} />
              <div>
                <p className="text-sm font-medium">Fresh Quality</p>
                <p className="text-xs text-muted-foreground">Farm to your door</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-primary" size={24} />
              <div>
                <p className="text-sm font-medium">Same Day</p>
                <p className="text-xs text-muted-foreground">Order before 2pm</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-primary" size={24} />
              <div>
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% secure checkout</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <AnimateOnScroll>
          <section className="mx-auto max-w-7xl px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Shop by Category</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.map((cat, index) => (
                <div key={cat.id} className="transition-all duration-500 ease-out" style={{ transitionDelay: `${index * 75}ms` }}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="group flex flex-col items-center gap-3 rounded-lg border p-6 text-center transition-colors hover:border-primary hover:bg-green-50"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
                      {cat.image || "🛒"}
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary">{cat.name}</span>
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </AnimateOnScroll>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <AnimateOnScroll>
          <section className="mx-auto max-w-7xl px-4 py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Featured Products</h2>
              <Link href="/search" className="text-sm text-primary hover:underline">
                View All <ArrowRight className="inline" size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {featured.map((product, index) => (
                <div key={product.id} className="transition-all duration-500 ease-out" style={{ transitionDelay: `${index * 75}ms` }}>
                  <ProductCard
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
                </div>
              ))}
            </div>
          </section>
        </AnimateOnScroll>
      )}

      {/* On Sale */}
      {onSale.length > 0 && (
        <AnimateOnScroll>
          <section className="bg-red-50">
            <div className="mx-auto max-w-7xl px-4 py-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-red-700">On Sale</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {onSale.map((product, index) => (
                  <div key={product.id} className="transition-all duration-500 ease-out" style={{ transitionDelay: `${index * 75}ms` }}>
                    <ProductCard
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
                  </div>
                ))}
              </div>
            </div>
          </section>
        </AnimateOnScroll>
      )}

      {/* CTA */}
      <AnimateOnScroll>
        <section className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold">Ready to Shop?</h2>
          <p className="mt-2 text-muted-foreground">
            Browse our full range of fresh groceries and get them delivered today.
          </p>
          <Link href="/category/fruits-vegetables" className="mt-6 inline-block">
            <Button size="lg" color="green" rightSection={<ArrowRight size={16} />}>
              Start Shopping
            </Button>
          </Link>
        </section>
      </AnimateOnScroll>
    </div>
  );
}
