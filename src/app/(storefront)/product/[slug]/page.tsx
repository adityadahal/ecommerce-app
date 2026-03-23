export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductCard } from "@/components/store/product-card";
import { AddToCartButton } from "./add-to-cart";
import { ProductImages } from "./product-images";
import { Badge, Container, Title, Text, Group, Grid, Breadcrumbs, Anchor, Paper, SimpleGrid } from "@mantine/core";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return {};
  return { title: `${product.name} - FreshMart`, description: product.description || `Buy ${product.name} online.`, openGraph: { title: product.name, description: product.description || undefined, images: product.images[0] ? [product.images[0]] : undefined } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug }, include: { category: true } });
  if (!product || !product.isActive) notFound();

  const relatedProducts = await db.product.findMany({ where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true }, include: { category: true }, take: 4 });
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;

  return (
    <Container size={1280} py="xl">
      <Breadcrumbs mb="lg">
        <Link href="/"><Anchor size="sm">Home</Anchor></Link>
        <Link href={`/category/${product.category.slug}`}><Anchor size="sm">{product.category.name}</Anchor></Link>
        <Text size="sm">{product.name}</Text>
      </Breadcrumbs>

      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ProductImages images={product.images} name={product.name} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Text size="sm" fw={500} c="green">{product.category.name}</Text>
          <Title order={1} mt={4}>{product.name}</Title>

          <Group gap="sm" mt="md">
            <Text fz={32} fw={700} c="green.7">{formatPrice(product.price)}</Text>
            {isOnSale && (
              <>
                <Text size="lg" c="dimmed" td="line-through">{formatPrice(product.compareAtPrice!)}</Text>
                <Badge color="red" size="lg">Save {formatPrice(product.compareAtPrice! - product.price)}</Badge>
              </>
            )}
          </Group>

          <Text size="sm" c="dimmed" mt={4}>per {product.unit}</Text>
          <Text size="sm" c="dimmed">GST included ({formatPrice(product.price / 11)} GST)</Text>

          <Group mt="md">
            {product.stock > 0 ? (
              <Badge variant="light" color="green" size="lg">In Stock ({product.stock} available)</Badge>
            ) : (
              <Badge color="red" size="lg">Out of Stock</Badge>
            )}
          </Group>

          {product.description && (
            <Paper p="md" radius="md" bg="gray.0" mt="lg">
              <Text fw={600} mb="xs">Description</Text>
              <Text c="dimmed">{product.description}</Text>
            </Paper>
          )}

          <AddToCartButton id={product.id} name={product.name} price={product.price} image={product.images[0] || ""} unit={product.unit} slug={product.slug} stock={product.stock} />
        </Grid.Col>
      </Grid>

      {relatedProducts.length > 0 && (
        <>
          <Title order={2} mt={60} mb="lg">Related Products</Title>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} id={p.id} name={p.name} slug={p.slug} price={p.price} compareAtPrice={p.compareAtPrice} images={p.images} stock={p.stock} unit={p.unit} category={p.category.name} />
            ))}
          </SimpleGrid>
        </>
      )}
    </Container>
  );
}
