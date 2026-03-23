"use client";

import { useState, useEffect } from "react";
import { Button, Table, Card, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus, Trash2, Pencil } from "lucide-react";
import { CategoryModal } from "@/components/dashboard/category-modal";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  parentId: string | null;
  _count: { products: number };
  children: { id: string; name: string; slug: string }[];
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = () => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => { setEditingCategory(null); setModalOpen(true); };
  const openEdit = (cat: Category) => { setEditingCategory(cat); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      notifications.show({ message: "Category deleted", color: "green" });
      setDeleteTarget(null);
      fetchCategories();
    } else {
      notifications.show({ message: "Cannot delete category with products", color: "red" });
    }
    setDeleting(false);
  };

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Categories</h1>
          <p className="text-sm text-stone-500">{rootCategories.length} categories</p>
        </div>
        <Button color="green" leftSection={<Plus size={16} />} onClick={openCreate}>Add Category</Button>
      </div>

      <Card shadow="sm" radius="lg" withBorder p={0} className="border-stone-200 bg-white rounded-xl">
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr className="bg-stone-50">
              <Table.Th className="text-stone-600">Category</Table.Th>
              <Table.Th className="text-stone-600">Slug</Table.Th>
              <Table.Th className="text-stone-600">Products</Table.Th>
              <Table.Th className="text-stone-600">Subcategories</Table.Th>
              <Table.Th className="text-stone-600">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rootCategories.map((cat) => (
              <Table.Tr key={cat.id} className="hover:bg-stone-50">
                <Table.Td>
                  <Text size="sm" fw={500} className="text-stone-700">
                    {cat.image && <span className="mr-2">{cat.image}</span>}
                    {cat.name}
                  </Text>
                </Table.Td>
                <Table.Td><Text size="sm" className="text-stone-400">{cat.slug}</Text></Table.Td>
                <Table.Td><Text size="sm" className="text-stone-700">{cat._count.products}</Text></Table.Td>
                <Table.Td><Text size="sm" className="text-stone-700">{cat.children.length > 0 ? cat.children.map((c) => c.name).join(", ") : "-"}</Text></Table.Td>
                <Table.Td>
                  <div className="flex gap-2">
                    <Button color="blue" size="compact-sm" leftSection={<Pencil size={14} />} onClick={() => openEdit(cat)}>Edit</Button>
                    <Button color="red" size="compact-sm" leftSection={<Trash2 size={14} />} onClick={() => setDeleteTarget(cat)}>Delete</Button>
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
            {rootCategories.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" py="xl" className="text-stone-400">No categories yet</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <CategoryModal opened={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchCategories} category={editingCategory} />

      <ConfirmModal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Products must be reassigned first.`}
      />
    </div>
  );
}
