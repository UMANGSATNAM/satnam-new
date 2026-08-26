import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeReview } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";
import { checkRateLimit, sanitizeText } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const approvedOnly = searchParams.get("approvedOnly") !== "false";

  const where: Record<string, unknown> = {};
  if (productId) where.productId = productId;
  if (approvedOnly) where.approved = true;

  const reviews = await db.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reviews.map(serializeReview));
}

export async function POST(req: NextRequest) {
  // Defensive Security: Rate limit review creation (max 5 per minute per IP)
  if (!checkRateLimit(req, 5, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many review submissions. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const productId = sanitizeText(body.productId);
    const customerName = sanitizeText(body.customerName);
    const email = sanitizeText(body.email);
    const title = sanitizeText(body.title);
    const comment = sanitizeText(body.comment);
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));

    if (!productId || !customerName || !email || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const review = await db.review.create({
      data: {
        productId,
        customerName,
        email,
        rating,
        title: title || null,
        comment,
        verified: true,
        approved: true,
      },
    });

    // Update product rating and review count
    const allReviews = await db.review.findMany({
      where: { productId, approved: true },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await db.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(serializeReview(review), { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { id, approved } = body;
  const review = await db.review.update({
    where: { id },
    data: { approved: Boolean(approved) },
  });
  return NextResponse.json(serializeReview(review));
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }
  await db.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
