"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Button, Badge, Text, Group, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { formatPrice } from "@/lib/utils";
import { useLocalCart } from "@/hooks/use-cart";
import { useState } from "react";

type ProductCardProps = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  stock: number;
  unit: string;
  category?: string;
};

export function ProductCard({ id, name, slug, price, compareAtPrice, images, stock, unit, category }: ProductCardProps) {
  const { addItem } = useLocalCart();
  const [justAdded, setJustAdded] = useState(false);
  const isOnSale = compareAtPrice && compareAtPrice > price;
  const discount = isOnSale ? Math.round((1 - price / compareAtPrice) * 100) : 0;
  const imageUrl = images[0] || "/placeholder-product.svg";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock <= 0) return;
    addItem({ productId: id, name, price, image: imageUrl, unit, slug, stock });
    notifications.show({ message: `${name} added to cart`, color: "green" });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
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
            <Text size="lg" fw={700} c="green.7">{formatPrice(price)}</Text>
            {isOnSale && <Text size="sm" c="dimmed" td="line-through">{formatPrice(compareAtPrice)}</Text>}
          </Group>
          <Text size="xs" c="dimmed">{unit}</Text>
          <div className="mt-1 transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100">
            <Button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              size="sm"
              color="green"
              fullWidth
              leftSection={justAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
            >
              {justAdded ? "Added!" : "Add to Cart"}
            </Button>
          </div>
        </Stack>
      </div>
    </Link>
  );
}
