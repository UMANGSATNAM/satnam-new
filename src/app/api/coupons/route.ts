import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeCoupon } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons.map(serializeCoupon));
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const validate = searchParams.get("validate");

  if (validate === "true") {
    // Public: validate a coupon code against a cart total
    const body = await req.json();
    const { code, total } = body;
    if (!code) {
      return NextResponse.json({ error: "Coupon code required" }, { status: 400 });
    }
    const coupon = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon" });
    }
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "Coupon has expired" });
    }
    if (coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "Coupon usage limit reached" });
    }
    if (Number(total) < coupon.minOrder) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order of ₹${coupon.minOrder} required`,
      });
    }
    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = (Number(total) * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.value;
    }
    return NextResponse.json({
      valid: true,
      discount: Math.round(discount),
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
    });
  }

  // Admin: create a coupon
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const coupon = await db.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      description: body.description || null,
      type: body.type || "PERCENTAGE",
      value: Number(body.value),
      minOrder: Number(body.minOrder || 0),
      maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
      isActive: body.isActive ?? true,
      usageLimit: Number(body.usageLimit || 100),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });
  return NextResponse.json(serializeCoupon(coupon), { status: 201 });
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
  await db.coupon.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
