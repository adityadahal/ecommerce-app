"use client";

import Link from "next/link";
import Image from "next/image";
import { Container, Button, Title, Text, Group, Stack, Paper, Grid, Skeleton, ThemeIcon } from "@mantine/core";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useLocalCart } from "@/hooks/use-cart";
import { formatPrice, calculateGST } from "@/lib/utils";
import { OrderSummary } from "@/components/store/order-summary";
import { FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_FEE } from "@/lib/constants";
import { ActionIcon } from "@mantine/core";

export default function CartPage() {
  const { items, isLoaded, updateQuantity, removeItem, subtotal } = useLocalCart();
  const gst = calculateGST(subtotal);
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  if (!isLoaded) {
    return (
      <Container size={900} py="xl">
        <Title order={1}>Shopping Cart</Title>
        <Stack mt="lg" gap="md">
          {[1, 2, 3].map((i) => <Skeleton key={i} height={96} radius="lg" />)}
        </Stack>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container size={900} py={60} ta="center">
        <ThemeIcon color="gray" size={80} radius="xl" variant="light" mx="auto" className="float-animation">
          <ShoppingCart size={36} />
        </ThemeIcon>
        <Title order={2} mt="lg">Your cart is empty</Title>
        <Text c="dimmed" mt="xs">Add some items to get started</Text>
        <Button component={Link} href="/" color="green" size="md" mt="lg" rightSection={<ArrowRight size={16} />}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container size={900} py="xl">
      <Title order={1}>Shopping Cart</Title>
      <Text c="dimmed" mt={4}>{items.length} item{items.length > 1 ? "s" : ""} in your cart</Text>

      <Grid mt="lg" gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="sm">
            {items.map((item) => (
              <Paper key={item.productId} p="md" radius="lg" withBorder>
                <Group wrap="nowrap" gap="md">
                  <Link href={`/product/${item.slug}`} className="relative shrink-0 overflow-hidden" style={{ width: 80, height: 80, borderRadius: "var(--mantine-radius-md)", background: "var(--mantine-color-gray-1)" }}>
                    <Image src={item.image || "/placeholder-product.svg"} alt={item.name} fill className="object-cover" sizes="80px" />
                  </Link>
                  <Stack gap={2} style={{ flex: 1 }}>
                    <Text fw={600} component={Link} href={`/product/${item.slug}`} className="hover:underline">{item.name}</Text>
                    <Text size="sm" c="dimmed">{item.unit}</Text>
                    <Text fw={700} c="green.7">{formatPrice(item.price)}</Text>
                  </Stack>
                  <Stack align="flex-end" gap="xs">
                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeItem(item.productId)}>
                      <Trash2 size={16} />
                    </ActionIcon>
                    <Group gap={0} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: "var(--mantine-radius-md)", background: "var(--mantine-color-gray-0)" }}>
                      <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                        <Minus size={14} />
                      </ActionIcon>
                      <Text key={item.quantity} size="sm" fw={600} px="sm" className="qty-value">{item.quantity}</Text>
                      <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}>
                        <Plus size={14} />
                      </ActionIcon>
                    </Group>
                    <Text size="sm" fw={600}>{formatPrice(item.price * item.quantity)}</Text>
                  </Stack>
                </Group>
              </Paper>
            ))}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper p="lg" radius="lg" withBorder shadow="sm" pos={{ lg: "sticky" }} top={{ lg: 80 }}>
            <Title order={3} mb="md">Order Summary</Title>
            <OrderSummary subtotal={subtotal} gst={gst} deliveryFee={deliveryFee} total={total} showFreeDeliveryHint />
            <Button component={Link} href="/checkout" color="green" fullWidth size="lg" mt="lg" rightSection={<ArrowRight size={16} />}>
              Checkout
            </Button>
            <Text component={Link} href="/" size="sm" c="dimmed" ta="center" display="block" mt="sm" className="hover:underline">
              Continue Shopping
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
