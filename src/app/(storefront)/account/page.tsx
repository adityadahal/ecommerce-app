"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button, TextInput, Title, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";

export default function AccountProfilePage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      fetch("/api/profile").then((r) => r.json()).then((data) => setPhone(data.phone || "")).catch(() => {});
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, phone }) });
      if (res.ok) { await update({ name }); notifications.show({ message: "Profile updated", color: "maroon" }); }
    } catch { notifications.show({ message: "Failed to update profile", color: "red" }); }
    setLoading(false);
  };

  return (
    <div>
      <Title order={2} mb="lg">Profile Settings</Title>
      <form onSubmit={handleSubmit}>
        <Stack gap="sm" maw={400}>
          <TextInput label="Email" value={session?.user?.email || ""} disabled />
          <TextInput label="Full Name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
          <TextInput label="Phone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} placeholder="04xx xxx xxx" />
          <Button type="submit" color="maroon" loading={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
        </Stack>
      </form>
    </div>
  );
}
