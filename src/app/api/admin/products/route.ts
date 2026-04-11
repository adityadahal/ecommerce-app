import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));

  const [products, total] = await Promise.all([
    db.product.findMany({
      include: { category: true },
      orderBy: { stock: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.product.count(),
  ]);

  return NextResponse.json({
    products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
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
        gst: typeof data.gst === "number" ? data.gst : parseFloat(data.gst) || 0,
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
