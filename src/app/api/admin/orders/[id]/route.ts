import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";
import { VALID_ORDER_STATUSES } from "@/lib/constants";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  const { status } = await request.json();

  if (!VALID_ORDER_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  // If cancelling a paid order, process a Stripe refund
  if (status === "CANCELLED") {
    const existing = await db.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Only refund if order was paid and has a payment intent and hasn't been refunded yet
    if (
      existing.paymentStatus === "PAID" &&
      existing.stripePaymentIntentId &&
      existing.refundStatus === "NONE"
    ) {
      try {
        const refund = await stripe.refunds.create({
          payment_intent: existing.stripePaymentIntentId,
        });

        const order = await db.order.update({
          where: { id },
          data: {
            status: "CANCELLED",
            refundStatus: "PENDING",
            stripeRefundId: refund.id,
          },
          include: { user: { select: { name: true, email: true } }, items: true },
        });

        return NextResponse.json(order);
      } catch (err) {
        console.error("Stripe refund failed:", err);

        // Mark refund as failed, don't cancel the order
        await db.order.update({
          where: { id },
          data: { refundStatus: "FAILED" },
        });

        const message =
          err instanceof Error ? err.message : "Refund failed. Try again or use Stripe Dashboard.";
        return NextResponse.json({ error: message }, { status: 500 });
      }
    }

    // Not paid or no payment intent — just cancel without refund
  }

  const order = await db.order.update({
    where: { id },
    data: { status },
    include: { user: { select: { name: true, email: true } }, items: true },
  });

  return NextResponse.json(order);
}
