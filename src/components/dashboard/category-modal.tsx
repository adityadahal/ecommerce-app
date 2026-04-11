"use client";

import { useState, useEffect } from "react";
import { Modal, Button, TextInput, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { slugify } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  onSaved: () => void;
  category?: Category | null;
};

export function CategoryModal({ opened, onClose, onSaved, category }: Props) {
  const isEditing = !!category;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (opened && category) {
      setName(category.name);
      setSlug(category.slug);
      setImage(category.image || "");
    } else if (opened) {
      setName(""); setSlug(""); setImage("");
    }
  }, [opened, category]);

  useEffect(() => {
    if (!isEditing && name) setSlug(slugify(name));
  }, [name, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isEditing ? `/api/admin/categories/${category.id}` : "/api/admin/categories";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, image: image || null }),
    });

    if (res.ok) {
      notifications.show({ message: isEditing ? "Category updated" : "Category created", color: "maroon" });
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
      title={isEditing ? "Edit Category" : "Add Category"}
      centered
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Category Name" required />
        <TextInput label="Slug" value={slug} onChange={(e) => setSlug(e.currentTarget.value)} placeholder="category-slug" required />
        <TextInput label="Image / Emoji" value={image} onChange={(e) => setImage(e.currentTarget.value)} placeholder="🍎 or image URL" />
        <Group justify="space-between">
          <Group>
            <Button type="submit" color="maroon" loading={loading}>{isEditing ? "Save Changes" : "Create"}</Button>
            <Button type="button" variant="default" onClick={onClose}>Cancel</Button>
          </Group>
        </Group>
      </form>
    </Modal>
  );
}
