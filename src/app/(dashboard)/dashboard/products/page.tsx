export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { Button, Badge } from "@mantine/core";
import { Plus } from "lucide-react";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Products</h2>
        <Link href="/dashboard/products/new">
          <Button color="green" leftSection={<Plus size={16} />}>Add Product</Button>
        </Link>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium">Product</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Price</th>
              <th className="px-4 py-3 text-left font-medium">Stock</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="px-4 py-3">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-xs text-gray-500">{product.unit}</div>
                </td>
                <td className="px-4 py-3">{product.category.name}</td>
                <td className="px-4 py-3">
                  {formatPrice(product.price)}
                  {product.compareAtPrice && (
                    <span className="text-xs text-gray-500 line-through ml-1">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={product.stock <= 5 ? "text-red-600 font-medium" : ""}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge color={product.isActive ? "green" : "gray"}>
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/products/${product.id}`} className="text-primary hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No products yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
