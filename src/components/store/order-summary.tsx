import { Text, Stack, Group, Divider, Alert } from "@mantine/core";
import { formatPrice } from "@/lib/utils";

type OrderSummaryProps = {
  subtotal: number;
  gst: number;
  deliveryFee: number;
  total: number;
  showFreeDeliveryHint?: boolean;
};

export function OrderSummary({
  subtotal,
  gst,
  deliveryFee,
  total,
  showFreeDeliveryHint = false,
}: OrderSummaryProps) {
  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">Subtotal</Text>
        <Text size="sm" fw={500}>{formatPrice(subtotal)}</Text>
      </Group>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">GST</Text>
        <Text size="sm" fw={500}>{formatPrice(gst)}</Text>
      </Group>
      <Group justify="space-between">
        <Text size="sm" c="dimmed">Delivery</Text>
        <Text size="sm" fw={500} c={deliveryFee === 0 ? "maroon" : undefined}>
          {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
        </Text>
      </Group>
      {showFreeDeliveryHint && deliveryFee > 0 && (
        <Alert color="maroon" variant="light" p="xs">
          <Text size="xs">Add ${(75 - subtotal).toFixed(2)} more for free delivery!</Text>
        </Alert>
      )}
      <Divider />
      <Group justify="space-between">
        <Text fw={700}>Total</Text>
        <Text fw={700}>{formatPrice(total)}</Text>
      </Group>
    </Stack>
  );
}
