"use client";

import { useState, useEffect } from "react";
import { Button, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { slugify } from "@/lib/utils";
import { Plus, Trash2, Pencil } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");

  const fetchCategories = () => {
    fetch("/api/admin/categories").then((r) => r.json()).then(setCategories).catch(() => {});
  };

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (!editingId) setSlug(slugify(name)); }, [name, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, image: image || null }),
    });

    if (res.ok) {
      notifications.show({ message: editingId ? "Category updated" : "Category created", color: "green" });
      setName(""); setSlug(""); setImage(""); setShowForm(false); setEditingId(null);
      fetchCategories();
    } else {
      const data = await res.json();
      notifications.show({ message: data.error || "Failed", color: "red" });
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setImage(cat.image || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products must be reassigned first.")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      notifications.show({ message: "Category deleted", color: "green" });
      fetchCategories();
    } else {
      notifications.show({ message: "Cannot delete category with products", color: "red" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button color="green" leftSection={<Plus size={16} />} onClick={() => { setShowForm(!showForm); setEditingId(null); setName(""); setSlug(""); setImage(""); }}>
          Add Category
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <TextInput value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Category Name" required />
            <TextInput value={slug} onChange={(e) => setSlug(e.currentTarget.value)} placeholder="slug" required />
            <TextInput value={image} onChange={(e) => setImage(e.currentTarget.value)} placeholder="Emoji or image URL" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" color="green" size="sm">{editingId ? "Update" : "Create"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Slug</th>
              <th className="px-4 py-3 text-left font-medium">Products</th>
              <th className="px-4 py-3 text-left font-medium">Subcategories</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.filter((c) => !c.parentId).map((cat) => (
              <tr key={cat.id} className="border-b">
                <td className="px-4 py-3 font-medium">
                  {cat.image && <span className="mr-2">{cat.image}</span>}
                  {cat.name}
                </td>
                <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                <td className="px-4 py-3">{cat._count.products}</td>
                <td className="px-4 py-3">{cat.children.length > 0 ? cat.children.map((c) => c.name).join(", ") : "-"}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(cat)} className="text-primary hover:underline"><Pencil size={14} /></button>
                  <button onClick={() => handleDelete(cat.id)} className="text-red-500 hover:underline"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
