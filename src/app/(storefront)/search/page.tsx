export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { Container, Title, Text, SimpleGrid, Button, Group } from "@mantine/core";

type Props = { searchParams: Promise<{ q?: string; sort?: string; page?: string }> };

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
  switch (sp.sort) { case "price-asc": orderBy.price = "asc"; break; case "price-desc": orderBy.price = "desc"; break; default: orderBy.createdAt = "desc"; }

  const where = query ? { isActive: true, OR: [{ name: { contains: query, mode: "insensitive" as const } }, { description: { contains: query, mode: "insensitive" as const } }] } : { isActive: true };
  const [products, total] = await Promise.all([
    db.product.findMany({ where, include: { category: true }, orderBy, skip: (page - 1) * perPage, take: perPage }),
    db.product.count({ where }),
  ]);
  const totalPages = Math.ceil(total / perPage);

  return (
    <Container size={1280} py="xl">
      <Title order={1}>{query ? `Results for "${query}"` : "All Products"}</Title>
      <Text c="dimmed" mt={4}>{total} product{total !== 1 ? "s" : ""} found</Text>

      {products.length === 0 ? (
        <Text c="dimmed" size="lg" ta="center" py={60}>No products found{query ? ` for "${query}"` : ""}. Try a different search.</Text>
      ) : (
        <SimpleGrid cols={{ base: 2, md: 3, lg: 4 }} spacing="md" mt="lg">
          {products.map((product) => (
            <ProductCard key={product.id} id={product.id} name={product.name} slug={product.slug} price={product.price} compareAtPrice={product.compareAtPrice} images={product.images} stock={product.stock} unit={product.unit} category={product.category.name} />
          ))}
        </SimpleGrid>
      )}

      {totalPages > 1 && (
        <Group justify="center" mt="xl" gap="xs">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link key={i + 1} href={`?q=${encodeURIComponent(query)}&page=${i + 1}&sort=${sp.sort || ""}`}>
              <Button variant={page === i + 1 ? "filled" : "default"} color={page === i + 1 ? "green" : "gray"} size="sm">
                {i + 1}
              </Button>
            </Link>
          ))}
        </Group>
      )}
    </Container>
  );
}
