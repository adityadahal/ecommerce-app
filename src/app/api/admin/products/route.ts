import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function GET() {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const products = await db.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  try {
    const data = await request.json();

    if (!data.name || !data.slug || !data.categoryId) {
      return NextResponse.json({ error: "Name, slug, and category are required" }, { status: 400 });
    }

    const existing = await db.product.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const product = await db.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: parseFloat(data.price) || 0,
        compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : null,
        images: Array.isArray(data.images) ? data.images : [],
        categoryId: data.categoryId,
        stock: parseInt(data.stock) || 0,
        unit: data.unit || "each",
        isActive: Boolean(data.isActive),
        isFeatured: Boolean(data.isFeatured),
      },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
