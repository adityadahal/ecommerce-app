"use client";

import { useState, useEffect } from "react";
import { NativeSelect, Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { formatPrice } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
  user: { name: string | null; email: string } | null;
  items: { id: string; name: string; quantity: number }[];
};

const STATUSES = ["PENDING", "PROCESSING", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");

  const fetchOrders = () => {
    const url = filter ? `/api/admin/orders?status=${filter}` : "/api/admin/orders";
    fetch(url).then((r) => r.json()).then(setOrders).catch(() => {});
  };

  useEffect(() => { fetchOrders(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      notifications.show({ message: "Order status updated", color: "green" });
      fetchOrders();
    }
  };

  const getPaymentBadgeColor = (paymentStatus: string) => {
    return paymentStatus === "PAID" ? "green" : "gray";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
        <NativeSelect
          value={filter}
          onChange={(e) => setFilter(e.currentTarget.value)}
          className="w-48"
          data={[
            { value: "", label: "All Orders" },
            ...STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") })),
          ]}
        />
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="px-4 py-3 text-left font-medium">Order</th>
              <th className="px-4 py-3 text-left font-medium">Customer</th>
              <th className="px-4 py-3 text-left font-medium">Items</th>
              <th className="px-4 py-3 text-left font-medium">Total</th>
              <th className="px-4 py-3 text-left font-medium">Payment</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-3 font-mono text-xs">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.customerName || order.user?.name || order.user?.email || "Guest"}</td>
                <td className="px-4 py-3">{order.items.length}</td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <Badge color={getPaymentBadgeColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <NativeSelect
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.currentTarget.value)}
                    className="w-40 text-xs"
                    data={STATUSES.map((s) => ({ value: s, label: s.replace(/_/g, " ") }))}
                  />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("en-AU")}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
