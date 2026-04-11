import { Clock, Package, Truck, CheckCircle } from "lucide-react";

// Order status colors for Mantine Badge
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: "yellow",
  PROCESSING: "blue",
  OUT_FOR_DELIVERY: "violet",
  DELIVERED: "green",
  CANCELLED: "red",
};

// Payment status colors
export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "gray",
  PAID: "green",
  FAILED: "red",
  REFUNDED: "yellow",
};

// Refund status colors
export const REFUND_STATUS_COLORS: Record<string, string> = {
  NONE: "gray",
  PENDING: "yellow",
  REFUNDED: "green",
  FAILED: "red",
};

// Valid order statuses (matches Prisma enum)
export const VALID_ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type ValidOrderStatus = (typeof VALID_ORDER_STATUSES)[number];

// Valid payment statuses
export const VALID_PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

// Status steps for order tracking UI
export const ORDER_STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
] as const;

// Australian states
export const AU_STATES = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"];

// Delivery slots
export const DELIVERY_SLOTS = [
  "Today 2pm - 6pm",
  "Today 6pm - 9pm",
  "Tomorrow 8am - 12pm",
  "Tomorrow 12pm - 4pm",
  "Tomorrow 4pm - 8pm",
];

// Delivery fee thresholds
export const FREE_DELIVERY_THRESHOLD = 75;
export const DEFAULT_DELIVERY_FEE = 9.95;

// Days of week mapping (JS getDay() returns 0=Sun, 1=Mon, ..., 6=Sat)
const DAY_TO_INDEX: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
  THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

export function getNextDeliveryDate(availableDays: string[]): Date | null {
  if (availableDays.length === 0) return null;
  const now = new Date();
  const todayIndex = now.getDay();
  const dayIndices = availableDays.map((d) => DAY_TO_INDEX[d]).filter((i) => i !== undefined);
  if (dayIndices.length === 0) return null;

  // Find the smallest number of days ahead (minimum 1 — never today)
  let minAhead = 8;
  for (const idx of dayIndices) {
    let ahead = idx - todayIndex;
    if (ahead <= 0) ahead += 7;
    if (ahead < minAhead) minAhead = ahead;
  }
  const result = new Date(now);
  result.setDate(result.getDate() + minAhead);
  return result;
}

export function formatDeliveryDate(date: Date): string {
  return date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
