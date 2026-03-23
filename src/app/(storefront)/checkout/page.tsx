"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Button, TextInput, NativeSelect, Title, Text, Paper, Group, Stack, Grid, ThemeIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useLocalCart } from "@/hooks/use-cart";
import { formatPrice, calculateGST } from "@/lib/utils";
import { OrderSummary } from "@/components/store/order-summary";
import { AU_STATES, DELIVERY_SLOTS, FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_FEE } from "@/lib/constants";
import { Loader2, User, MapPin, Clock, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useLocalCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deliverySlot, setDeliverySlot] = useState(DELIVERY_SLOTS[0]);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
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
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          address: { street, suburb, state, postcode },
          deliverySlot, customerName, customerEmail, customerPhone,
        }),
      });
      const data = await res.json();
      if (data.url) { clearCart(); window.location.href = data.url; }
      else { setLoading(false); notifications.show({ message: data.error || "Something went wrong", color: "red" }); }
    } catch { setLoading(false); notifications.show({ message: "Something went wrong", color: "red" }); }
  };

  if (items.length === 0) {
    return (
      <Container size={900} py={60} ta="center">
        <Title order={2}>Your cart is empty</Title>
        <Button onClick={() => router.push("/")} color="green" mt="md">Continue Shopping</Button>
      </Container>
    );
  }

  return (
    <Container size={900} py="xl">
      <Title order={1}>Checkout</Title>
      <Text c="dimmed" mt={4}>Complete your order details below</Text>

      <Grid mt="lg" gutter="lg">
        <Grid.Col span={{ base: 12, lg: 7 }}>
          <Stack gap="lg">
            <Paper p="lg" radius="lg" withBorder>
              <Group gap="sm" mb="md">
                <ThemeIcon color="green" size="md" radius="md" variant="light"><User size={16} /></ThemeIcon>
                <Title order={4}>Your Details</Title>
              </Group>
              <Stack gap="sm">
                <TextInput label="Full Name" value={customerName} onChange={(e) => setCustomerName(e.currentTarget.value)} placeholder="John Smith" required />
                <Group grow>
                  <TextInput label="Email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.currentTarget.value)} placeholder="you@example.com" required />
                  <TextInput label="Phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.currentTarget.value)} placeholder="04xx xxx xxx" required />
                </Group>
              </Stack>
            </Paper>

            <Paper p="lg" radius="lg" withBorder>
              <Group gap="sm" mb="md">
                <ThemeIcon color="blue" size="md" radius="md" variant="light"><MapPin size={16} /></ThemeIcon>
                <Title order={4}>Delivery Address</Title>
              </Group>
              <Stack gap="sm">
                <TextInput label="Street Address" value={street} onChange={(e) => setStreet(e.currentTarget.value)} placeholder="123 Main Street" required />
                <Group grow>
                  <TextInput label="Suburb" value={suburb} onChange={(e) => setSuburb(e.currentTarget.value)} placeholder="Melbourne" required />
                  <NativeSelect label="State" value={state} onChange={(e) => setState(e.currentTarget.value)} data={AU_STATES} />
                </Group>
                <TextInput label="Postcode" value={postcode} onChange={(e) => setPostcode(e.currentTarget.value)} placeholder="3000" maxLength={4} required w="50%" />
              </Stack>
            </Paper>

            <Paper p="lg" radius="lg" withBorder>
              <Group gap="sm" mb="md">
                <ThemeIcon color="yellow" size="md" radius="md" variant="light"><Clock size={16} /></ThemeIcon>
                <Title order={4}>Delivery Time</Title>
              </Group>
              <Group gap="sm" grow>
                {DELIVERY_SLOTS.map((slot) => (
                  <Button
                    key={slot}
                    variant={deliverySlot === slot ? "light" : "default"}
                    color={deliverySlot === slot ? "green" : "gray"}
                    onClick={() => setDeliverySlot(slot)}
                    size="sm"
                  >
                    {slot}
                  </Button>
                ))}
              </Group>
            </Paper>

            <Paper p="lg" radius="lg" withBorder>
              <Group gap="sm" mb="md">
                <ThemeIcon color="violet" size="md" radius="md" variant="light"><ShoppingBag size={16} /></ThemeIcon>
                <Title order={4}>Order Items ({items.length})</Title>
              </Group>
              <Stack gap="xs">
                {items.map((item) => (
                  <Group key={item.productId} justify="space-between">
                    <Text size="sm" c="dimmed">{item.name} <Text span c="dimmed">x {item.quantity}</Text></Text>
                    <Text size="sm" fw={500}>{formatPrice(item.price * item.quantity)}</Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 5 }}>
          <Paper p="lg" radius="lg" withBorder shadow="sm" pos={{ lg: "sticky" }} top={{ lg: 80 }}>
            <Title order={3} mb="md">Order Summary</Title>
            <OrderSummary subtotal={subtotal} gst={gst} deliveryFee={deliveryFee} total={total} />
            <Button onClick={handleCheckout} disabled={loading || !isFormValid} color="green" fullWidth size="lg" mt="lg">
              {loading ? (<><Loader2 size={16} className="animate-spin" /> Processing...</>) : `Pay ${formatPrice(total)}`}
            </Button>
            <Text size="xs" c="dimmed" ta="center" mt="sm">
              You&apos;ll be redirected to Stripe for secure payment
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
