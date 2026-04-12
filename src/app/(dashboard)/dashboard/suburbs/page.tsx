"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Table, Card, Text, Badge, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Plus, Trash2, Pencil, Search } from "lucide-react";
import { SuburbModal } from "@/components/dashboard/suburb-modal";
import { ConfirmModal } from "@/components/dashboard/confirm-modal";
import { TablePagination } from "@/components/dashboard/table-pagination";

type Suburb = {
  id: string;
  name: string;
  postcode: string;
  deliveryZoneId: string;
  deliveryZone: { id: string; name: string };
};

type Pagination = { page: number; limit: number; total: number; totalPages: number };

export default function SuburbsAdminPage() {
  const [suburbs, setSuburbs] = useState<Suburb[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSuburb, setEditingSuburb] = useState<Suburb | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Suburb | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const fetchSuburbs = (page = pagination.page, limit = pagination.limit, query = search) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (query) params.set("search", query);
    fetch(`/api/admin/suburbs?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSuburbs(data.suburbs);
        setPagination(data.pagination);
      })
      .catch(() => {});
  };

  useEffect(() => { fetchSuburbs(1, pagination.limit, ""); }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchSuburbs(1, pagination.limit, value), 300);
  };

  const openCreate = () => { setEditingSuburb(null); setModalOpen(true); };
  const openEdit = (suburb: Suburb) => { setEditingSuburb(suburb); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/suburbs/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      notifications.show({ message: "Suburb deleted", color: "maroon" });
      setDeleteTarget(null);
      fetchSuburbs(pagination.page, pagination.limit);
    } else {
      notifications.show({ message: "Failed to delete suburb", color: "red" });
    }
    setDeleting(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Suburbs</h1>
          <p className="text-sm text-stone-500">{pagination.total} suburbs</p>
        </div>
        <Button color="maroon" leftSection={<Plus size={16} />} onClick={openCreate}>Add Suburb</Button>
      </div>

      <TextInput
        placeholder="Search by suburb name or postcode..."
        leftSection={<Search size={16} />}
        value={search}
        onChange={(e) => handleSearch(e.currentTarget.value)}
        mb="md"
      />

      <Card shadow="sm" radius="lg" withBorder p={0} className="border-stone-200 bg-white rounded-xl">
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr className="bg-stone-50">
              <Table.Th className="text-stone-600">Suburb</Table.Th>
              <Table.Th className="text-stone-600">Postcode</Table.Th>
              <Table.Th className="text-stone-600">Delivery Zone</Table.Th>
              <Table.Th className="text-stone-600">Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {suburbs.map((suburb) => (
              <Table.Tr key={suburb.id} className="hover:bg-stone-50">
                <Table.Td><Text size="sm" fw={500} className="text-stone-700">{suburb.name}</Text></Table.Td>
                <Table.Td><Badge variant="light" color="gray">{suburb.postcode}</Badge></Table.Td>
                <Table.Td><Badge variant="light" color="blue">{suburb.deliveryZone.name}</Badge></Table.Td>
                <Table.Td>
                  <div className="flex gap-2">
                    <Button color="blue" size="compact-sm" leftSection={<Pencil size={14} />} onClick={() => openEdit(suburb)}>Edit</Button>
                    <Button color="red" size="compact-sm" leftSection={<Trash2 size={14} />} onClick={() => setDeleteTarget(suburb)}>Delete</Button>
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
            {suburbs.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" py="xl" className="text-stone-400">No suburbs added yet</Text>
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
        onPageChange={(p) => fetchSuburbs(p, pagination.limit)}
        onLimitChange={(l) => fetchSuburbs(1, l)}
      />

      <SuburbModal opened={modalOpen} onClose={() => setModalOpen(false)} onSaved={() => fetchSuburbs(pagination.page, pagination.limit)} suburb={editingSuburb} />

      <ConfirmModal
        opened={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Suburb"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
