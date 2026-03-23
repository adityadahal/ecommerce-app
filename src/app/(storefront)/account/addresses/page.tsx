"use client";

import { useState, useEffect } from "react";
import { Button, TextInput, NativeSelect, Badge, Title, Paper, Group, Stack, Text, ActionIcon } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Trash2, Plus } from "lucide-react";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];
type Address = { id: string; street: string; suburb: string; state: string; postcode: string; isDefault: boolean };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("VIC");
  const [postcode, setPostcode] = useState("");

  const fetchAddresses = () => { fetch("/api/addresses").then((r) => r.json()).then(setAddresses).catch(() => {}); };
  useEffect(() => { fetchAddresses(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ street, suburb, state, postcode, isDefault: addresses.length === 0 }) });
    if (res.ok) { notifications.show({ message: "Address added", color: "green" }); setShowForm(false); setStreet(""); setSuburb(""); setState("VIC"); setPostcode(""); fetchAddresses(); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) { notifications.show({ message: "Address removed", color: "green" }); fetchAddresses(); }
  };

  return (
    <div>
      <Group justify="space-between" mb="lg">
        <Title order={2}>My Addresses</Title>
        <Button color="green" size="sm" leftSection={<Plus size={14} />} onClick={() => setShowForm(!showForm)}>Add Address</Button>
      </Group>

      {showForm && (
        <Paper p="lg" radius="lg" withBorder mb="lg">
          <form onSubmit={handleAdd}>
            <Stack gap="sm">
              <TextInput value={street} onChange={(e) => setStreet(e.currentTarget.value)} placeholder="Street Address" required />
              <Group grow>
                <TextInput value={suburb} onChange={(e) => setSuburb(e.currentTarget.value)} placeholder="Suburb" required />
                <NativeSelect value={state} onChange={(e) => setState(e.currentTarget.value)} data={AU_STATES.map((s) => ({ value: s, label: s }))} />
                <TextInput value={postcode} onChange={(e) => setPostcode(e.currentTarget.value)} placeholder="Postcode" maxLength={4} required />
              </Group>
              <Group>
                <Button type="submit" color="green" size="sm">Save</Button>
                <Button type="button" variant="default" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      )}

      <Stack gap="sm">
        {addresses.map((addr) => (
          <Paper key={addr.id} p="md" radius="lg" withBorder>
            <Group justify="space-between">
              <div>
                <Text fw={500}>{addr.street}</Text>
                <Text size="sm" c="dimmed">{addr.suburb} {addr.state} {addr.postcode}</Text>
              </div>
              <Group gap="xs">
                {addr.isDefault && <Badge color="green">Default</Badge>}
                <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(addr.id)}><Trash2 size={16} /></ActionIcon>
              </Group>
            </Group>
          </Paper>
        ))}
        {addresses.length === 0 && <Text c="dimmed" ta="center" py="xl">No saved addresses</Text>}
      </Stack>
    </div>
  );
}
