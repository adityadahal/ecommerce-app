import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        // Idempotency check: skip if already paid
        const existing = await db.order.findUnique({ where: { id: orderId } });
        if (!existing || existing.paymentStatus === "PAID") break;

        // Update order payment status
        const order = await db.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
          },
          include: { items: true },
        });

        // Decrement stock for each product
        for (const item of order.items) {
          await db.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // TODO: Send order confirmation email via Resend
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const metadata = paymentIntent.metadata;

      if (metadata?.orderId) {
        await db.order.update({
          where: { id: metadata.orderId },
          data: { paymentStatus: "FAILED" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
