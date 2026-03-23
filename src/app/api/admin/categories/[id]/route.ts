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

  const category = await db.category.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      image: data.image || null,
      parentId: data.parentId || null,
    },
  });
  return NextResponse.json(category);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
