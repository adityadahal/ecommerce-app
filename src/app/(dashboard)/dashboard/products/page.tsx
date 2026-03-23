"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Button, Table, Card, Text, Skeleton, Popover, NumberInput, Group, ActionIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus, Pencil, Trash2, PackagePlus, Check, X } from "lucide-react";
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

function RestockPopover({ product, onUpdated }: { product: Product; onUpdated: () => void }) {
  const [opened, setOpened] = useState(false);
  const [addQty, setAddQty] = useState<number | string>(0);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const qty = typeof addQty === "string" ? parseInt(addQty) : addQty;
    if (!qty || qty <= 0) return;
    setSaving(true);
    const res = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: product.stock + qty }),
    });
    if (res.ok) {
      notifications.show({ message: `Added ${qty} to ${product.name}`, color: "green" });
      setOpened(false);
      setAddQty(0);
      onUpdated();
    } else {
      notifications.show({ message: "Failed to update stock", color: "red" });
    }
    setSaving(false);
  };

  return (
    <Popover opened={opened} onChange={setOpened} position="bottom" withArrow shadow="md">
      <Popover.Target>
        <ActionIcon variant="light" color="green" size="sm" onClick={() => setOpened(true)} title="Add stock">
          <PackagePlus size={14} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Text size="xs" fw={600} mb={6}>Add stock to {product.name}</Text>
        <Group gap="xs">
          <NumberInput
            value={addQty}
            onChange={setAddQty}
            min={1}
            max={9999}
            size="xs"
            w={80}
            placeholder="Qty"
          />
          <ActionIcon color="green" size="md" onClick={handleSave} loading={saving} disabled={!addQty || addQty <= 0}>
            <Check size={14} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray" size="md" onClick={() => { setOpened(false); setAddQty(0); }}>
            <X size={14} />
          </ActionIcon>
        </Group>
        <Text size="xs" c="dimmed" mt={4}>Current: {product.stock} → New: {product.stock + (typeof addQty === "number" ? addQty : parseInt(String(addQty)) || 0)}</Text>
      </Popover.Dropdown>
    </Popover>
  );
}

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
                    <Group gap={6} wrap="nowrap">
                      <Text size="sm" c={product.stock <= 5 ? "red" : undefined} fw={product.stock <= 5 ? 600 : undefined} className={product.stock > 5 ? "text-stone-700" : undefined}>
                        {product.stock}
                      </Text>
                      <RestockPopover product={product} onUpdated={fetchProducts} />
                    </Group>
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
