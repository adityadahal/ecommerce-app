import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Copy } from "lucide-react";
import { Button } from "@mantine/core";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ order?: string }>;
};

async function verifyAndUpdatePayment(orderNumber: string) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) return null;

  // If order is still PENDING and has a Stripe session, verify payment
  if (order.paymentStatus === "PENDING" && order.stripeSessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === "paid") {
        // Update order to PAID
        await db.order.update({
          where: { id: order.id },
          data: { paymentStatus: "PAID", status: "PROCESSING" },
        });

        // Decrement stock
        for (const item of order.items) {
          await db.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return { ...order, paymentStatus: "PAID", status: "PROCESSING" };
      }
    } catch {
      // Stripe check failed, return order as-is
    }
  }

  return order;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const orderNumber = sp.order;

  if (!orderNumber) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p>Invalid order.</p>
        <Link href="/"><Button color="green" className="mt-4">Go Home</Button></Link>
      </div>
    );
  }

  const order = await verifyAndUpdatePayment(orderNumber);

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p>Order not found.</p>
        <Link href="/"><Button color="green" className="mt-4">Go Home</Button></Link>
      </div>
    );
  }

  const address = order.deliveryAddress as { street: string; suburb: string; state: string; postcode: string };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <CheckCircle className="mx-auto text-green-600" size={64} />
        <h1 className="mt-4 text-3xl font-bold">Order Confirmed!</h1>
        <p className="mt-2 text-muted-foreground">Thank you for your order</p>
      </div>

      {/* Order number — prominent for tracking */}
      <div className="mt-6 rounded-lg border-2 border-primary bg-green-50 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-1">Your Order Number</p>
        <p className="text-2xl font-mono font-bold text-primary">{order.orderNumber}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Save this number to track your order anytime
        </p>
        <Link href={`/track?prefill=${order.orderNumber}`} className="mt-3 inline-block">
          <Button variant="outline" size="sm" color="green">Track This Order</Button>
        </Link>
      </div>

      <div className="mt-8 rounded-lg border p-6 space-y-4">
        <h2 className="font-semibold text-lg">Order Details</h2>

        {order.customerName && (
          <p className="text-sm text-muted-foreground">
            {order.customerName} &bull; {order.customerEmail} &bull; {order.customerPhone}
          </p>
        )}

        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.name} x {item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (included)</span>
            <span>{formatPrice(order.gst)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-1">Delivery Address</h3>
          <p className="text-sm text-muted-foreground">
            {address.street}, {address.suburb} {address.state} {address.postcode}
          </p>
          {order.deliverySlot && (
            <>
              <h3 className="font-medium mt-3 mb-1">Delivery Time</h3>
              <p className="text-sm text-muted-foreground">{order.deliverySlot}</p>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <Link href="/track">
          <Button variant="outline" color="green">Track Order</Button>
        </Link>
        <Link href="/">
          <Button color="green">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
