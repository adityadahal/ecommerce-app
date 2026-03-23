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
