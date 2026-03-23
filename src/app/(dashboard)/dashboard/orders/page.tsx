"use client";

import { useState, useEffect } from "react";
import { Button, Select, Badge, Collapse, Skeleton, Table, Card, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { formatPrice } from "@/lib/utils";
import { VALID_ORDER_STATUSES, PAYMENT_STATUS_COLORS } from "@/lib/constants";
import { ChevronDown, ChevronRight, Phone, Mail, MapPin, Clock, Package } from "lucide-react";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  gst: number;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  deliveryAddress: { street: string; suburb: string; state: string; postcode: string };
  deliverySlot: string | null;
  items: { id: string; name: string; price: number; quantity: number }[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_OPTIONS = VALID_ORDER_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }));
const FILTER_OPTIONS = [{ value: "", label: "All Orders" }, ...STATUS_OPTIONS];

function OrderRow({
  order,
  expanded,
  onToggle,
  onStatusChange,
}: {
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
}) {
  return (
    <>
      <Table.Tr
        onClick={onToggle}
        className="cursor-pointer"
        style={{ transition: "background 150ms" }}
      >
        <Table.Td>
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            <Text size="xs" ff="monospace" fw={600}>{order.orderNumber}</Text>
          </div>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={500}>{order.customerName || "Guest"}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={600}>{formatPrice(order.total)}</Text>
        </Table.Td>
        <Table.Td>
          <Badge color={PAYMENT_STATUS_COLORS[order.paymentStatus] || "gray"} size="sm">
            {order.paymentStatus}
          </Badge>
        </Table.Td>
        <Table.Td onClick={(e) => e.stopPropagation()}>
          <Select
            value={order.status}
            onChange={(val) => val && onStatusChange(val)}
            data={STATUS_OPTIONS}
            size="xs"
            w={170}
            allowDeselect={false}
          />
        </Table.Td>
        <Table.Td>
          <Text size="xs" c="dimmed">
            {new Date(order.createdAt).toLocaleDateString("en-AU", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </Table.Td>
      </Table.Tr>

      {/* Expandable detail row */}
      <Table.Tr style={{ borderBottom: expanded ? undefined : "none" }}>
        <Table.Td colSpan={6} p={0}>
          <Collapse in={expanded}>
            <div className="px-6 py-4 bg-gray-50/50">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Customer Info */}
                <Card shadow="0" padding="sm" radius="md" withBorder>
                  <Text size="xs" fw={600} c="dimmed" mb={8}>CUSTOMER DETAILS</Text>
                  <div className="space-y-2">
                    {order.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-gray-400" />
                        <Text size="sm">{order.customerPhone}</Text>
                      </div>
                    )}
                    {order.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-gray-400" />
                        <Text size="sm">{order.customerEmail}</Text>
                      </div>
                    )}
                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="text-gray-400 mt-0.5" />
                        <Text size="sm">
                          {order.deliveryAddress.street}, {order.deliveryAddress.suburb} {order.deliveryAddress.state} {order.deliveryAddress.postcode}
                        </Text>
                      </div>
                    )}
                    {order.deliverySlot && (
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-gray-400" />
                        <Text size="sm">{order.deliverySlot}</Text>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Order Items */}
                <Card shadow="0" padding="sm" radius="md" withBorder className="md:col-span-2">
                  <Text size="xs" fw={600} c="dimmed" mb={8}>ORDER ITEMS ({order.items.length})</Text>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package size={13} className="text-gray-400" />
                          <Text size="sm">{item.name}</Text>
                          <Badge size="xs" variant="light" color="gray">x{item.quantity}</Badge>
                        </div>
                        <Text size="sm" fw={500}>{formatPrice(item.price * item.quantity)}</Text>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2 space-y-1">
                      <div className="flex justify-between">
                        <Text size="xs" c="dimmed">Subtotal</Text>
                        <Text size="xs">{formatPrice(order.subtotal)}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="xs" c="dimmed">Delivery</Text>
                        <Text size="xs">{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="xs" c="dimmed">GST (incl.)</Text>
                        <Text size="xs">{formatPrice(order.gst)}</Text>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <Text size="sm" fw={700}>Total</Text>
                        <Text size="sm" fw={700}>{formatPrice(order.total)}</Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  );
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [filter, setFilter] = useState<string | null>("");
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchOrders = (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    params.set("page", String(page));
    params.set("limit", String(pagination.limit));
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders);
        setPagination(data.pagination);
        setExpandedIds(new Set());
      })
      .catch(() => notifications.show({ message: "Failed to load orders", color: "red" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(1); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      notifications.show({ message: "Order status updated", color: "green" });
      fetchOrders(pagination.page);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Text size="xl" fw={700}>Orders</Text>
          {!loading && (
            <Text size="sm" c="dimmed">{pagination.total} total orders</Text>
          )}
        </div>
        <Select
          value={filter}
          onChange={setFilter}
          data={FILTER_OPTIONS}
          w={200}
          placeholder="Filter by status"
          allowDeselect={false}
        />
      </div>

      <Card shadow="sm" radius="md" withBorder p={0}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Order</Table.Th>
              <Table.Th>Customer</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Payment</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Table.Tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Table.Td key={j}><Skeleton height={20} radius="sm" /></Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : orders.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" py="xl" c="dimmed">No orders found</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  expanded={expandedIds.has(order.id)}
                  onToggle={() => toggleExpand(order.id)}
                  onStatusChange={(status) => updateStatus(order.id, status)}
                />
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <Text size="sm" c="dimmed">
            Showing {(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </Text>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="xs"
              disabled={pagination.page <= 1}
              onClick={() => fetchOrders(pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="default"
              size="xs"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchOrders(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
