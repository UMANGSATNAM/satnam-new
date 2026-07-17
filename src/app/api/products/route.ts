import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeProduct, serializeCategory } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const dealOfDay = searchParams.get("dealOfDay");
  const bestseller = searchParams.get("bestseller");
  const isNew = searchParams.get("new");
  const search = searchParams.get("search");
  const inStock = searchParams.get("inStock");
  const sort = searchParams.get("sort") || "featured";
  const limit = searchParams.get("limit");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const where: Record<string, unknown> = {};
  if (category && category !== "all") {
    const cat = await db.category.findUnique({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }
  if (featured === "true") where.isFeatured = true;
  if (dealOfDay === "true") where.isDealOfDay = true;
  if (bestseller === "true") where.isBestseller = true;
  if (isNew === "true") where.isNew = true;
  if (inStock === "true") where.inStock = true;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { shortDescription: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
    ];
  }
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) (where.price as Record<string, number>).gte = Number(minPrice);
    if (maxPrice) (where.price as Record<string, number>).lte = Number(maxPrice);
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  switch (sort) {
    case "price-low":
      orderBy = { price: "asc" };
      break;
    case "price-high":
      orderBy = { price: "desc" };
      break;
    case "name":
      orderBy = { name: "asc" };
      break;
    case "best-selling":
      orderBy = { soldCount: "desc" };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = { isFeatured: "desc" };
  }

  const products = await db.product.findMany({
    where,
    include: { category: true },
    orderBy,
    ...(limit ? { take: Number(limit) } : {}),
  });

  return NextResponse.json({
    products: products.map(serializeProduct),
    count: products.length,
  });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const slug = body.slug || slugify(body.name);

  const product = await db.product.create({
    data: {
      name: body.name,
      slug,
      shortDescription: body.shortDescription || null,
      description: body.description || "",
      categoryId: body.categoryId,
      images: JSON.stringify(body.images || []),
      price: Number(body.price),
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      variants: JSON.stringify(body.variants || []),
      weight: body.weight || null,
      inStock: body.inStock ?? true,
      stockQuantity: Number(body.stockQuantity || 0),
      isFeatured: body.isFeatured || false,
      isDealOfDay: body.isDealOfDay || false,
      isBestseller: body.isBestseller || false,
      isNew: body.isNew || false,
      rating: Number(body.rating || 4.5),
      reviewCount: Number(body.reviewCount || 0),
      tags: Array.isArray(body.tags) ? body.tags.join(",") : body.tags || "",
      ingredients: body.ingredients || null,
      benefits: body.benefits ? JSON.stringify(body.benefits) : null,
      shelfLife: body.shelfLife || null,
      storageInfo: body.storageInfo || null,
      soldCount: Number(body.soldCount || 0),
    },
    include: { category: true },
  });

  return NextResponse.json(serializeProduct(product), { status: 201 });
}
