"use client";

import { useState, useEffect } from "react";
import { Modal, Button, TextInput, Textarea, Select, Checkbox, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { slugify } from "@/lib/utils";

type Category = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  categoryId: string;
  stock: number;
  unit: string;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
};

const UNIT_OPTIONS = [
  { value: "each", label: "Each" },
  { value: "kg", label: "Per kg" },
  { value: "bunch", label: "Per bunch" },
  { value: "pack", label: "Per pack" },
  { value: "litre", label: "Per litre" },
  { value: "dozen", label: "Per dozen" },
];

type Props = {
  opened: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: Product | null;
};

export function ProductModal({ opened, onClose, onSaved, product }: Props) {
  const isEditing = !!product;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>("");
  const [stock, setStock] = useState("0");
  const [unit, setUnit] = useState<string | null>("each");
  const [images, setImages] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (opened) {
      fetch("/api/admin/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    }
  }, [opened]);

  useEffect(() => {
    if (opened && product) {
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setCompareAtPrice(product.compareAtPrice?.toString() || "");
      setCategoryId(product.categoryId);
      setStock(product.stock.toString());
      setUnit(product.unit);
      setImages(product.images.join("\n"));
      setIsActive(product.isActive);
      setIsFeatured(product.isFeatured);
    } else if (opened) {
      setName(""); setSlug(""); setDescription(""); setPrice(""); setCompareAtPrice("");
      setCategoryId(""); setStock("0"); setUnit("each"); setImages("");
      setIsActive(true); setIsFeatured(false);
    }
  }, [opened, product]);

  useEffect(() => {
    if (!isEditing && name) setSlug(slugify(name));
  }, [name, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isEditing ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, slug, description,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId, stock: parseInt(stock), unit,
        images: images.split("\n").filter(Boolean),
        isActive, isFeatured,
      }),
    });

    if (res.ok) {
      notifications.show({ message: isEditing ? "Product updated" : "Product created", color: "green" });
      onSaved();
      onClose();
    } else {
      const data = await res.json();
      notifications.show({ message: data.error || "Failed", color: "red" });
    }
    setLoading(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit Product" : "Add Product"}
      size="lg"
      centered
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <TextInput label="Slug" value={slug} onChange={(e) => setSlug(e.currentTarget.value)} required />
        </div>
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} rows={3} />
        <div className="grid grid-cols-3 gap-4">
          <TextInput label="Price (AUD)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.currentTarget.value)} required />
          <TextInput label="Compare At Price" type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.currentTarget.value)} />
          <Select
            label="Unit"
            value={unit}
            onChange={setUnit}
            data={UNIT_OPTIONS}
            allowDeselect={false}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            data={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select category"
            required
            searchable
          />
          <TextInput label="Stock" type="number" value={stock} onChange={(e) => setStock(e.currentTarget.value)} required />
        </div>
        <Textarea label="Image URLs (one per line)" value={images} onChange={(e) => setImages(e.currentTarget.value)} rows={3} placeholder="https://res.cloudinary.com/..." />
        <Group>
          <Checkbox label="Active" checked={isActive} onChange={(e) => setIsActive(e.currentTarget.checked)} />
          <Checkbox label="Featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.currentTarget.checked)} />
        </Group>
        <Group>
          <Button type="submit" color="green" loading={loading}>{isEditing ? "Save Changes" : "Create Product"}</Button>
          <Button type="button" variant="default" onClick={onClose}>Cancel</Button>
        </Group>
      </form>
    </Modal>
  );
}
