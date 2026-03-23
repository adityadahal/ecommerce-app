import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";
import { VALID_ORDER_STATUSES } from "@/lib/constants";

export async function GET(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

  const where: Record<string, unknown> = {};
  if (status && VALID_ORDER_STATUSES.includes(status as typeof VALID_ORDER_STATUSES[number])) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.order.count({ where }),
  ]);

  return NextResponse.json({
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
