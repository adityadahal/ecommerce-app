"use client";

import { useState } from "react";
import { ActionIcon, Button, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useLocalCart } from "@/hooks/use-cart";
import { getSelectedQty, setSelectedQty } from "@/lib/selected-qty";

type Props = {
  id: string;
  name: string;
  price: number;
  gst: number;
  image: string;
  unit: string;
  slug: string;
  stock: number;
};

export function AddToCartButton({ id, name, price, gst, image, unit, slug, stock }: Props) {
  const [quantity, setQuantity] = useState(() => Math.min(getSelectedQty(id), stock));
  const { addItem } = useLocalCart();

  const handleDecrement = () => {
    const next = Math.max(1, quantity - 1);
    setQuantity(next);
    setSelectedQty(id, next);
  };

  const handleIncrement = () => {
    const next = Math.min(stock, quantity + 1);
    setQuantity(next);
    setSelectedQty(id, next);
  };

  const handleAdd = () => {
    addItem({ productId: id, name, price, gst, image, unit, slug, stock }, quantity);
    notifications.show({ message: `${quantity}x ${name} added to cart`, color: "gold" });
  };

  return (
    <div className="mt-6 space-y-4">
      <Group gap={0} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: "var(--mantine-radius-md)", background: "var(--mantine-color-gray-0)", width: "fit-content" }}>
        <ActionIcon variant="subtle" color="gray" size="lg" onClick={handleDecrement} disabled={quantity <= 1}>
          <Minus size={16} />
        </ActionIcon>
        <Text size="md" fw={600} px="md" className="qty-value" key={quantity}>{quantity}</Text>
        <ActionIcon variant="subtle" color="gray" size="lg" onClick={handleIncrement} disabled={quantity >= stock}>
          <Plus size={16} />
        </ActionIcon>
      </Group>
      <Button onClick={handleAdd} disabled={stock <= 0} size="lg" color="gold" leftSection={<ShoppingCart size={18} />} className="w-full md:w-auto shadow-sm">
        Add to Cart
      </Button>
    </div>
  );
}
