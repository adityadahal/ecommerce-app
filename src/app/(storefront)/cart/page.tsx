"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@mantine/core";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useLocalCart } from "@/hooks/use-cart";
import { formatPrice, calculateGST } from "@/lib/utils";

export default function CartPage() {
  const { items, isLoaded, updateQuantity, removeItem, subtotal } = useLocalCart();
  const gst = calculateGST(subtotal);
  const deliveryFee = subtotal >= 75 ? 0 : 9.95;
  const total = subtotal + deliveryFee;

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <div className="mt-8 animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <ShoppingCart className="float-animation mx-auto text-muted-foreground" size={64} />
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some items to get started</p>
        <Link href="/" className="mt-6 inline-block">
          <Button color="green">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 rounded-lg border p-4 transition-all duration-200">
              <Link href={`/product/${item.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                <Image src={item.image || "/placeholder-product.svg"} alt={item.name} fill className="object-cover" sizes="80px" />
              </Link>
              <div className="flex-1">
                <Link href={`/product/${item.slug}`} className="font-medium hover:text-primary">
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">{item.unit}</p>
                <p className="mt-1 font-bold text-primary">{formatPrice(item.price)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-red-600">
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center rounded-md border">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-2 py-1 hover:bg-accent active:scale-90 transition-transform duration-100"
                  >
                    <Minus size={14} />
                  </button>
                  <span key={item.quantity} className="qty-value px-3 py-1 text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                    className="px-2 py-1 hover:bg-accent active:scale-90 transition-transform duration-100"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg border bg-gray-50 p-6 h-fit">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (included)</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-muted-foreground">
                Free delivery on orders over $75 (${(75 - subtotal).toFixed(2)} away)
              </p>
            )}
            <div className="border-t pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link href="/checkout" className="mt-6 block">
            <Button color="green" fullWidth size="lg" rightSection={<ArrowRight size={16} />}>
              Checkout
            </Button>
          </Link>
          <Link href="/" className="mt-2 block text-center text-sm text-muted-foreground hover:text-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
