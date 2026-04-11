import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { sendOrderConfirmation } from "@/lib/email";
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

        // Retrieve card details from payment intent
        let cardBrand: string | null = null;
        let cardLast4: string | null = null;
        let paymentIntentId: string | null = null;

        if (session.payment_intent) {
          paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
          try {
            const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["payment_method"] });
            const pm = pi.payment_method;
            if (pm && typeof pm !== "string" && pm.card) {
              cardBrand = pm.card.brand;
              cardLast4 = pm.card.last4;
            }
          } catch { /* card details retrieval failed, non-critical */ }
        }

        // Update order payment status + card details
        const order = await db.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "PAID",
            status: "PROCESSING",
            stripePaymentIntentId: paymentIntentId,
            cardBrand,
            cardLast4,
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

        // Send order confirmation email
        if (order.customerEmail) {
          await sendOrderConfirmation(
            order.customerEmail,
            order.orderNumber,
            order.total,
            order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }))
          );
        }
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

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (paymentIntentId) {
        const order = await db.order.findFirst({
          where: { stripePaymentIntentId: paymentIntentId },
          include: { items: true },
        });

        if (order && order.refundStatus !== "REFUNDED") {
          // Update refund status
          await db.order.update({
            where: { id: order.id },
            data: {
              refundStatus: "REFUNDED",
              paymentStatus: "REFUNDED",
              refundedAt: new Date(),
              refundAmount: (charge.amount_refunded ?? 0) / 100,
            },
          });

          // Restore stock for each order item
          for (const item of order.items) {
            await db.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
      break;
    }

    case "charge.refund.updated": {
      const refund = event.data.object as Stripe.Refund;
      if (refund.status === "failed" && refund.id) {
        const order = await db.order.findFirst({
          where: { stripeRefundId: refund.id },
        });
        if (order) {
          await db.order.update({
            where: { id: order.id },
            data: { refundStatus: "FAILED" },
          });
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
