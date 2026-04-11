"use client";

import { useState, useEffect } from "react";
import { Button, Table, Card, Text, Badge, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus, Trash2, Pencil } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { DeliveryZoneModal } from "@/components/dashboard/delivery-zone-modal";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { TablePagination } from "@/components/dashboard/table-pagination";

const DAY_SHORT: Record<string, string> = {
  MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu",
  FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};

type DeliveryZone = {
  id: string;
  name: string;
  postcodeFrom: string;
  postcodeTo: string;
  deliveryFee: number;
  minOrderForFree: number | null;
  availableDays: string[];
  isActive: boolean;
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

export default function DeliveryZonesPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchZones = (page = pagination.page, limit = pagination.limit) => {
    fetch(`/api/admin/delivery-zones?page=${page}&limit=${limit}`)
      .then((r) => r.json())
      .then((data) => {
        setZones(data.zones);
        setPagination(data.pagination);
      })
      .catch(() => {});
  };

  useEffect(() => { fetchZones(1, pagination.limit); }, []);

  const openCreate = () => { setEditingZone(null); setModalOpen(true); };
  const openEdit = (zone: DeliveryZone) => { setEditingZone(zone); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/delivery-zones/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      notifications.show({ message: "Delivery zone deleted", color: "maroon" });
      setDeleteTarget(null);
      fetchZones(pagination.page, pagination.limit);
    } else {
      notifications.show({ message: "Failed to delete zone", color: "red" });
    }
    setDeleting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Delivery Zones</h1>
          <p className="text-sm text-stone-500">{pagination.total} zones</p>
        </div>
        <Button color="maroon" leftSection={<Plus size={16} />} onClick={openCreate}>Add Zone</Button>
      </div>

      <Card shadow="sm" radius="lg" withBorder p={0} className="border-stone-200 bg-white rounded-xl">
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr className="bg-stone-50">
              <Table.Th className="text-stone-600">Zone</Table.Th>
              <Table.Th className="text-stone-600">Postcodes</Table.Th>
              <Table.Th className="text-stone-600">Delivery Fee</Table.Th>
              <Table.Th className="text-stone-600">Free Delivery Min</Table.Th>
              <Table.Th className="text-stone-600">Delivery Days</Table.Th>
              <Table.Th className="text-stone-600">Status</Table.Th>
              <Table.Th className="text-stone-600">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {zones.map((zone) => (
              <Table.Tr key={zone.id} className="hover:bg-stone-50">
                <Table.Td><Text size="sm" fw={500} className="text-stone-700">{zone.name}</Text></Table.Td>
                <Table.Td><Text size="sm" className="text-stone-700">{zone.postcodeFrom} - {zone.postcodeTo}</Text></Table.Td>
                <Table.Td><Text size="sm" className="text-stone-700">{formatPrice(zone.deliveryFee)}</Text></Table.Td>
                <Table.Td><Text size="sm" className="text-stone-700">{zone.minOrderForFree ? formatPrice(zone.minOrderForFree) : "-"}</Text></Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {zone.availableDays?.length > 0
                      ? zone.availableDays.map((day) => (
                          <Badge key={day} size="xs" variant="light" color="blue">{DAY_SHORT[day] || day}</Badge>
                        ))
                      : <Text size="xs" c="dimmed">None</Text>
                    }
                  </Group>
                </Table.Td>
                <Table.Td>
                  {zone.isActive ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-stone-100 text-stone-600">Inactive</span>
                  )}
                </Table.Td>
                <Table.Td>
                  <div className="flex gap-2">
                    <Button color="blue" size="compact-sm" leftSection={<Pencil size={14} />} onClick={() => openEdit(zone)}>Edit</Button>
                    <Button color="red" size="compact-sm" leftSection={<Trash2 size={14} />} onClick={() => setDeleteTarget(zone)}>Delete</Button>
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
            {zones.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" py="xl" className="text-stone-400">No delivery zones configured</Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <TablePagination
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={(p) => fetchZones(p, pagination.limit)}
        onLimitChange={(l) => fetchZones(1, l)}
      />

      <DeliveryZoneModal opened={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => fetchZones(pagination.page, pagination.limit)} zone={editingZone} />

      <ConfirmModal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Delivery Zone"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
