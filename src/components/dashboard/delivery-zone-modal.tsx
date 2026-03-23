"use client";

import { useState, useEffect } from "react";
import { Modal, Button, TextInput, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";

type DeliveryZone = {
  id: string;
  name: string;
  postcodeFrom: string;
  postcodeTo: string;
  deliveryFee: number;
  minOrderForFree: number | null;
};

type Props = {
  opened: boolean;
  onClose: () => void;
  onSaved: () => void;
  zone?: DeliveryZone | null;
};

export function DeliveryZoneModal({ opened, onClose, onSaved, zone }: Props) {
  const isEditing = !!zone;
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [postcodeFrom, setPostcodeFrom] = useState("");
  const [postcodeTo, setPostcodeTo] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("9.95");
  const [minOrderForFree, setMinOrderForFree] = useState("75");

  useEffect(() => {
    if (opened && zone) {
      setName(zone.name);
      setPostcodeFrom(zone.postcodeFrom);
      setPostcodeTo(zone.postcodeTo);
      setDeliveryFee(zone.deliveryFee.toString());
      setMinOrderForFree(zone.minOrderForFree?.toString() || "");
    } else if (opened) {
      setName(""); setPostcodeFrom(""); setPostcodeTo("");
      setDeliveryFee("9.95"); setMinOrderForFree("75");
    }
  }, [opened, zone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = isEditing ? `/api/admin/delivery-zones/${zone.id}` : "/api/admin/delivery-zones";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        postcodeFrom,
        postcodeTo,
        deliveryFee: parseFloat(deliveryFee),
        minOrderForFree: minOrderForFree ? parseFloat(minOrderForFree) : null,
      }),
    });

    if (res.ok) {
      notifications.show({ message: isEditing ? "Zone updated" : "Zone created", color: "green" });
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
      title={isEditing ? "Edit Delivery Zone" : "Add Delivery Zone"}
      centered
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextInput label="Zone Name" value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="e.g. Melbourne Inner" required />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="From Postcode" value={postcodeFrom} onChange={(e) => setPostcodeFrom(e.currentTarget.value)} placeholder="3000" maxLength={4} required />
          <TextInput label="To Postcode" value={postcodeTo} onChange={(e) => setPostcodeTo(e.currentTarget.value)} placeholder="3999" maxLength={4} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Delivery Fee ($)" type="number" step="0.01" value={deliveryFee} onChange={(e) => setDeliveryFee(e.currentTarget.value)} placeholder="9.95" required />
          <TextInput label="Free Delivery Min ($)" type="number" step="0.01" value={minOrderForFree} onChange={(e) => setMinOrderForFree(e.currentTarget.value)} placeholder="75" />
        </div>
        <Group>
          <Button type="submit" color="green" loading={loading}>{isEditing ? "Save Changes" : "Create Zone"}</Button>
          <Button type="button" variant="default" onClick={onClose}>Cancel</Button>
        </Group>
      </form>
    </Modal>
  );
}
