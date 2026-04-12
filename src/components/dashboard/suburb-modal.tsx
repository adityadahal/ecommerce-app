"use client";

import { useState, useEffect } from "react";
import { Modal, Button, TextInput, Select, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";

type DeliveryZone = { id: string; name: string };

type Suburb = {
  id: string;
  name: string;
  postcode: string;
  deliveryZoneId: string;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  onSaved: () => void;
  suburb?: Suburb | null;
};

export function SuburbModal({ opened, onClose, onSaved, suburb }: Props) {
  const isEditing = !!suburb;
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [deliveryZoneId, setDeliveryZoneId] = useState<string | null>("");

  useEffect(() => {
    if (opened) {
      fetch("/api/admin/delivery-zones?limit=100")
        .then((r) => r.json())
        .then((data) => setZones(data.zones))
        .catch(() => {});
    }
  }, [opened]);

  useEffect(() => {
    if (opened && suburb) {
      setName(suburb.name);
      setPostcode(suburb.postcode);
      setDeliveryZoneId(suburb.deliveryZoneId);
    } else if (opened) {
      setName("");
      setPostcode("");
      setDeliveryZoneId("");
    }
  }, [opened, suburb]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isEditing ? `/api/admin/suburbs/${suburb.id}` : "/api/admin/suburbs";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, postcode, deliveryZoneId }),
    });

    if (res.ok) {
      notifications.show({ message: isEditing ? "Suburb updated" : "Suburb created", color: "maroon" });
      onSaved();
      onClose();
    } else {
      const data = await res.json();
      notifications.show({ message: data.error || "Failed", color: "red" });
    }
    setLoading(false);
  };

  return (
    <Modal opened={opened} onClose={onClose} title={isEditing ? "Edit Suburb" : "Add Suburb"} centered>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Delivery Zone"
          value={deliveryZoneId}
          onChange={setDeliveryZoneId}
          data={zones.map((z) => ({ value: z.id, label: z.name }))}
          placeholder="Select delivery zone"
          required
          searchable
        />
        <TextInput label="Suburb Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
        <TextInput label="Postcode" value={postcode} onChange={(e) => setPostcode(e.currentTarget.value)} maxLength={4} required />
        <Group>
          <Button type="submit" color="maroon" loading={loading}>{isEditing ? "Save Changes" : "Create Suburb"}</Button>
          <Button type="button" variant="default" onClick={onClose}>Cancel</Button>
        </Group>
      </form>
    </Modal>
  );
}
