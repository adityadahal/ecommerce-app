"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Check } from "lucide-react";
import { Button, Badge } from "@mantine/core";
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
      <div className="overflow-hidden rounded-lg border bg-white transition-shadow hover:shadow-md">
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {isOnSale && (
            <Badge color="red" className="absolute top-2 left-2">-{discount}%</Badge>
          )}
          {stock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Badge color="gray" variant="filled">Out of Stock</Badge>
            </div>
          )}
        </div>
        <div className="p-3">
          {category && (
            <p className="text-xs text-muted-foreground mb-1">{category}</p>
          )}
          <h3 className="text-sm font-medium line-clamp-2 min-h-[2.5rem]">{name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold text-primary">{formatPrice(price)}</span>
            {isOnSale && (
              <span className="text-sm text-muted-foreground line-through">{formatPrice(compareAtPrice)}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{unit}</p>
          <div className="mt-3 transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100">
            <Button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              size="sm"
              color={justAdded ? "green" : "green"}
              fullWidth
              leftSection={justAdded ? <Check size={14} /> : <ShoppingCart size={14} />}
            >
              {justAdded ? "Added!" : "Add to Cart"}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
