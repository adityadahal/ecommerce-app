"use client";

import { useState } from "react";
import { Button, TextInput } from "@mantine/core";
import { formatPrice } from "@/lib/utils";
import { OrderSummary } from "@/components/store/order-summary";
import { AddressDisplay } from "@/components/store/address-display";
import { ORDER_STATUS_STEPS } from "@/lib/constants";
import { Search, XCircle } from "lucide-react";

type OrderData = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  gst: number;
  total: number;
  deliveryAddress: { street: string; suburb: string; state: string; postcode: string };
  deliverySlot: string | null;
  customerName: string | null;
  createdAt: string;
  items: { id: string; name: string; price: number; quantity: number }[];
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?order=${encodeURIComponent(orderNumber.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      } else {
        setError("Order not found. Please check your order number.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const isCancelled = order?.status === "CANCELLED";
  const currentStepIndex = ORDER_STATUS_STEPS.findIndex((s) => s.key === order?.status);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Track Your Order</h1>
        <p className="text-muted-foreground mt-2">Enter your order number to see the latest status</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-2">
        <TextInput
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.currentTarget.value)}
          placeholder="Enter order number (e.g. MVM-L5K2F-A3B1)"
          className="flex-1"
        />
        <Button type="submit" disabled={loading} color="green" leftSection={<Search size={16} />}>
          {loading ? "Searching..." : "Track"}
        </Button>
      </form>

      {error && (
        <div className="mt-6 rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
          {error}
        </div>
      )}

      {order && (
        <div className="mt-8 space-y-6">
          {/* Order header */}
          <div className="rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-xl font-mono font-bold">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Placed on</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {order.customerName && (
              <p className="mt-2 text-sm text-muted-foreground">Customer: {order.customerName}</p>
            )}
          </div>

          {/* Status tracker */}
          <div className="rounded-lg border p-6">
            <h2 className="font-semibold mb-6">Order Status</h2>
            {isCancelled ? (
              <div className="flex items-center gap-3 text-red-600">
                <XCircle size={24} />
                <span className="font-medium text-lg">Order Cancelled</span>
              </div>
            ) : (
              <div className="flex items-center">
                {ORDER_STATUS_STEPS.map((step, i) => {
                  const isComplete = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const isLineComplete = i < currentStepIndex;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                          isComplete ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
                        } ${isCurrent ? "ring-2 ring-primary ring-offset-2 step-active-pulse" : ""}`}>
                          <StepIcon size={18} />
                        </div>
                        <span className={`text-xs text-center ${isComplete ? "font-medium text-primary" : "text-muted-foreground"}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < ORDER_STATUS_STEPS.length - 1 && (
                        <div className="flex-1 h-0.5 bg-gray-200 relative overflow-hidden mx-2 self-start mt-5">
                          <div
                            className="absolute inset-0 bg-primary transition-transform duration-700 origin-left"
                            style={{ transform: isLineComplete ? 'scaleX(1)' : 'scaleX(0)' }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order details */}
          <div className="rounded-lg border p-6">
            <h2 className="font-semibold mb-4">Order Details</h2>
            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <OrderSummary subtotal={order.subtotal} gst={order.gst} deliveryFee={order.deliveryFee} total={order.total} />
              </div>
            </div>
          </div>

          {/* Delivery info */}
          <div className="rounded-lg border p-6">
            <h2 className="font-semibold mb-2">Delivery</h2>
            <AddressDisplay address={order.deliveryAddress} multiline />
            {order.deliverySlot && (
              <p className="text-sm text-muted-foreground mt-2">Time slot: {order.deliverySlot}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
