import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isUnauthorized } from "@/lib/admin-auth";

export async function GET() {
  const result = await requireAdmin();
  if (isUnauthorized(result)) return result;

  const categories = await db.category.findMany({
    include: { children: true, _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
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
