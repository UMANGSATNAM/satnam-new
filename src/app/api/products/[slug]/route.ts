import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json(serializeProduct(product));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  const body = await req.json();

  const existing = await db.product.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const newSlug = body.slug ? slugify(body.slug) : slug;
  const product = await db.product.update({
    where: { slug },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.slug !== undefined ? { slug: newSlug } : {}),
      ...(body.shortDescription !== undefined ? { shortDescription: body.shortDescription } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.categoryId !== undefined ? { categoryId: body.categoryId } : {}),
      ...(body.images !== undefined ? { images: JSON.stringify(body.images) } : {}),
      ...(body.price !== undefined ? { price: Number(body.price) } : {}),
      ...(body.salePrice !== undefined ? { salePrice: body.salePrice ? Number(body.salePrice) : null } : {}),
      ...(body.variants !== undefined ? { variants: JSON.stringify(body.variants) } : {}),
      ...(body.weight !== undefined ? { weight: body.weight } : {}),
      ...(body.inStock !== undefined ? { inStock: body.inStock } : {}),
      ...(body.stockQuantity !== undefined ? { stockQuantity: Number(body.stockQuantity) } : {}),
      ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
      ...(body.isDealOfDay !== undefined ? { isDealOfDay: body.isDealOfDay } : {}),
      ...(body.isBestseller !== undefined ? { isBestseller: body.isBestseller } : {}),
      ...(body.isNew !== undefined ? { isNew: body.isNew } : {}),
      ...(body.rating !== undefined ? { rating: Number(body.rating) } : {}),
      ...(body.tags !== undefined ? { tags: Array.isArray(body.tags) ? body.tags.join(",") : body.tags } : {}),
      ...(body.ingredients !== undefined ? { ingredients: body.ingredients } : {}),
      ...(body.benefits !== undefined ? { benefits: body.benefits ? JSON.stringify(body.benefits) : null } : {}),
      ...(body.shelfLife !== undefined ? { shelfLife: body.shelfLife } : {}),
      ...(body.storageInfo !== undefined ? { storageInfo: body.storageInfo } : {}),
    },
    include: { category: true },
  });

  return NextResponse.json(serializeProduct(product));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;
  await db.product.delete({ where: { slug } });
  return NextResponse.json({ success: true });
}
