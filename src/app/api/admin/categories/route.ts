import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function GET(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));

  const where = { parentId: null as string | null };

  const [categories, total] = await Promise.all([
    db.category.findMany({
      where,
      include: { children: true, _count: { select: { products: true } } },
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.category.count({ where }),
  ]);

  return NextResponse.json({
    categories,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const data = await request.json();

  if (!data.name || !data.slug) {
    return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
  }

  const existing = await db.category.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
  }

  const category = await db.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      image: data.image || null,
      parentId: data.parentId || null,
    },
  });
  return NextResponse.json(category, { status: 201 });
}
