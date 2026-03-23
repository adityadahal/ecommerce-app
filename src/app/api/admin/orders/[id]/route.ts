import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";
import { VALID_ORDER_STATUSES } from "@/lib/constants";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  const { status } = await request.json();

  if (!VALID_ORDER_STATUSES.includes(status)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const order = await db.order.update({
    where: { id },
    data: { status },
    include: { user: { select: { name: true, email: true } }, items: true },
  });

  return NextResponse.json(order);
}
