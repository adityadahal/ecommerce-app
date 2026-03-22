import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Card, Text, Title } from "@mantine/core";
import { ShoppingBag, DollarSign, Package, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOrders, todayOrders, totalRevenue, todayRevenue, totalProducts, pendingDeliveries] =
    await Promise.all([
      db.order.count(),
      db.order.count({ where: { createdAt: { gte: today } } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
      db.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID", createdAt: { gte: today } } }),
      db.product.count({ where: { isActive: true } }),
      db.order.count({ where: { status: { in: ["PROCESSING", "OUT_FOR_DELIVERY"] } } }),
    ]);

  return {
    totalOrders,
    todayOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    todayRevenue: todayRevenue._sum.total || 0,
    totalProducts,
    pendingDeliveries,
  };
}

async function getRecentOrders() {
  return db.order.findMany({
    include: { user: { select: { name: true, email: true } }, items: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

async function getLowStockProducts() {
  return db.product.findMany({
    where: { isActive: true, stock: { lte: 5 } },
    orderBy: { stock: "asc" },
    take: 10,
  });
}

export default async function DashboardPage() {
  const [stats, recentOrders, lowStock] = await Promise.all([
    getStats(),
    getRecentOrders(),
    getLowStockProducts(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <div className="flex flex-row items-center justify-between pb-2">
            <Text size="sm" fw={500}>Today&apos;s Orders</Text>
            <ShoppingBag className="text-gray-400" size={20} />
          </div>
          <div>
            <Text size="xl" fw={700}>{stats.todayOrders}</Text>
            <Text size="xs" c="dimmed">{stats.totalOrders} total orders</Text>
          </div>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <div className="flex flex-row items-center justify-between pb-2">
            <Text size="sm" fw={500}>Today&apos;s Revenue</Text>
            <DollarSign className="text-gray-400" size={20} />
          </div>
          <div>
            <Text size="xl" fw={700}>{formatPrice(stats.todayRevenue)}</Text>
            <Text size="xs" c="dimmed">{formatPrice(stats.totalRevenue)} total</Text>
          </div>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <div className="flex flex-row items-center justify-between pb-2">
            <Text size="sm" fw={500}>Active Products</Text>
            <Package className="text-gray-400" size={20} />
          </div>
          <div>
            <Text size="xl" fw={700}>{stats.totalProducts}</Text>
            <Text size="xs" c="dimmed">{lowStock.length} low stock</Text>
          </div>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <div className="flex flex-row items-center justify-between pb-2">
            <Text size="sm" fw={500}>Pending Deliveries</Text>
            <Truck className="text-gray-400" size={20} />
          </div>
          <div>
            <Text size="xl" fw={700}>{stats.pendingDeliveries}</Text>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">Recent Orders</Title>
          {recentOrders.length === 0 ? (
            <Text size="sm" c="dimmed">No orders yet</Text>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-mono">{order.orderNumber}</span>
                    <span className="text-gray-500 ml-2">{order.customerName || order.user?.name || order.user?.email || order.customerEmail || "Guest"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      order.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                      order.status === "PROCESSING" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.status.replace(/_/g, " ")}
                    </span>
                    <span className="font-medium">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4} mb="md">Low Stock Alerts</Title>
          {lowStock.length === 0 ? (
            <Text size="sm" c="dimmed">All products well stocked</Text>
          ) : (
            <div className="space-y-3">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span>{product.name}</span>
                  <span className={`font-medium ${product.stock === 0 ? "text-red-600" : "text-yellow-600"}`}>
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
