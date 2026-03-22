import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const { items, address, deliverySlot, customerName, customerEmail, customerPhone } = await request.json();

    if (!items?.length || !address || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch products and validate
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json({ error: "Some products are unavailable" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems = [];
    const orderItems = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `${product.name} only has ${product.stock} in stock` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: {
            name: product.name,
            images: product.images.length > 0 ? [product.images[0]] : undefined,
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      });

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images[0] || null,
      });
    }

    const deliveryFee = subtotal >= 75 ? 0 : 9.95;
    const total = subtotal + deliveryFee;
    const gst = total / 11;

    // Add delivery fee as line item if applicable
    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "aud",
          product_data: { name: "Delivery Fee" },
          unit_amount: Math.round(deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    // Create order (no userId required for guest orders)
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: "PENDING",
        paymentStatus: "PENDING",
        subtotal,
        deliveryFee,
        gst,
        total,
        deliveryAddress: address,
        deliverySlot,
        customerName,
        customerEmail,
        customerPhone,
        items: {
          create: orderItems,
        },
      },
    });

    // Create Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/order/success?order=${order.orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cart`,
    });

    // Update order with Stripe session ID
    await db.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
