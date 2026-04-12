"use client";

import { useState, useEffect } from "react";
import { Button, Badge, Collapse, Skeleton, Table, Card, Text, Combobox, InputBase, useCombobox, Group, CloseButton, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { formatPrice } from "@/lib/utils";
import { VALID_ORDER_STATUSES, REFUND_STATUS_COLORS } from "@/lib/constants";
import { ChevronDown, ChevronRight, Phone, Mail, MapPin, Clock, Package, CreditCard, CheckCircle, XCircle, CircleDot } from "lucide-react";
import { TablePagination } from "@/components/dashboard/table-pagination";

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
  deliveryAddress: { street: string; suburb: string; state?: string; postcode: string };
  deliverySlot: string | null;
  cardBrand: string | null;
  cardLast4: string | null;
  refundStatus: string;
  refundedAt: string | null;
  refundAmount: number | null;
  items: { id: string; name: string; price: number; quantity: number }[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const STATUS_OPTIONS = VALID_ORDER_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }));
const FILTER_STATUSES = ["PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
const FILTER_OPTIONS = FILTER_STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }));

const STATUS_CONFIG: Record<string, { color: string; icon: typeof CircleDot }> = {
  PENDING: { color: "var(--mantine-color-yellow-6)", icon: CircleDot },
  PROCESSING: { color: "var(--mantine-color-blue-6)", icon: CircleDot },
  OUT_FOR_DELIVERY: { color: "var(--mantine-color-violet-6)", icon: CircleDot },
  DELIVERED: { color: "var(--mantine-color-green-6)", icon: CheckCircle },
  CANCELLED: { color: "var(--mantine-color-red-6)", icon: XCircle },
};

function StatusCombobox({ value, onChange, disabled }: { value: string; onChange: (val: string) => void; disabled: boolean }) {
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });
  const config = STATUS_CONFIG[value] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  if (disabled) {
    return (
      <InputBase
        component="div"
        size="xs"
        w={170}
        rightSection={<Combobox.Chevron />}
        rightSectionPointerEvents="none"
        styles={{ input: { border: `1.5px solid ${config.color}`, borderRadius: "var(--mantine-radius-md)", cursor: "default", opacity: 0.7 } }}
      >
        <Group gap={6} wrap="nowrap">
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.color, flexShrink: 0 }} />
          <Text size="xs" fw={500}>{value.replace(/_/g, " ")}</Text>
        </Group>
      </InputBase>
    );
  }

  return (
    <Combobox store={combobox} onOptionSubmit={(val) => { onChange(val); combobox.closeDropdown(); }}>
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          size="xs"
          w={170}
          onClick={() => combobox.toggleDropdown()}
          rightSection={<Combobox.Chevron />}
          rightSectionPointerEvents="none"
          styles={{ input: { border: `1.5px solid ${config.color}`, borderRadius: "var(--mantine-radius-md)" } }}
        >
          <Group gap={6} wrap="nowrap">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: config.color, flexShrink: 0 }} />
            <Text size="xs" fw={500}>{value.replace(/_/g, " ")}</Text>
          </Group>
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {STATUS_OPTIONS.filter((opt) => opt.value !== "PENDING").map((opt) => {
            const optConfig = STATUS_CONFIG[opt.value] || STATUS_CONFIG.PENDING;
            return (
              <Combobox.Option key={opt.value} value={opt.value} active={opt.value === value}>
                <Group gap={8} wrap="nowrap">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: optConfig.color, flexShrink: 0 }} />
                  <Text size="xs">{opt.label}</Text>
                </Group>
              </Combobox.Option>
            );
          })}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

function FilterCombobox({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });
  const selectedLabel = value ? value.replace(/_/g, " ") : "";
  const config = value ? STATUS_CONFIG[value] : null;

  return (
    <Combobox store={combobox} onOptionSubmit={(val) => { onChange(val); combobox.closeDropdown(); }}>
      <Combobox.Target>
        <InputBase
          component="button"
          type="button"
          pointer
          w={220}
          onClick={() => combobox.toggleDropdown()}
          rightSection={
            value ? (
              <CloseButton size="sm" onClick={(e) => { e.stopPropagation(); onChange(""); }} />
            ) : (
              <Combobox.Chevron />
            )
          }
          rightSectionPointerEvents={value ? "all" : "none"}
        >
          {value ? (
            <Group gap={8} wrap="nowrap">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: config?.color, flexShrink: 0 }} />
              <Text size="sm" fw={500} tt="capitalize">{selectedLabel}</Text>
            </Group>
          ) : (
            <Text size="sm" c="dimmed">All Orders</Text>
          )}
        </InputBase>
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {FILTER_OPTIONS.map((opt) => {
            const optConfig = STATUS_CONFIG[opt.value];
            return (
              <Combobox.Option key={opt.value} value={opt.value} active={opt.value === value}>
                <Group gap={8} wrap="nowrap">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: optConfig?.color, flexShrink: 0 }} />
                  <Text size="sm">{opt.label}</Text>
                </Group>
              </Combobox.Option>
            );
          })}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

function OrderRow({
  order,
  index,
  expanded,
  onToggle,
  onStatusChange,
}: {
  order: Order;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: string) => void;
}) {
  return (
    <>
      <Table.Tr
        onClick={onToggle}
        className="cursor-pointer hover:bg-stone-50"
        style={{ transition: "background 150ms" }}
      >
        <Table.Td>
          <Text size="xs" fw={500} c="dimmed">{index}</Text>
        </Table.Td>
        <Table.Td>
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown size={14} className="text-stone-400" /> : <ChevronRight size={14} className="text-stone-400" />}
            <Text size="xs" ff="monospace" fw={600} className="text-stone-700">{order.orderNumber}</Text>
          </div>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={500} className="text-stone-700">{order.customerName || "Guest"}</Text>
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={600} className="text-stone-700">{formatPrice(order.total)}</Text>
        </Table.Td>
        <Table.Td onClick={(e) => e.stopPropagation()}>
          <StatusCombobox
            value={order.status}
            onChange={onStatusChange}
            disabled={order.status === "DELIVERED" || order.status === "CANCELLED"}
          />
        </Table.Td>
        <Table.Td>
          <Text size="xs" className="text-stone-400">
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
            <div className="px-6 py-4 bg-stone-50/50">
              <div className="grid gap-4 md:grid-cols-3">
                {/* Customer Info */}
                <Card shadow="0" padding="sm" radius="lg" withBorder className="border-stone-200 bg-white rounded-xl">
                  <Text size="xs" fw={600} className="text-stone-400" mb={8}>CUSTOMER DETAILS</Text>
                  <div className="space-y-2">
                    {order.customerPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-stone-400" />
                        <Text size="sm" className="text-stone-700">{order.customerPhone}</Text>
                      </div>
                    )}
                    {order.customerEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={13} className="text-stone-400" />
                        <Text size="sm" className="text-stone-700">{order.customerEmail}</Text>
                      </div>
                    )}
                    {order.deliveryAddress && (
                      <div className="flex items-start gap-2">
                        <MapPin size={13} className="text-stone-400 mt-0.5" />
                        <Text size="sm" className="text-stone-700">
                          {order.deliveryAddress.street}, {[order.deliveryAddress.suburb, order.deliveryAddress.state, order.deliveryAddress.postcode].filter(Boolean).join(" ")}
                        </Text>
                      </div>
                    )}
                    {order.deliverySlot && (
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-stone-400" />
                        <Text size="sm" className="text-stone-700">{order.deliverySlot}</Text>
                      </div>
                    )}
                    {order.cardBrand && order.cardLast4 && (
                      <div className="flex items-center gap-2">
                        <CreditCard size={13} className="text-gray-400" />
                        <Text size="sm" tt="capitalize">{order.cardBrand} ending in {order.cardLast4}</Text>
                      </div>
                    )}
                    {order.refundStatus && order.refundStatus !== "NONE" && (
                      <div className="mt-2 pt-2 border-t border-stone-200">
                        <Badge size="sm" color={REFUND_STATUS_COLORS[order.refundStatus] || "gray"} variant="light">
                          {order.refundStatus === "PENDING" && "Refund Pending"}
                          {order.refundStatus === "REFUNDED" && `Refunded ${order.refundAmount ? formatPrice(order.refundAmount) : ""}`}
                          {order.refundStatus === "FAILED" && "Refund Failed"}
                        </Badge>
                        {order.refundedAt && (
                          <Text size="xs" c="dimmed" mt={4}>
                            Refunded on {new Date(order.refundedAt).toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })}
                          </Text>
                        )}
                      </div>
                    )}
                  </div>
                </Card>

                {/* Order Items */}
                <Card shadow="0" padding="sm" radius="lg" withBorder className="md:col-span-2 border-stone-200 bg-white rounded-xl">
                  <Text size="xs" fw={600} className="text-stone-400" mb={8}>ORDER ITEMS ({order.items.length})</Text>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package size={13} className="text-stone-400" />
                          <Text size="sm" className="text-stone-700">{item.name}</Text>
                          <Badge size="xs" variant="light" color="gray">x{item.quantity}</Badge>
                        </div>
                        <Text size="sm" fw={500} className="text-stone-700">{formatPrice(item.price * item.quantity)}</Text>
                      </div>
                    ))}
                    <div className="border-t border-stone-200 mt-2 pt-2 space-y-1">
                      <div className="flex justify-between">
                        <Text size="xs" className="text-stone-400">Subtotal</Text>
                        <Text size="xs" className="text-stone-700">{formatPrice(order.subtotal)}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="xs" className="text-stone-400">Delivery</Text>
                        <Text size="xs" className="text-stone-700">{order.deliveryFee === 0 ? "FREE" : formatPrice(order.deliveryFee)}</Text>
                      </div>
                      <div className="flex justify-between">
                        <Text size="xs" className="text-stone-400">GST (incl.)</Text>
                        <Text size="xs" className="text-stone-700">{formatPrice(order.gst)}</Text>
                      </div>
                      <div className="flex justify-between border-t border-stone-200 pt-1">
                        <Text size="sm" fw={700} className="text-stone-900">Total</Text>
                        <Text size="sm" fw={700} className="text-stone-900">{formatPrice(order.total)}</Text>
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
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filter, setFilter] = useState<string | null>("");
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Refund confirmation modal state
  const [refundModalOpened, { open: openRefundModal, close: closeRefundModal }] = useDisclosure(false);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
  const [refundLoading, setRefundLoading] = useState(false);

  // Delivery confirmation modal state
  const [deliverModalOpened, { open: openDeliverModal, close: closeDeliverModal }] = useDisclosure(false);
  const [deliverTarget, setDeliverTarget] = useState<Order | null>(null);
  const [deliverLoading, setDeliverLoading] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchOrders = (page = 1, limit = pagination.limit) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("status", filter);
    params.set("page", String(page));
    params.set("limit", String(limit));
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

  const handleStatusChange = (order: Order, status: string) => {
    // If cancelling a paid order, show refund confirmation modal
    if (status === "CANCELLED" && order.paymentStatus === "PAID" && order.refundStatus === "NONE") {
      setCancelTarget(order);
      openRefundModal();
      return;
    }
    // If marking as delivered, show delivery confirmation modal
    if (status === "DELIVERED") {
      setDeliverTarget(order);
      openDeliverModal();
      return;
    }
    updateStatus(order.id, status);
  };

  const confirmCancelWithRefund = async () => {
    if (!cancelTarget) return;
    setRefundLoading(true);
    const res = await fetch(`/api/admin/orders/${cancelTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    if (res.ok) {
      notifications.show({ message: "Order cancelled — refund initiated", color: "maroon" });
      fetchOrders(pagination.page);
    } else {
      const data = await res.json().catch(() => ({}));
      notifications.show({ message: data.error || "Refund failed", color: "red" });
    }
    setRefundLoading(false);
    closeRefundModal();
    setCancelTarget(null);
  };

  const confirmDelivered = async () => {
    if (!deliverTarget) return;
    setDeliverLoading(true);
    const res = await fetch(`/api/admin/orders/${deliverTarget.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DELIVERED" }),
    });
    if (res.ok) {
      notifications.show({ message: "Order marked as delivered", color: "green" });
      fetchOrders(pagination.page);
    } else {
      const data = await res.json().catch(() => ({}));
      notifications.show({ message: data.error || "Failed to update status", color: "red" });
    }
    setDeliverLoading(false);
    closeDeliverModal();
    setDeliverTarget(null);
  };

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      notifications.show({ message: "Order status updated", color: "maroon" });
      fetchOrders(pagination.page);
    } else {
      const data = await res.json().catch(() => ({}));
      notifications.show({ message: data.error || "Failed to update status", color: "red" });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Orders</h1>
          {!loading && (
            <p className="text-sm text-stone-500">{pagination.total} total orders</p>
          )}
        </div>
        <FilterCombobox value={filter || ""} onChange={(val) => setFilter(val || "")} />
      </div>

      <Card shadow="sm" radius="lg" withBorder p={0} className="border-stone-200 bg-white rounded-xl">
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr className="bg-stone-50">
              <Table.Th className="text-stone-600" w={50}>#</Table.Th>
              <Table.Th className="text-stone-600">Order</Table.Th>
              <Table.Th className="text-stone-600">Customer</Table.Th>
              <Table.Th className="text-stone-600">Total</Table.Th>
              <Table.Th className="text-stone-600">Status</Table.Th>
              <Table.Th className="text-stone-600">Date</Table.Th>
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
                  <Text ta="center" py="xl" className="text-stone-400">No orders found</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              orders.map((order, i) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  index={(pagination.page - 1) * pagination.limit + i + 1}
                  expanded={expandedIds.has(order.id)}
                  onToggle={() => toggleExpand(order.id)}
                  onStatusChange={(status) => handleStatusChange(order, status)}
                />
              ))
            )}
          </Table.Tbody>
        </Table>
      </Card>

      <TablePagination
        page={pagination.page}
        limit={pagination.limit}
        total={pagination.total}
        totalPages={pagination.totalPages}
        onPageChange={(p) => fetchOrders(p, pagination.limit)}
        onLimitChange={(l) => fetchOrders(1, l)}
      />

      {/* Refund Confirmation Modal */}
      <Modal
        opened={refundModalOpened}
        onClose={() => { closeRefundModal(); setCancelTarget(null); }}
        title={<Text fw={700} size="lg">Cancel Order & Refund</Text>}
        centered
      >
        {cancelTarget && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Are you sure you want to cancel this order? A full refund will be issued to the customer.
            </Text>

            <Card withBorder radius="md" padding="sm" className="bg-stone-50">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Order</Text>
                  <Text size="sm" fw={600} ff="monospace">{cancelTarget.orderNumber}</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Refund Amount</Text>
                  <Text size="sm" fw={700} c="maroon.7">{formatPrice(cancelTarget.total)}</Text>
                </Group>
                {cancelTarget.cardBrand && cancelTarget.cardLast4 && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Refund To</Text>
                    <Group gap={6}>
                      <CreditCard size={14} className="text-gray-400" />
                      <Text size="sm" tt="capitalize">{cancelTarget.cardBrand} ending in {cancelTarget.cardLast4}</Text>
                    </Group>
                  </Group>
                )}
                {cancelTarget.customerName && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Customer</Text>
                    <Text size="sm">{cancelTarget.customerName}</Text>
                  </Group>
                )}
              </Stack>
            </Card>

            <Text size="xs" c="dimmed">
              The refund will be processed via Stripe and may take 5–10 business days to appear on the customer&apos;s statement.
            </Text>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => { closeRefundModal(); setCancelTarget(null); }}>
                Keep Order
              </Button>
              <Button color="red" loading={refundLoading} onClick={confirmCancelWithRefund}>
                Cancel & Refund
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Delivery Confirmation Modal */}
      <Modal
        opened={deliverModalOpened}
        onClose={() => { closeDeliverModal(); setDeliverTarget(null); }}
        title={<Text fw={700} size="lg">Confirm Delivery</Text>}
        centered
      >
        {deliverTarget && (
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Are you sure you want to mark this order as delivered? This action cannot be undone.
            </Text>

            <Card withBorder radius="md" padding="sm" className="bg-stone-50">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Order</Text>
                  <Text size="sm" fw={600} ff="monospace">{deliverTarget.orderNumber}</Text>
                </Group>
                {deliverTarget.customerName && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">Customer</Text>
                    <Text size="sm">{deliverTarget.customerName}</Text>
                  </Group>
                )}
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">Total</Text>
                  <Text size="sm" fw={700}>{formatPrice(deliverTarget.total)}</Text>
                </Group>
                {deliverTarget.deliveryAddress && (
                  <Group justify="space-between" align="flex-start">
                    <Text size="sm" c="dimmed">Address</Text>
                    <Text size="sm" ta="right">
                      {deliverTarget.deliveryAddress.street}, {[deliverTarget.deliveryAddress.suburb, deliverTarget.deliveryAddress.postcode].filter(Boolean).join(" ")}
                    </Text>
                  </Group>
                )}
              </Stack>
            </Card>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => { closeDeliverModal(); setDeliverTarget(null); }}>
                Go Back
              </Button>
              <Button color="green" loading={deliverLoading} onClick={confirmDelivered}>
                Confirm Delivered
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </div>
  );
}
