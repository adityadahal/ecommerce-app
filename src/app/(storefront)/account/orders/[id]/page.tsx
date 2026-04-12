import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge, Title, Text, Group, Paper, Grid, Stack } from "@mantine/core";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { OrderSummary } from "@/components/store/order-summary";
import { AddressDisplay } from "@/components/store/address-display";

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const order = await db.order.findFirst({ where: { id, userId: session!.user.id }, include: { items: true } });
  if (!order) notFound();
  const address = order.deliveryAddress as { street: string; suburb: string; state?: string; postcode: string };

  return (
    <div>
      <Link href="/account/orders" style={{ textDecoration: "none", color: "var(--mantine-color-dimmed)" }}>
        <Text size="sm" mb="md" display="inline-flex" style={{ alignItems: "center", gap: 4 }}>
          <ArrowLeft size={14} /> Back to Orders
        </Text>
      </Link>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Order {order.orderNumber}</Title>
        <Badge color={ORDER_STATUS_COLORS[order.status] || "gray"} size="lg">{order.status.replace(/_/g, " ")}</Badge>
      </Group>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="lg" radius="lg" withBorder>
            <Text fw={600} mb="md">Items</Text>
            <Stack gap="xs">
              {order.items.map((item) => (
                <Group key={item.id} justify="space-between">
                  <Text size="sm" c="dimmed">{item.name} x {item.quantity}</Text>
                  <Text size="sm" fw={500}>{formatPrice(item.price * item.quantity)}</Text>
                </Group>
              ))}
            </Stack>
            <OrderSummary subtotal={order.subtotal} gst={order.gst} deliveryFee={order.deliveryFee} total={order.total} />
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <Paper p="lg" radius="lg" withBorder>
              <Text fw={600} mb="xs">Delivery Address</Text>
              <AddressDisplay address={address} multiline />
              {order.deliverySlot && (<><Text fw={500} mt="md" mb={4}>Delivery Slot</Text><Text size="sm" c="dimmed">{order.deliverySlot}</Text></>)}
            </Paper>
            <Paper p="lg" radius="lg" withBorder>
              <Text fw={600} mb="xs">Payment</Text>
              <Badge color={PAYMENT_STATUS_COLORS[order.paymentStatus] || "gray"} size="lg">{order.paymentStatus}</Badge>
              {order.cardBrand && order.cardLast4 && (
                <Group gap="xs" mt="sm">
                  <CreditCard size={16} className="text-gray-400" />
                  <Text size="sm" c="dimmed" tt="capitalize">{order.cardBrand} ending in {order.cardLast4}</Text>
                </Group>
              )}
              <Text size="sm" c="dimmed" mt="sm">
                Ordered on {new Date(order.createdAt).toLocaleDateString("en-AU", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </Text>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </div>
  );
}
