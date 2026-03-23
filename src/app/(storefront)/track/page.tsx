"use client";

import { useState } from "react";
import { Container, Button, TextInput, Title, Text, Paper, Group, Stack, ThemeIcon, Alert } from "@mantine/core";
import { formatPrice } from "@/lib/utils";
import { OrderSummary } from "@/components/store/order-summary";
import { AddressDisplay } from "@/components/store/address-display";
import { ORDER_STATUS_STEPS } from "@/lib/constants";
import { Search, XCircle, Package, CreditCard } from "lucide-react";

type OrderData = {
  orderNumber: string; status: string; paymentStatus: string;
  subtotal: number; deliveryFee: number; gst: number; total: number;
  deliveryAddress: { street: string; suburb: string; state: string; postcode: string };
  deliverySlot: string | null; customerName: string | null; createdAt: string;
  cardBrand: string | null; cardLast4: string | null;
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
    setLoading(true); setError(""); setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?order=${encodeURIComponent(orderNumber.trim())}`);
      if (res.ok) setOrder(await res.json());
      else setError("Order not found. Please check your order number.");
    } catch { setError("Something went wrong. Please try again."); }
    setLoading(false);
  };

  const isCancelled = order?.status === "CANCELLED";
  const currentStepIndex = ORDER_STATUS_STEPS.findIndex((s) => s.key === order?.status);

  return (
    <Container size={680} py="xl">
      <Stack align="center" mb="xl">
        <ThemeIcon color="green" size={64} radius="xl" variant="light">
          <Package size={28} />
        </ThemeIcon>
        <Title order={1} ta="center">Track Your Order</Title>
        <Text c="dimmed" ta="center">Enter your order number to see the latest status</Text>
      </Stack>

      <form onSubmit={handleTrack}>
        <Group gap="sm">
          <TextInput value={orderNumber} onChange={(e) => setOrderNumber(e.currentTarget.value)} placeholder="Enter order number (e.g. MVM-L5K2F-A3B1)" style={{ flex: 1 }} size="md" />
          <Button type="submit" disabled={loading} color="green" size="md" leftSection={<Search size={16} />}>
            {loading ? "Searching..." : "Track"}
          </Button>
        </Group>
      </form>

      {error && <Alert color="red" variant="light" mt="lg">{error}</Alert>}

      {order && (
        <Stack mt="xl" gap="md">
          <Paper p="lg" radius="lg" withBorder>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">Order Number</Text>
                <Text size="xl" fw={700} ff="monospace">{order.orderNumber}</Text>
              </div>
              <div style={{ textAlign: "right" }}>
                <Text size="sm" c="dimmed">Placed on</Text>
                <Text fw={500}>{new Date(order.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</Text>
              </div>
            </Group>
            {order.customerName && <Text size="sm" c="dimmed" mt="xs">Customer: {order.customerName}</Text>}
          </Paper>

          <Paper p="lg" radius="lg" withBorder>
            <Text fw={600} mb="md">Order Status</Text>
            {isCancelled ? (
              <Alert color="red" variant="light" icon={<XCircle size={20} />}>
                <Text fw={500} size="lg">Order Cancelled</Text>
              </Alert>
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
                        <ThemeIcon
                          color={isComplete ? "green" : "gray"}
                          variant={isComplete ? "filled" : "light"}
                          size="lg"
                          radius="xl"
                          className={isCurrent ? "step-active-pulse" : ""}
                          style={isCurrent ? { ring: "2px solid var(--mantine-color-green-6)", ringOffset: "2px" } : undefined}
                        >
                          <StepIcon size={18} />
                        </ThemeIcon>
                        <Text size="xs" ta="center" c={isComplete ? "green" : "dimmed"} fw={isComplete ? 500 : 400}>
                          {step.label}
                        </Text>
                      </div>
                      {i < ORDER_STATUS_STEPS.length - 1 && (
                        <div className="flex-1 mx-2 self-start mt-5" style={{ height: 2, background: "var(--mantine-color-gray-3)", position: "relative", overflow: "hidden" }}>
                          <div style={{ position: "absolute", inset: 0, background: "var(--mantine-color-green-6)", transformOrigin: "left", transform: isLineComplete ? "scaleX(1)" : "scaleX(0)", transition: "transform 0.7s" }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Paper>

          <Paper p="lg" radius="lg" withBorder>
            <Text fw={600} mb="sm">Order Details</Text>
            <Stack gap="xs">
              {order.items.map((item) => (
                <Group key={item.id} justify="space-between">
                  <Text size="sm" c="dimmed">{item.name} x {item.quantity}</Text>
                  <Text size="sm" fw={500}>{formatPrice(item.price * item.quantity)}</Text>
                </Group>
              ))}
            </Stack>
            <OrderSummary subtotal={order.subtotal} gst={order.gst} deliveryFee={order.deliveryFee} total={order.total} />
          </Paper>

          {order.cardBrand && order.cardLast4 && (
            <Paper p="lg" radius="lg" withBorder>
              <Text fw={600} mb="xs">Payment Method</Text>
              <Group gap="xs">
                <CreditCard size={16} className="text-gray-400" />
                <Text size="sm" c="dimmed" tt="capitalize">{order.cardBrand} ending in {order.cardLast4}</Text>
              </Group>
            </Paper>
          )}

          <Paper p="lg" radius="lg" withBorder>
            <Text fw={600} mb="xs">Delivery</Text>
            <AddressDisplay address={order.deliveryAddress} multiline />
            {order.deliverySlot && <Text size="sm" c="dimmed" mt="xs">Time slot: {order.deliverySlot}</Text>}
          </Paper>
        </Stack>
      )}
    </Container>
  );
}
