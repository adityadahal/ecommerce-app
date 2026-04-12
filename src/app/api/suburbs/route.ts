import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const zoneId = searchParams.get("zoneId");

  if (!zoneId) {
    return NextResponse.json([]);
  }

  const suburbs = await db.suburb.findMany({
    where: { deliveryZoneId: zoneId },
    select: { id: true, name: true, postcode: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(suburbs);
}
