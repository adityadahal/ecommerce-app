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

  const zone = await db.deliveryZone.update({
    where: { id },
    data: {
      name: data.name,
      postcodeFrom: data.postcodeFrom,
      postcodeTo: data.postcodeTo,
      deliveryFee: parseFloat(data.deliveryFee) || 0,
      minOrderForFree: data.minOrderForFree ? parseFloat(data.minOrderForFree) : null,
    },
  });
  return NextResponse.json(zone);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  await db.deliveryZone.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
