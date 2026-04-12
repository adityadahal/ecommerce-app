"use client";

import { useState, useEffect, useRef } from "react";
import { Modal, Button, TextInput, Textarea, Select, Checkbox, Group, Text, Image, ActionIcon, SimpleGrid } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { slugify } from "@/lib/utils";
import { Upload, X, GripVertical } from "lucide-react";

type Category = { id: string; name: string };

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  gst: number;
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [gst, setGst] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>("");
  const [stock, setStock] = useState("0");
  const [unit, setUnit] = useState<string | null>("each");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  useEffect(() => {
    if (opened) {
      fetch("/api/admin/categories").then((r) => r.json()).then((data) => setCategories(data.categories)).catch(() => {});
    }
  }, [opened]);

  useEffect(() => {
    if (opened && product) {
      setName(product.name);
      setSlug(product.slug);
      setDescription(product.description || "");
      setPrice((product.price - (product.gst || 0)).toFixed(2));
      setGst(product.gst?.toString() || "0");
      setCompareAtPrice(product.compareAtPrice?.toString() || "");
      setCategoryId(product.categoryId);
      setStock(product.stock.toString());
      setUnit(product.unit);
      setImageUrls(product.images);
      setIsActive(product.isActive);
      setIsFeatured(product.isFeatured);
    } else if (opened) {
      setName(""); setSlug(""); setDescription(""); setPrice(""); setGst(""); setCompareAtPrice("");
      setCategoryId(""); setStock("0"); setUnit("each"); setImageUrls([]);
      setIsActive(true); setIsFeatured(false);
    }
  }, [opened, product]);

  useEffect(() => {
    if (!isEditing && name) setSlug(slugify(name));
  }, [name, isEditing]);

  const totalAmount = (parseFloat(price || "0") + parseFloat(gst || "0")).toFixed(2);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setImageUrls((prev) => [...prev, ...data.urls]);
        notifications.show({ message: `${data.urls.length} image(s) uploaded`, color: "maroon" });
      } else {
        notifications.show({ message: data.error || "Upload failed", color: "red" });
      }
    } catch {
      notifications.show({ message: "Upload failed", color: "red" });
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= imageUrls.length) return;
    setImageUrls((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

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
        price: parseFloat(price) + (gst ? parseFloat(gst) : 0),
        gst: gst ? parseFloat(gst) : 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        categoryId, stock: parseInt(stock), unit,
        images: imageUrls,
        isActive, isFeatured,
      }),
    });

    if (res.ok) {
      notifications.show({ message: isEditing ? "Product updated" : "Product created", color: "maroon" });
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
      size="xl"
      centered
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <TextInput label="Slug" value={slug} onChange={(e) => setSlug(e.currentTarget.value)} required />
        </div>
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.currentTarget.value)} rows={3} />
        <div className="grid grid-cols-5 gap-4">
          <TextInput label="Base Price ($)" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.currentTarget.value)} required />
          <TextInput label="GST ($)" type="number" step="0.01" min="0" value={gst} onChange={(e) => setGst(e.currentTarget.value)} placeholder="0 = GST free" />
          <TextInput label="Total Amount ($)" value={totalAmount} readOnly variant="filled" />
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

        {/* Image Upload Section */}
        <div>
          <Text size="sm" fw={500} mb={4}>Product Images</Text>

          {imageUrls.length > 0 && (
            <SimpleGrid cols={4} spacing="sm" mb="sm">
              {imageUrls.map((url, index) => (
                <div key={index} className="relative group rounded-md overflow-hidden border" style={{ aspectRatio: "1" }}>
                  <Image src={url} alt={`Product image ${index + 1}`} h="100%" w="100%" fit="cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                    {index > 0 && (
                      <ActionIcon size="sm" variant="filled" color="white" c="dark" onClick={() => moveImage(index, index - 1)} title="Move left">
                        <GripVertical size={12} />
                      </ActionIcon>
                    )}
                    <ActionIcon size="sm" variant="filled" color="red" onClick={() => removeImage(index)} title="Remove">
                      <X size={12} />
                    </ActionIcon>
                  </div>
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-[#800000] text-white text-[10px] px-1.5 py-0.5 rounded">
                      Main
                    </div>
                  )}
                </div>
              ))}
            </SimpleGrid>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
          <Button
            variant="outline"
            color="gray"
            leftSection={<Upload size={16} />}
            onClick={() => fileInputRef.current?.click()}
            loading={uploading}
            fullWidth
          >
            {uploading ? "Uploading..." : "Upload Images"}
          </Button>
          <Text size="xs" c="dimmed" mt={4}>JPEG, PNG, WebP, or AVIF. Max 5MB each.</Text>
        </div>

        <Group>
          <Checkbox label="Active" checked={isActive} onChange={(e) => setIsActive(e.currentTarget.checked)} />
          <Checkbox label="Featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.currentTarget.checked)} />
        </Group>
        <Group>
          <Button type="submit" color="maroon" loading={loading}>{isEditing ? "Save Changes" : "Create Product"}</Button>
          <Button type="button" variant="default" onClick={onClose}>Cancel</Button>
        </Group>
      </form>
    </Modal>
  );
}
