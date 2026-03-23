import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("order");

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number required" }, { status: 400 });
  }

  const order = await db.order.findUnique({
    where: { orderNumber },
    select: {
      orderNumber: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      deliveryFee: true,
      gst: true,
      total: true,
      deliveryAddress: true,
      deliverySlot: true,
      customerName: true,
      cardBrand: true,
      cardLast4: true,
      createdAt: true,
      items: {
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}
