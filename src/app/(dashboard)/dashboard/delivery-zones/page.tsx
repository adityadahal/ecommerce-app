"use client";

import { useState, useEffect } from "react";
import { Button, TextInput, Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type DeliveryZone = {
  id: string;
  name: string;
  postcodeFrom: string;
  postcodeTo: string;
  deliveryFee: number;
  minOrderForFree: number | null;
  isActive: boolean;
};

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [postcodeFrom, setPostcodeFrom] = useState("");
  const [postcodeTo, setPostcodeTo] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("9.95");
  const [minOrderForFree, setMinOrderForFree] = useState("75");

  const fetchZones = () => {
    fetch("/api/admin/delivery-zones").then((r) => r.json()).then(setZones).catch(() => {});
  };

  useEffect(() => { fetchZones(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/delivery-zones", {
      method: "POST",
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
      notifications.show({ message: "Delivery zone created", color: "green" });
      setShowForm(false);
      setName(""); setPostcodeFrom(""); setPostcodeTo("");
      fetchZones();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this delivery zone?")) return;
    const res = await fetch(`/api/admin/delivery-zones/${id}`, { method: "DELETE" });
    if (res.ok) {
      notifications.show({ message: "Delivery zone deleted", color: "green" });
      fetchZones();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Delivery Zones</h2>
        <Button color="green" leftSection={<Plus size={16} />} onClick={() => setShowForm(!showForm)}>
          Add Zone
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 rounded-lg border p-4 space-y-3">
          <div className="grid grid-cols-5 gap-3">
            <TextInput value={name} onChange={(e) => setName(e.currentTarget.value)} placeholder="Zone Name" required />
            <TextInput value={postcodeFrom} onChange={(e) => setPostcodeFrom(e.currentTarget.value)} placeholder="From Postcode" maxLength={4} required />
            <TextInput value={postcodeTo} onChange={(e) => setPostcodeTo(e.currentTarget.value)} placeholder="To Postcode" maxLength={4} required />
            <TextInput type="number" step="0.01" value={deliveryFee} onChange={(e) => setDeliveryFee(e.currentTarget.value)} placeholder="Fee" required />
            <TextInput type="number" step="0.01" value={minOrderForFree} onChange={(e) => setMinOrderForFree(e.currentTarget.value)} placeholder="Free delivery min" />
          </div>
          <div className="flex gap-2">
            <Button type="submit" color="green" size="sm">Create</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium">Zone</th>
              <th className="px-4 py-3 text-left font-medium">Postcodes</th>
              <th className="px-4 py-3 text-left font-medium">Delivery Fee</th>
              <th className="px-4 py-3 text-left font-medium">Free Delivery Min</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id} className="border-b">
                <td className="px-4 py-3 font-medium">{zone.name}</td>
                <td className="px-4 py-3">{zone.postcodeFrom} - {zone.postcodeTo}</td>
                <td className="px-4 py-3">{formatPrice(zone.deliveryFee)}</td>
                <td className="px-4 py-3">{zone.minOrderForFree ? formatPrice(zone.minOrderForFree) : "-"}</td>
                <td className="px-4 py-3">
                  <Badge color={zone.isActive ? "green" : "gray"}>
                    {zone.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(zone.id)} className="text-red-500 hover:underline"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
            {zones.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No delivery zones configured</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
