import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const zones = await db.deliveryZone.findMany({
    orderBy: { postcodeFrom: "asc" },
  });
  return NextResponse.json(zones);
}

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await request.json();
  const zone = await db.deliveryZone.create({ data });
  return NextResponse.json(zone, { status: 201 });
}
