import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function GET() {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const zones = await db.deliveryZone.findMany({
    orderBy: { postcodeFrom: "asc" },
  });
  return NextResponse.json(zones);
}

export async function POST(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const data = await request.json();

  if (!data.name || !data.postcodeFrom || !data.postcodeTo) {
    return NextResponse.json({ error: "Name and postcode range are required" }, { status: 400 });
  }

  const zone = await db.deliveryZone.create({
    data: {
      name: data.name,
      postcodeFrom: data.postcodeFrom,
      postcodeTo: data.postcodeTo,
      deliveryFee: parseFloat(data.deliveryFee) || 0,
      minOrderForFree: data.minOrderForFree ? parseFloat(data.minOrderForFree) : null,
    },
  });
  return NextResponse.json(zone, { status: 201 });
}
