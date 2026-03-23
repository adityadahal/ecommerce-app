"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput, NativeSelect } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useLocalCart } from "@/hooks/use-cart";
import { formatPrice, calculateGST } from "@/lib/utils";
import { OrderSummary } from "@/components/store/order-summary";
import { AU_STATES, DELIVERY_SLOTS, FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_FEE } from "@/lib/constants";
import { Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useLocalCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Address
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("VIC");
  const [postcode, setPostcode] = useState("");

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE;
  const total = subtotal + deliveryFee;
  const gst = calculateGST(total);

  const isFormValid = customerName && customerEmail && customerPhone && street && suburb && state && postcode;

  const handleCheckout = async () => {
    if (!isFormValid) return;
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          address: { street, suburb, state, postcode },
          deliverySlot,
          customerName,
          customerEmail,
          customerPhone,
        }),
      });

      const data = await res.json();

      if (data.url) {
        clearCart();
        window.location.href = data.url;
      } else {
        setLoading(false);
        notifications.show({ message: data.error || "Something went wrong", color: "red" });
      }
    } catch {
      setLoading(false);
      notifications.show({ message: "Something went wrong", color: "red" });
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button onClick={() => router.push("/")} color="green" className="mt-4">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-6">
          {/* Customer Details */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Your Details</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <TextInput value={customerName} onChange={(e) => setCustomerName(e.currentTarget.value)} placeholder="John Smith" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <TextInput type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.currentTarget.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone *</label>
                  <TextInput type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.currentTarget.value)} placeholder="04xx xxx xxx" required />
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Address</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address *</label>
                <TextInput value={street} onChange={(e) => setStreet(e.currentTarget.value)} placeholder="123 Main Street" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Suburb *</label>
                  <TextInput value={suburb} onChange={(e) => setSuburb(e.currentTarget.value)} placeholder="Melbourne" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <NativeSelect
                    value={state}
                    onChange={(e) => setState(e.currentTarget.value)}
                    data={AU_STATES}
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Postcode *</label>
                <TextInput value={postcode} onChange={(e) => setPostcode(e.currentTarget.value)} placeholder="3000" maxLength={4} required />
              </div>
            </div>
          </div>

          {/* Delivery Slot */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Delivery Time</h2>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DELIVERY_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setDeliverySlot(slot)}
                  className={`rounded-md border p-3 text-sm text-left transition-all duration-200 ${
                    deliverySlot === slot ? "border-primary bg-green-50 text-primary ring-2 ring-green-500 ring-offset-2 scale-[1.02]" : "hover:border-gray-400"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items ({items.length})</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-lg border bg-gray-50 p-6">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="mt-4">
              <OrderSummary subtotal={subtotal} gst={gst} deliveryFee={deliveryFee} total={total} />
            </div>
            <Button onClick={handleCheckout} disabled={loading || !isFormValid} color="green" fullWidth size="lg" className="mt-6">
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ${formatPrice(total)}`
              )}
            </Button>
            <p className="mt-3 text-xs text-center text-muted-foreground">
              You&apos;ll be redirected to Stripe for secure payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
