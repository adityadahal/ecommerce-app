import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  const data = await request.json();

  const suburb = await db.suburb.update({
    where: { id },
    data: {
      name: data.name,
      postcode: data.postcode,
      deliveryZoneId: data.deliveryZoneId,
    },
    include: { deliveryZone: { select: { id: true, name: true } } },
  });
  return NextResponse.json(suburb);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  await db.suburb.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
