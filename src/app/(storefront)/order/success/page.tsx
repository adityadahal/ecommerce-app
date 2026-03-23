import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { CheckCircle, Package as PackageIcon } from "lucide-react";
import { Container, Button, Title, Text, Paper, Group, Stack, ThemeIcon } from "@mantine/core";
import Link from "next/link";
import { OrderSummary } from "@/components/store/order-summary";
import { AddressDisplay } from "@/components/store/address-display";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ order?: string }> };

async function verifyAndUpdatePayment(orderNumber: string) {
  const order = await db.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!order) return null;
  if (order.paymentStatus === "PENDING" && order.stripeSessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
      if (session.payment_status === "paid") {
        await db.order.update({ where: { id: order.id }, data: { paymentStatus: "PAID", status: "PROCESSING" } });
        for (const item of order.items) { await db.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } }); }
        return { ...order, paymentStatus: "PAID", status: "PROCESSING" };
      }
    } catch { /* Stripe check failed */ }
  }
  return order;
}

export default async function OrderSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  if (!sp.order) return <Container size={680} py={60} ta="center"><Text>Invalid order.</Text><Link href="/"><Button color="green" mt="md">Go Home</Button></Link></Container>;

  const order = await verifyAndUpdatePayment(sp.order);
  if (!order) return <Container size={680} py={60} ta="center"><Text>Order not found.</Text><Link href="/"><Button color="green" mt="md">Go Home</Button></Link></Container>;

  const address = order.deliveryAddress as { street: string; suburb: string; state: string; postcode: string };

  return (
    <Container size={680} py={60}>
      <Stack align="center">
        <ThemeIcon color="green" size={80} radius="xl" variant="light">
          <CheckCircle size={40} />
        </ThemeIcon>
        <Title order={1} ta="center">Order Confirmed!</Title>
        <Text c="dimmed">Thank you for your order</Text>
      </Stack>

      <Paper p="lg" radius="lg" mt="xl" bg="green.0" withBorder style={{ borderColor: "var(--mantine-color-green-3)" }} ta="center">
        <Text size="sm" c="dimmed">Your Order Number</Text>
        <Text size="xl" fw={700} c="green.8" ff="monospace" mt={4}>{order.orderNumber}</Text>
        <Text size="sm" c="dimmed" mt="xs">Save this number to track your order anytime</Text>
        <Link href={`/track?prefill=${order.orderNumber}`}>
          <Button variant="outline" color="green" size="sm" mt="md" leftSection={<PackageIcon size={14} />}>
            Track This Order
          </Button>
        </Link>
      </Paper>

      <Paper p="lg" radius="lg" withBorder mt="lg">
        <Title order={3} mb="md">Order Details</Title>
        {order.customerName && <Text size="sm" c="dimmed" mb="md">{order.customerName} &bull; {order.customerEmail} &bull; {order.customerPhone}</Text>}
        <Stack gap="xs">
          {order.items.map((item) => (
            <Group key={item.id} justify="space-between">
              <Text size="sm" c="dimmed">{item.name} x {item.quantity}</Text>
              <Text size="sm" fw={500}>{formatPrice(item.price * item.quantity)}</Text>
            </Group>
          ))}
        </Stack>
        <OrderSummary subtotal={order.subtotal} gst={order.gst} deliveryFee={order.deliveryFee} total={order.total} />

        <Text fw={500} mt="lg" mb={4}>Delivery Address</Text>
        <AddressDisplay address={address} />
        {order.deliverySlot && (<><Text fw={500} mt="md" mb={4}>Delivery Time</Text><Text size="sm" c="dimmed">{order.deliverySlot}</Text></>)}
      </Paper>

      <Group justify="center" mt="xl">
        <Link href="/track"><Button variant="outline" color="green">Track Order</Button></Link>
        <Link href="/"><Button color="green">Continue Shopping</Button></Link>
      </Group>
    </Container>
  );
}
