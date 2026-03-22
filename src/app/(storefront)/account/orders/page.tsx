export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@mantine/core";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "yellow",
  PROCESSING: "blue",
  OUT_FOR_DELIVERY: "violet",
  DELIVERED: "green",
  CANCELLED: "red",
};

const paymentBadgeColor = (status: string) => (status === "PAID" ? "green" : "gray");

export default async function OrdersPage() {
  const session = await auth();

  const orders = await db.order.findMany({
    where: { userId: session!.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No orders yet.</p>
          <Link href="/" className="text-primary hover:underline mt-2 block">Start shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="block rounded-lg border p-4 hover:bg-accent/50 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono font-semibold">{order.orderNumber}</span>
                  <span className="text-sm text-gray-500 ml-3">
                    {new Date(order.createdAt).toLocaleDateString("en-AU")}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={statusColors[order.status] || "gray"}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                  <Badge color={paymentBadgeColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">{order.items.length} items</span>
                <span className="font-bold">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
