import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
  const zoneId = searchParams.get("zoneId");
  const search = searchParams.get("search")?.trim();

  const where: Record<string, unknown> = {};
  if (zoneId) where.deliveryZoneId = zoneId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { postcode: { contains: search } },
    ];
  }

  const [suburbs, total] = await Promise.all([
    db.suburb.findMany({
      where,
      include: { deliveryZone: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.suburb.count({ where }),
  ]);

  return NextResponse.json({
    suburbs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const data = await request.json();

  if (!data.name || !data.postcode || !data.deliveryZoneId) {
    return NextResponse.json({ error: "Name, postcode, and delivery zone are required" }, { status: 400 });
  }

  const suburb = await db.suburb.create({
    data: {
      name: data.name,
      postcode: data.postcode,
      deliveryZoneId: data.deliveryZoneId,
    },
    include: { deliveryZone: { select: { id: true, name: true } } },
  });
  return NextResponse.json(suburb, { status: 201 });
}
