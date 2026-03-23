import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  const data = await request.json();

  const product = await db.product.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: typeof data.price === "number" ? data.price : parseFloat(data.price),
      compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
      images: Array.isArray(data.images) ? data.images : [],
      categoryId: data.categoryId,
      stock: typeof data.stock === "number" ? data.stock : parseInt(data.stock),
      unit: data.unit || "each",
      isActive: Boolean(data.isActive),
      isFeatured: Boolean(data.isFeatured),
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { id } = await params;
  await db.product.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
