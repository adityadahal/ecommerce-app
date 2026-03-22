import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@mantine/core";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  const order = await db.order.findFirst({
    where: { id, userId: session!.user.id },
    include: { items: true },
  });

  if (!order) notFound();

  const address = order.deliveryAddress as { street: string; suburb: string; state: string; postcode: string };

  const statusColor = (() => {
    switch (order.status) {
      case "DELIVERED": return "green";
      case "PROCESSING": return "blue";
      case "OUT_FOR_DELIVERY": return "violet";
      case "CANCELLED": return "red";
      case "PENDING": return "yellow";
      default: return "gray";
    }
  })();

  return (
    <div>
      <Link href="/account/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4">
        <ArrowLeft size={14} />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
        <Badge color={statusColor}>{order.status.replace(/_/g, " ")}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</span></div>
              <div className="flex justify-between"><span>GST (included)</span><span>{formatPrice(order.gst)}</span></div>
              <div className="flex justify-between font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="font-semibold mb-2">Delivery Address</h2>
            <p className="text-sm text-gray-500">
              {address.street}<br />
              {address.suburb} {address.state} {address.postcode}
            </p>
            {order.deliverySlot && (
              <>
                <h3 className="font-medium mt-4 mb-1">Delivery Slot</h3>
                <p className="text-sm text-gray-500">{order.deliverySlot}</p>
              </>
            )}
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="font-semibold mb-2">Payment</h2>
            <Badge color={order.paymentStatus === "PAID" ? "green" : "gray"}>
              {order.paymentStatus}
            </Badge>
            <p className="text-sm text-gray-500 mt-2">
              Ordered on {new Date(order.createdAt).toLocaleDateString("en-AU", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
