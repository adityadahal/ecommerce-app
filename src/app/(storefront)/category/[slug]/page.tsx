export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { CategoryFilters } from "./filters";
import { Container, Title, Text, SimpleGrid, Group, Badge, Button } from "@mantine/core";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string; inStock?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return {};
  return { title: `${category.name} - FreshMart`, description: `Shop fresh ${category.name.toLowerCase()} online at FreshMart.` };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const category = await db.category.findUnique({ where: { slug }, include: { children: true } });
  if (!category) notFound();

  const categoryIds = [category.id, ...category.children.map((c) => c.id)];
  const where: Record<string, unknown> = { categoryId: { in: categoryIds }, isActive: true };
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
    db.product.findMany({ where, include: { category: true }, orderBy, skip: (page - 1) * perPage, take: perPage }),
    db.product.count({ where }),
  ]);
  const totalPages = Math.ceil(total / perPage);

  return (
    <Container size={1280} py="xl">
      <Group gap={8} mb="sm">
        <Link href="/" style={{ textDecoration: "none", color: "var(--mantine-color-green-6)" }}><Text size="sm">Home</Text></Link>
        <Text size="sm" c="dimmed">/</Text>
        <Text size="sm" c="dimmed">{category.name}</Text>
      </Group>
      <Title order={1}>{category.name}</Title>
      <Text c="dimmed" mt={4}>{total} product{total !== 1 ? "s" : ""}</Text>

      {category.children.length > 0 && (
        <Group gap="xs" mt="md">
          {category.children.map((sub) => (
            <Link key={sub.id} href={`/category/${sub.slug}`} style={{ textDecoration: "none" }}>
              <Badge variant="outline" color="green" size="lg" style={{ cursor: "pointer" }}>
                {sub.name}
              </Badge>
            </Link>
          ))}
        </Group>
      )}

      <CategoryFilters />

      {products.length === 0 ? (
        <Text c="dimmed" size="lg" ta="center" py={60}>No products found in this category.</Text>
      ) : (
        <SimpleGrid cols={{ base: 2, md: 3, lg: 4 }} spacing="md">
          {products.map((product) => (
            <ProductCard key={product.id} id={product.id} name={product.name} slug={product.slug} price={product.price} compareAtPrice={product.compareAtPrice} images={product.images} stock={product.stock} unit={product.unit} category={product.category.name} />
          ))}
        </SimpleGrid>
      )}

      {totalPages > 1 && (
        <Group justify="center" mt="xl" gap="xs">
          {Array.from({ length: totalPages }, (_, i) => (
            <Link key={i + 1} href={`?page=${i + 1}&sort=${sp.sort || ""}&minPrice=${sp.minPrice || ""}&maxPrice=${sp.maxPrice || ""}&inStock=${sp.inStock || ""}`}>
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
