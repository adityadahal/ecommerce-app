"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, TextInput, Textarea, NativeSelect } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { slugify } from "@/lib/utils";

type Category = { id: string; name: string };

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [stock, setStock] = useState("0");
  const [unit, setUnit] = useState("each");
  const [images, setImages] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSlug(slugify(name));
  }, [name]);

  const totalAmount = (parseFloat(price || "0") + parseFloat(gst || "0")).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        description,
        price: parseFloat(price) + (gst ? parseFloat(gst) : 0),
        gst: gst ? parseFloat(gst) : 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId,
        stock: parseInt(stock),
        unit,
        images: images.split("\n").filter(Boolean),
        isActive,
        isFeatured,
      }),
    });

    if (res.ok) {
      notifications.show({ message: "Product created", color: "maroon" });
      router.push("/dashboard/products");
    } else {
      const data = await res.json();
      notifications.show({ message: data.error || "Failed to create product", color: "red" });
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Add Product</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <TextInput label="Slug" value={slug} onChange={(e) => setSlug(e.currentTarget.value)} required />
        </div>
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} rows={3} />
        <div className="grid grid-cols-4 gap-4">
          <TextInput label="Base Price ($)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.currentTarget.value)} required />
          <TextInput label="GST ($)" type="number" step="0.01" min="0" value={gst} onChange={(e) => setGst(e.currentTarget.value)} description="0 = GST free" />
          <TextInput label="Total Amount ($)" value={totalAmount} readOnly variant="filled" />
          <TextInput label="Compare At Price" type="number" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.currentTarget.value)} />
          <NativeSelect
            label="Unit"
            value={unit}
            onChange={(e) => setUnit(e.currentTarget.value)}
            data={[
              { value: "each", label: "Each" },
              { value: "kg", label: "Per kg" },
              { value: "bunch", label: "Per bunch" },
              { value: "pack", label: "Per pack" },
              { value: "litre", label: "Per litre" },
              { value: "dozen", label: "Per dozen" },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <NativeSelect
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.currentTarget.value)}
            required
            data={[
              { value: "", label: "Select category" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <TextInput label="Stock" type="number" value={stock} onChange={(e) => setStock(e.currentTarget.value)} required />
        </div>
        <Textarea label="Image URLs (one per line)" value={images} onChange={(e) => setImages(e.currentTarget.value)} rows={3} placeholder="https://res.cloudinary.com/..." />
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured
          </label>
        </div>
        <div className="flex gap-2">
          <Button type="submit" color="maroon" disabled={loading}>{loading ? "Creating..." : "Create Product"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
