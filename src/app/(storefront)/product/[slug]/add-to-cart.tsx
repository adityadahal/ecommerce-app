"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { useLocalCart } from "@/hooks/use-cart";

type Props = {
  id: string;
  name: string;
  price: number;
  image: string;
  unit: string;
  slug: string;
  stock: number;
};

export function AddToCartButton({ id, name, price, image, unit, slug, stock }: Props) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useLocalCart();

  const handleAdd = () => {
    addItem({ productId: id, name, price, image, unit, slug, stock }, quantity);
    notifications.show({ message: `${quantity}x ${name} added to cart`, color: "green" });
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border border-stone-200 bg-stone-50">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2.5 hover:bg-stone-100 rounded-l-lg active:scale-90 transition-all duration-100"
            disabled={quantity <= 1}
          >
            <Minus size={16} />
          </button>
          <span key={quantity} className="qty-value px-4 py-2.5 font-semibold text-stone-800">{quantity}</span>
          <button
            onClick={() => setQuantity(Math.min(stock, quantity + 1))}
            className="px-3 py-2.5 hover:bg-stone-100 rounded-r-lg active:scale-90 transition-all duration-100"
            disabled={quantity >= stock}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      <Button onClick={handleAdd} disabled={stock <= 0} size="lg" color="green" leftSection={<ShoppingCart size={18} />} className="w-full md:w-auto shadow-sm">
        Add to Cart
      </Button>
    </div>
  );
}
