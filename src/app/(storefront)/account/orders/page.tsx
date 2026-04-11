export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge, Title, Text, Group, Stack, Paper } from "@mantine/core";
import Link from "next/link";
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { MapPin } from "lucide-react";

export default async function OrdersPage() {
  const session = await auth();
  const orders = await db.order.findMany({ where: { userId: session!.user.id }, include: { items: true }, orderBy: { createdAt: "desc" } });

  return (
    <div>
      <Title order={2} mb="lg">Order History</Title>
      {orders.length === 0 ? (
        <Stack align="center" py="xl">
          <Text c="dimmed">No orders yet.</Text>
          <Link href="/" style={{ color: "#800000" }}>Start shopping</Link>
        </Stack>
      ) : (
        <Stack gap="sm">
          {orders.map((order) => {
            const address = order.deliveryAddress as { street: string; suburb: string; state: string; postcode: string } | null;
            return (
              <Link key={order.id} href={`/account/orders/${order.id}`} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <Paper p="md" radius="lg" withBorder className="transition-shadow hover:shadow-sm">
                <Group justify="space-between" wrap="wrap">
                  <Group gap="sm">
                    <Text fw={600} ff="monospace">{order.orderNumber}</Text>
                    <Text size="sm" c="dimmed">{new Date(order.createdAt).toLocaleDateString("en-AU")}</Text>
                  </Group>
                  <Group gap="xs">
                    <Badge color={ORDER_STATUS_COLORS[order.status] || "gray"}>{order.status.replace(/_/g, " ")}</Badge>
                    <Badge color={PAYMENT_STATUS_COLORS[order.paymentStatus] || "gray"}>{order.paymentStatus}</Badge>
                  </Group>
                </Group>
                <Group gap="md" mt="xs">
                  {order.customerPhone && <Text size="sm" c="dimmed">{order.customerPhone}</Text>}
                  {address && <Group gap={4}><MapPin size={12} /><Text size="sm" c="dimmed">{address.suburb} {address.state} {address.postcode}</Text></Group>}
                </Group>
                <Group justify="space-between" mt="xs">
                  <Text size="sm" c="dimmed">{order.items.length} items</Text>
                  <Text fw={700}>{formatPrice(order.total)}</Text>
                </Group>
              </Paper>
              </Link>
            );
          })}
        </Stack>
      )}
    </div>
  );
}
