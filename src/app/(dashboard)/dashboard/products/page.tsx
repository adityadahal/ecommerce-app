"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Button, Table, Card, Text, Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { ProductModal } from "@/components/dashboard/product-modal";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  unit: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  categoryId: string;
  images: string[];
  category: { name: string };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => notifications.show({ message: "Failed to load products", color: "red" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setEditingProduct(null); setModalOpen(true); };
  const openEdit = (product: Product) => { setEditingProduct(product); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      notifications.show({ message: "Product deleted", color: "green" });
      setDeleteTarget(null);
      fetchProducts();
    } else {
      notifications.show({ message: "Failed to delete product", color: "red" });
    }
    setDeleting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Products</h1>
          <p className="text-sm text-stone-500">{loading ? "..." : `${products.length} products`}</p>
        </div>
        <Button color="green" leftSection={<Plus size={16} />} onClick={openCreate}>Add Product</Button>
      </div>

      <Card shadow="sm" radius="lg" withBorder p={0} className="border-stone-200 bg-white rounded-xl">
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr className="bg-stone-50">
              <Table.Th className="text-stone-600">Product</Table.Th>
              <Table.Th className="text-stone-600">Category</Table.Th>
              <Table.Th className="text-stone-600">Price</Table.Th>
              <Table.Th className="text-stone-600">Stock</Table.Th>
              <Table.Th className="text-stone-600">Status</Table.Th>
              <Table.Th className="text-stone-600">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Table.Tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Table.Td key={j}><Skeleton height={20} radius="sm" /></Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : products.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" py="xl" className="text-stone-400">No products yet</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              products.map((product) => (
                <Table.Tr key={product.id} className="hover:bg-stone-50">
                  <Table.Td>
                    <Text size="sm" fw={500} className="text-stone-700">{product.name}</Text>
                    <Text size="xs" className="text-stone-400">{product.unit}</Text>
                  </Table.Td>
                  <Table.Td><Text size="sm" className="text-stone-700">{product.category.name}</Text></Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={500} className="text-stone-700">{formatPrice(product.price)}</Text>
                    {product.compareAtPrice && (
                      <Text size="xs" className="text-stone-400" td="line-through">{formatPrice(product.compareAtPrice)}</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={product.stock <= 5 ? "red" : undefined} fw={product.stock <= 5 ? 600 : undefined} className={product.stock > 5 ? "text-stone-700" : undefined}>
                      {product.stock}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    {product.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-600">Inactive</span>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <div className="flex gap-2">
                      <Button color="blue" size="compact-sm" leftSection={<Pencil size={14} />} onClick={() => openEdit(product)}>Edit</Button>
                      <Button color="red" size="compact-sm" leftSection={<Trash2 size={14} />} onClick={() => setDeleteTarget(product)}>Delete</Button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <ProductModal opened={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchProducts} product={editingProduct} />

      <ConfirmModal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
