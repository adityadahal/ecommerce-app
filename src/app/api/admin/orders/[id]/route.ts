import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const order = await db.order.update({
    where: { id },
    data: { status },
    include: { user: { select: { name: true, email: true } }, items: true },
  });

  return NextResponse.json(order);
}
