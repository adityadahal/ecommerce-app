export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@mantine/core";
import Link from "next/link";
import { ORDER_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { MapPin } from "lucide-react";

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
          {orders.map((order) => {
            const address = order.deliveryAddress as { street: string; suburb: string; state: string; postcode: string } | null;
            return (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-semibold">{order.orderNumber}</span>
                    <span className="text-sm text-gray-500 ml-3">
                      {new Date(order.createdAt).toLocaleDateString("en-AU")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color={ORDER_STATUS_COLORS[order.status] || "gray"}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                    <Badge color={PAYMENT_STATUS_COLORS[order.paymentStatus] || "gray"}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Customer info & address */}
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                  {order.customerPhone && (
                    <span>{order.customerPhone}</span>
                  )}
                  {address && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={12} />
                      {address.suburb} {address.state} {address.postcode}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-500">{order.items.length} items</span>
                  <span className="font-bold">{formatPrice(order.total)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
