import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeCategory } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
  });
  const counts = await db.product.groupBy({
    by: ["categoryId"],
    _count: true,
  });
  const countMap = new Map(counts.map((c) => [c.categoryId, c._count]));
  return NextResponse.json(
    categories.map((c) => serializeCategory(c, countMap.get(c.id) || 0))
  );
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const slug = body.slug || slugify(body.name);
  const maxOrder = await db.category.aggregate({ _max: { order: true } });
  const category = await db.category.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      image: body.image || null,
      color: body.color || "#fef3c7",
      icon: body.icon || "📦",
      order: body.order ?? (maxOrder._max.order || 0) + 1,
    },
  });
  return NextResponse.json(serializeCategory(category), { status: 201 });
}
