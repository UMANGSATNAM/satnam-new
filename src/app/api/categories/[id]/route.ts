import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeCategory } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim();
  if (typeof body.slug === "string" && body.slug.trim()) data.slug = slugify(body.slug);
  for (const k of ["description", "image", "color", "icon"] as const) {
    if (k in body) data[k] = body[k] || null;
  }
  if (body.order !== undefined && Number.isFinite(Number(body.order))) data.order = Number(body.order);
  try {
    const c = await db.category.update({ where: { id }, data });
    return NextResponse.json(serializeCategory(c));
  } catch {
    return NextResponse.json({ error: "Could not update (name or slug may already exist)" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `This category has ${count} products. Move them to another category first.` },
      { status: 400 }
    );
  }
  await db.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
