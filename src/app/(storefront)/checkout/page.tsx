"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Container, Button, TextInput, NativeSelect, Select, Title, Text, Paper, Group, Stack, Grid, ThemeIcon, Alert } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useLocalCart } from "@/hooks/use-cart";
import { formatPrice, calculateGST } from "@/lib/utils";
import { OrderSummary } from "@/components/store/order-summary";
import { getNextDeliveryDate, formatDeliveryDate } from "@/lib/constants";
import { Loader2, User, MapPin, Truck, ShoppingBag, CalendarDays } from "lucide-react";

type DeliveryZone = {
  id: string;
  name: string;
  deliveryFee: number;
  minOrderForFree: number | null;
  availableDays: string[];
};

type SuburbOption = { id: string; name: string; postcode: string };

export default function CheckoutPage() {
  const { items, subtotal, clearCart, gstTotal } = useLocalCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [suburbs, setSuburbs] = useState<SuburbOption[]>([]);
  const [selectedSuburbId, setSelectedSuburbId] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [postcode, setPostcode] = useState("");

  useEffect(() => {
    fetch("/api/delivery-zones")
      .then((r) => r.json())
      .then((data) => setZones(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedZoneId) {
      fetch(`/api/suburbs?zoneId=${selectedZoneId}`)
        .then((r) => r.json())
        .then((data) => setSuburbs(data))
        .catch(() => {});
    } else {
      setSuburbs([]);
    }
    setSelectedSuburbId("");
    setSuburb("");
    setPostcode("");
  }, [selectedZoneId]);

  useEffect(() => {
    const selected = suburbs.find((s) => s.id === selectedSuburbId);
    if (selected) {
      setSuburb(selected.name);
      setPostcode(selected.postcode);
    } else {
      setSuburb("");
      setPostcode("");
    }
  }, [selectedSuburbId, suburbs]);

  const selectedZone = useMemo(
    () => zones.find((z) => z.id === selectedZoneId) || null,
    [zones, selectedZoneId]
  );

  const deliveryFee = useMemo(() => {
    if (!selectedZone) return 0;
    if (selectedZone.minOrderForFree && subtotal >= selectedZone.minOrderForFree) return 0;
    return selectedZone.deliveryFee;
  }, [selectedZone, subtotal]);

  const estimatedDate = useMemo(
    () => (selectedZone ? getNextDeliveryDate(selectedZone.availableDays) : null),
    [selectedZone]
  );

  const total = subtotal + deliveryFee;
  const gst = gstTotal + calculateGST(deliveryFee);
  const isFormValid = customerName && customerEmail && customerPhone && street && suburb && postcode && selectedZoneId;

  const handleCheckout = async () => {
    if (!isFormValid) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          address: { street, suburb, postcode },
          deliveryZoneId: selectedZoneId,
          customerName, customerEmail, customerPhone,
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
        <Button onClick={() => router.push("/")} color="maroon" mt="md">Continue Shopping</Button>
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
                <ThemeIcon color="maroon" size="md" radius="md" variant="light"><User size={16} /></ThemeIcon>
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
                <NativeSelect
                  label="Delivery Zone"
                  value={selectedZoneId}
                  onChange={(e) => setSelectedZoneId(e.currentTarget.value)}
                  data={[
                    { value: "", label: "-- Select a delivery zone --" },
                    ...zones.map((z) => ({ value: z.id, label: z.name })),
                  ]}
                  required
                />
                {selectedZoneId && suburbs.length === 0 ? (
                  <Alert color="yellow" variant="light">
                    <Text size="sm">No suburbs found for this delivery zone. Please select a different zone.</Text>
                  </Alert>
                ) : (
                  <Select
                    label="Suburb"
                    placeholder={selectedZoneId ? "Search and select suburb..." : "Select a zone first"}
                    value={selectedSuburbId}
                    onChange={(val) => setSelectedSuburbId(val || "")}
                    data={suburbs.map((s) => ({ value: s.id, label: s.name }))}
                    disabled={!selectedZoneId}
                    searchable
                    nothingFoundMessage="No suburb found"
                    required
                  />
                )}
                <TextInput label="Postcode" value={postcode} readOnly variant="filled" placeholder="Auto-filled from suburb" required />
                <TextInput label="Street Address" value={street} onChange={(e) => setStreet(e.currentTarget.value)} placeholder="123 Main Street" required />
                {selectedZone && estimatedDate && (
                  <Alert color="maroon" variant="light" icon={<CalendarDays size={18} />}>
                    <Text size="sm" fw={500}>
                      Estimated delivery: {formatDeliveryDate(estimatedDate)}
                    </Text>
                    {deliveryFee > 0 && selectedZone.minOrderForFree && (
                      <Text size="xs" c="dimmed" mt={2}>
                        Free delivery on orders over {formatPrice(selectedZone.minOrderForFree)}
                      </Text>
                    )}
                    {deliveryFee === 0 && selectedZone.minOrderForFree && (
                      <Text size="xs" c="green" fw={500} mt={2}>
                        You qualify for free delivery!
                      </Text>
                    )}
                  </Alert>
                )}
              </Stack>
            </Paper>

            <Paper p="lg" radius="lg" withBorder>
              <Group gap="sm" mb="md">
                <ThemeIcon color="yellow" size="md" radius="md" variant="light"><ShoppingBag size={16} /></ThemeIcon>
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
            {estimatedDate && (
              <Group gap="xs" mt="sm">
                <CalendarDays size={14} className="text-gray-400" />
                <Text size="sm" c="dimmed">Est. delivery: {formatDeliveryDate(estimatedDate)}</Text>
              </Group>
            )}
            <Button onClick={handleCheckout} disabled={loading || !isFormValid} color="gold" fullWidth size="lg" mt="lg">
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
