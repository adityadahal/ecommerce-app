import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));

  const [zones, total] = await Promise.all([
    db.deliveryZone.findMany({
      orderBy: { postcodeFrom: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.deliveryZone.count(),
  ]);

  return NextResponse.json({
    zones,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
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
      availableDays: data.availableDays || [],
    },
  });
  return NextResponse.json(zone, { status: 201 });
}
