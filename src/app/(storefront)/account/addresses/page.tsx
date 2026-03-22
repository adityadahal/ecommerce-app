"use client";

import { useState, useEffect } from "react";
import { Button, TextInput, NativeSelect, Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Trash2, Plus } from "lucide-react";

const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

type Address = {
  id: string;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [street, setStreet] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("VIC");
  const [postcode, setPostcode] = useState("");

  const fetchAddresses = () => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then(setAddresses)
      .catch(() => {});
  };

  useEffect(() => { fetchAddresses(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ street, suburb, state, postcode, isDefault: addresses.length === 0 }),
    });
    if (res.ok) {
      notifications.show({ message: "Address added", color: "green" });
      setShowForm(false);
      setStreet(""); setSuburb(""); setState("VIC"); setPostcode("");
      fetchAddresses();
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    if (res.ok) {
      notifications.show({ message: "Address removed", color: "green" });
      fetchAddresses();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <Button color="green" size="sm" leftSection={<Plus size={14} />} onClick={() => setShowForm(!showForm)}>
          Add Address
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-6 rounded-lg border p-4 space-y-3">
          <TextInput value={street} onChange={(e) => setStreet(e.currentTarget.value)} placeholder="Street Address" required />
          <div className="grid grid-cols-3 gap-3">
            <TextInput value={suburb} onChange={(e) => setSuburb(e.currentTarget.value)} placeholder="Suburb" required />
            <NativeSelect
              value={state}
              onChange={(e) => setState(e.currentTarget.value)}
              data={AU_STATES.map((s) => ({ value: s, label: s }))}
            />
            <TextInput value={postcode} onChange={(e) => setPostcode(e.currentTarget.value)} placeholder="Postcode" maxLength={4} required />
          </div>
          <div className="flex gap-2">
            <Button type="submit" color="green" size="sm">Save</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">{addr.street}</p>
              <p className="text-sm text-gray-500">{addr.suburb} {addr.state} {addr.postcode}</p>
            </div>
            <div className="flex items-center gap-2">
              {addr.isDefault && <Badge color="green">Default</Badge>}
              <Button variant="subtle" size="compact-sm" onClick={() => handleDelete(addr.id)}>
                <Trash2 size={16} className="text-red-500" />
              </Button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <p className="text-center text-gray-500 py-8">No saved addresses</p>
        )}
      </div>
    </div>
  );
}
