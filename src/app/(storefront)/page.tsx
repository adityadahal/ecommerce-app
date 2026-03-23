export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/store/product-card";
import { AnimateOnScroll } from "@/components/store/animate-on-scroll";
import { Container, SimpleGrid, Title, Text, Button, Group, ThemeIcon, Card, Stack, Box } from "@mantine/core";
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
      <Box
        pos="relative"
        py={{ base: 60, md: 80 }}
        style={{ overflow: "hidden", background: "linear-gradient(135deg, #059669 0%, #047857 50%, #0f766e 100%)" }}
      >
        <Box pos="absolute" top={0} right={0} w={500} h={500} style={{ borderRadius: "50%", background: "rgba(255,255,255,0.05)", transform: "translate(25%,-25%)" }} />
        <Box pos="absolute" bottom={0} left={0} w={320} h={320} style={{ borderRadius: "50%", background: "rgba(255,255,255,0.05)", transform: "translate(-25%,33%)" }} />

        <Container size={1280} pos="relative">
          <Box maw={600}>
            <Text size="sm" fw={500} c="white" mb="lg" px="md" py={6} display="inline-block" style={{ borderRadius: "var(--mantine-radius-xl)", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              Free delivery on orders over $75
            </Text>
            <Title order={1} c="white" fz={{ base: 36, md: 48, lg: 56 }} lh={1.1}>
              Fresh Groceries,<br />
              <Text span c="green.2" inherit>Delivered to You</Text>
            </Title>
            <Text size="lg" c="green.1" mt="lg" maw={480} style={{ opacity: 0.8 }}>
              Shop quality fruits, vegetables, dairy, meat, and pantry essentials from local suppliers.
            </Text>
            <Group mt="xl" gap="md">
              <Link href="/category/fruits-vegetables">
                <Button size="lg" color="white" variant="filled" c="green.8" rightSection={<ArrowRight size={16} />}>
                  Shop Now
                </Button>
              </Link>
              <Link href="/track">
                <Button size="lg" variant="outline" color="white" style={{ borderColor: "rgba(255,255,255,0.3)" }}>
                  Track Order
                </Button>
              </Link>
            </Group>
          </Box>
        </Container>
      </Box>

      {/* Features */}
      <Box bg="white" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Container size={1280} py="lg">
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders over $75", color: "green" },
              { icon: Leaf, title: "Fresh Quality", desc: "Farm to your door", color: "teal" },
              { icon: Clock, title: "Same Day", desc: "Order before 2pm", color: "yellow" },
              { icon: Shield, title: "Secure Payment", desc: "100% secure checkout", color: "blue" },
            ].map((f) => (
              <Group key={f.title} gap="md" wrap="nowrap">
                <ThemeIcon color={f.color} size="xl" radius="md" variant="light">
                  <f.icon size={22} />
                </ThemeIcon>
                <div>
                  <Text size="sm" fw={600}>{f.title}</Text>
                  <Text size="xs" c="dimmed">{f.desc}</Text>
                </div>
              </Group>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Categories */}
      {categories.length > 0 && (
        <AnimateOnScroll>
          <Container size={1280} py="xl">
            <Title order={2} mb="lg">Shop by Category</Title>
            <SimpleGrid cols={{ base: 2, md: 3, lg: 6 }} spacing="md">
              {categories.map((cat, index) => (
                <div key={cat.id} style={{ transitionDelay: `${index * 75}ms` }} className="transition-all duration-500 ease-out">
                  <Link href={`/category/${cat.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <Card shadow="sm" padding="lg" radius="lg" className="transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                      <Stack align="center" gap="sm">
                        <ThemeIcon color="green" size={60} radius="xl" variant="light">
                          <Text fz={28}>{cat.image || "🛒"}</Text>
                        </ThemeIcon>
                        <Text fw={600} size="sm" ta="center">{cat.name}</Text>
                      </Stack>
                    </Card>
                  </Link>
                </div>
              ))}
            </SimpleGrid>
          </Container>
        </AnimateOnScroll>
      )}

      {/* Featured Products */}
      {featured.length > 0 && (
        <AnimateOnScroll>
          <Box bg="white" py="xl">
            <Container size={1280}>
              <Group justify="space-between" mb="lg">
                <Title order={2}>Featured Products</Title>
                <Link href="/search">
                  <Button variant="subtle" color="green" size="sm" rightSection={<ArrowRight size={14} />}>
                    View All
                  </Button>
                </Link>
              </Group>
              <SimpleGrid cols={{ base: 2, md: 3, lg: 4 }} spacing="md">
                {featured.map((product, index) => (
                  <div key={product.id} style={{ transitionDelay: `${index * 75}ms` }} className="transition-all duration-500 ease-out">
                    <ProductCard
                      id={product.id} name={product.name} slug={product.slug}
                      price={product.price} compareAtPrice={product.compareAtPrice}
                      images={product.images} stock={product.stock} unit={product.unit}
                      category={product.category.name}
                    />
                  </div>
                ))}
              </SimpleGrid>
            </Container>
          </Box>
        </AnimateOnScroll>
      )}

      {/* On Sale */}
      {onSale.length > 0 && (
        <AnimateOnScroll>
          <Box style={{ background: "linear-gradient(135deg, #fef2f2, #fff7ed)" }} py="xl">
            <Container size={1280}>
              <Stack gap={4} mb="lg">
                <Title order={2} c="red.7">On Sale</Title>
                <Text size="sm" c="red.5">Great deals on quality products</Text>
              </Stack>
              <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
                {onSale.map((product, index) => (
                  <div key={product.id} style={{ transitionDelay: `${index * 75}ms` }} className="transition-all duration-500 ease-out">
                    <ProductCard
                      id={product.id} name={product.name} slug={product.slug}
                      price={product.price} compareAtPrice={product.compareAtPrice}
                      images={product.images} stock={product.stock} unit={product.unit}
                      category={product.category.name}
                    />
                  </div>
                ))}
              </SimpleGrid>
            </Container>
          </Box>
        </AnimateOnScroll>
      )}

      {/* CTA */}
      <AnimateOnScroll>
        <Box py={60} ta="center" style={{ background: "linear-gradient(to right, #059669, #0f766e)" }}>
          <Container size={600}>
            <Title order={2} c="white">Ready to Shop?</Title>
            <Text c="green.1" mt="sm" style={{ opacity: 0.8 }}>
              Browse our full range of fresh groceries and get them delivered today.
            </Text>
            <Link href="/category/fruits-vegetables">
              <Button size="lg" color="white" variant="filled" c="green.8" mt="xl" rightSection={<ArrowRight size={16} />}>
                Start Shopping
              </Button>
            </Link>
          </Container>
        </Box>
      </AnimateOnScroll>
    </div>
  );
}
