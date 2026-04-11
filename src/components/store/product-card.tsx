"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { ActionIcon, Button, Badge, Text, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { formatPrice } from "@/lib/utils";
import { useLocalCart } from "@/hooks/use-cart";
import { setSelectedQty } from "@/lib/selected-qty";


type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  price: number;
  gst: number;
  compareAtPrice?: number | null;
  images: string[];
  stock: number;
  unit: string;
  category?: string;
};

export function ProductCard({ id, name, slug, price, gst, compareAtPrice, images, stock, unit, category }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useLocalCart();
  const isOnSale = compareAtPrice && compareAtPrice > price;
  const discount = isOnSale ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  const imageUrl = images[0] || "/placeholder-product.svg";

  const stopLink = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  const handleDecrement = (e: React.MouseEvent) => {
    stopLink(e);
    const next = Math.max(1, quantity - 1);
    setQuantity(next);
    setSelectedQty(id, next);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    stopLink(e);
    const next = Math.min(stock, quantity + 1);
    setQuantity(next);
    setSelectedQty(id, next);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    stopLink(e);
    if (stock <= 0) return;
    addItem({ productId: id, name, price, gst, image: imageUrl, unit, slug, stock }, quantity);
    notifications.show({ message: `${quantity}x ${name} added to cart`, color: "gold" });
  };

  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="overflow-hidden rounded-[var(--mantine-radius-lg)] bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="relative aspect-square" style={{ background: "var(--mantine-color-gray-1)" }}>
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {isOnSale && (
            <Badge color="red" className="absolute top-2.5 left-2.5" style={{ position: "absolute" }}>-{discount}%</Badge>
          )}
          {stock <= 0 && (
            <div className="absolute inset-0" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}>
              <Badge color="gray" variant="filled" size="lg">Out of Stock</Badge>
            </div>
          )}
        </div>
        <Stack p="sm" gap={4}>
          {category && <Text size="xs" c="dimmed">{category}</Text>}
          <Text size="sm" fw={600} lineClamp={2} style={{ minHeight: "2.5rem" }}>{name}</Text>
          <Group gap="xs">
            <Text size="lg" fw={700} c="maroon.7">{formatPrice(price)}</Text>
            {isOnSale && <Text size="sm" c="dimmed" td="line-through">{formatPrice(compareAtPrice)}</Text>}
          </Group>
          <Text size="xs" c="dimmed">{unit}</Text>
          {stock > 0 && (
            <Group gap={0} justify="center" mt={4} style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: "var(--mantine-radius-md)", background: "var(--mantine-color-gray-0)", width: "fit-content", margin: "4px auto 0" }} onClick={stopLink}>
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleDecrement} disabled={quantity <= 1}>
                <Minus size={14} />
              </ActionIcon>
              <Text size="sm" fw={600} px="xs" className="qty-value" key={quantity}>{quantity}</Text>
              <ActionIcon variant="subtle" color="gray" size="sm" onClick={handleIncrement} disabled={quantity >= stock}>
                <Plus size={14} />
              </ActionIcon>
            </Group>
          )}
          <div className="mt-1">
            <Button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              size="sm"
              color="gold"
              fullWidth
              leftSection={<ShoppingCart size={14} />}
            >
              Add to Cart
            </Button>
          </div>
        </Stack>
      </div>
    </Link>
  );
}
