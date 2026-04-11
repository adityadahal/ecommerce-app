import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const zones = await db.deliveryZone.findMany({
    where: {
      isActive: true,
      availableDays: { isEmpty: false },
    },
    select: {
      id: true,
      name: true,
      deliveryFee: true,
      minOrderForFree: true,
      availableDays: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(zones);
}
