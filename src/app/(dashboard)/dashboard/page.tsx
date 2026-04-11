import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { Card, Text, Title, Group, SimpleGrid, ThemeIcon, Badge, Stack, Button } from "@mantine/core";
import { ShoppingBag, DollarSign, Package, Truck, ArrowRight, RotateCcw } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const notCancelled = { status: { not: "CANCELLED" as const } };
  const [totalOrders, todayOrders, totalRevenue, todayRevenue, totalProducts, pendingDeliveries, totalRefunded, todayRefunded, pendingRefunds] = await Promise.all([
    db.order.count({ where: notCancelled }),
    db.order.count({ where: { ...notCancelled, createdAt: { gte: today } } }),
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", ...notCancelled } }),
    db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", ...notCancelled, createdAt: { gte: today } } }),
    db.product.count({ where: { isActive: true } }),
    db.order.count({ where: { status: { in: ["PROCESSING", "OUT_FOR_DELIVERY"] } } }),
    db.order.aggregate({ _sum: { refundAmount: true }, _count: true, where: { refundStatus: "REFUNDED" } }),
    db.order.aggregate({ _sum: { refundAmount: true }, _count: true, where: { refundStatus: "REFUNDED", refundedAt: { gte: today } } }),
    db.order.count({ where: { refundStatus: "PENDING" } }),
  ]);
  return {
    totalOrders, todayOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    todayRevenue: todayRevenue._sum.total || 0,
    totalProducts, pendingDeliveries,
    totalRefunded: totalRefunded._sum.refundAmount || 0,
    refundedCount: totalRefunded._count,
    todayRefunded: todayRefunded._sum.refundAmount || 0,
    todayRefundedCount: todayRefunded._count,
    pendingRefunds,
  };
}

async function getRecentOrders() {
  return db.order.findMany({ include: { user: { select: { name: true, email: true } }, items: true }, orderBy: { createdAt: "desc" }, take: 10 });
}

async function getLowStockProducts() {
  return db.product.findMany({ where: { isActive: true, stock: { lte: 5 } }, orderBy: { stock: "asc" }, take: 10 });
}

const statCards = [
  { key: "orders", label: "Today's Orders", icon: ShoppingBag, color: "maroon" },
  { key: "revenue", label: "Today's Revenue", icon: DollarSign, color: "blue" },
  { key: "refunds", label: "Total Refunded", icon: RotateCcw, color: "red" },
  { key: "products", label: "Active Products", icon: Package, color: "yellow" },
  { key: "deliveries", label: "Pending Deliveries", icon: Truck, color: "violet" },
] as const;

export default async function DashboardPage() {
  const [stats, recentOrders, lowStock] = await Promise.all([getStats(), getRecentOrders(), getLowStockProducts()]);

  const netRevenue = stats.totalRevenue - stats.totalRefunded;
  const statValues = {
    orders: { value: stats.todayOrders, sub: `${stats.totalOrders} total orders` },
    revenue: { value: formatPrice(stats.todayRevenue), sub: `${formatPrice(netRevenue)} net revenue` },
    refunds: { value: formatPrice(stats.totalRefunded), sub: `${stats.todayRefunded > 0 ? `${formatPrice(stats.todayRefunded)} today · ` : ""}${stats.refundedCount} orders${stats.pendingRefunds > 0 ? ` · ${stats.pendingRefunds} pending` : ""}` },
    products: { value: stats.totalProducts, sub: `${lowStock.length} low stock` },
    deliveries: { value: stats.pendingDeliveries, sub: undefined },
  };

  return (
    <Stack gap="lg">
      <Title order={2}>Overview</Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="md">
        {statCards.map((card) => {
          const data = statValues[card.key];
          return (
            <Card key={card.key} shadow="sm" padding="lg" radius="lg" withBorder>
              <Group gap="md" wrap="nowrap">
                <ThemeIcon color={card.color} size="xl" radius="md" variant="light">
                  <card.icon size={22} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" fw={500} tt="uppercase">{card.label}</Text>
                  <Text size="xl" fw={700}>{data.value}</Text>
                  {data.sub && <Text size="xs" c="dimmed">{data.sub}</Text>}
                </div>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
        <Card shadow="sm" padding="lg" radius="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Recent Orders</Title>
            <Link href="/dashboard/orders">
              <Button variant="subtle" color="maroon" size="xs" rightSection={<ArrowRight size={14} />}>View All</Button>
            </Link>
          </Group>
          {recentOrders.length === 0 ? <Text size="sm" c="dimmed">No orders yet</Text> : (
            <Stack gap="xs">
              {recentOrders.map((order) => (
                <Group key={order.id} justify="space-between" py={4}>
                  <Group gap="sm">
                    <Text ff="monospace" size="sm">{order.orderNumber}</Text>
                    <Text size="sm" c="dimmed">{order.customerName || order.user?.name || order.user?.email || order.customerEmail || "Guest"}</Text>
                  </Group>
                  <Group gap="xs">
                    <Badge color={order.status === "DELIVERED" ? "green" : order.status === "PROCESSING" ? "blue" : order.status === "CANCELLED" ? "red" : "yellow"} size="sm">
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                    <Text size="sm" fw={600}>{formatPrice(order.total)}</Text>
                  </Group>
                </Group>
              ))}
            </Stack>
          )}
        </Card>

        <Card shadow="sm" padding="lg" radius="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Title order={4}>Low Stock Alerts</Title>
            <Link href="/dashboard/products">
              <Button variant="subtle" color="maroon" size="xs" rightSection={<ArrowRight size={14} />}>View All</Button>
            </Link>
          </Group>
          {lowStock.length === 0 ? <Text size="sm" c="dimmed">All products well stocked</Text> : (
            <Stack gap="xs">
              {lowStock.map((product) => (
                <Group key={product.id} justify="space-between" py={4}>
                  <Text size="sm">{product.name}</Text>
                  <Badge color={product.stock === 0 ? "red" : "yellow"} size="sm">{product.stock} left</Badge>
                </Group>
              ))}
            </Stack>
          )}
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
