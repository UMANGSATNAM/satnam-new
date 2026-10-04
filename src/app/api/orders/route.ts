import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";
import { getSettings } from "@/lib/settings";
import { calculateVerifiedOrderTotals, checkRateLimit, sanitizeText } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const limit = searchParams.get("limit");

  const where: Record<string, unknown> = {};
  if (status && status !== "all") where.status = status;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customerName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const orders = await db.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: Number(limit) } : {}),
  });

  return NextResponse.json(orders.map(serializeOrder));
}

export async function POST(req: NextRequest) {
  // Public endpoint used for Cash-on-Delivery orders. Online (Razorpay) orders go through /api/checkout.
  if (!checkRateLimit(req, 10)) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }
  const body = await req.json();
  const { customerName, email, phone, address, city, state, pincode, notes, items, couponCode } = body;

  if (!customerName || !email || !phone || !address || !Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const settings = await getSettings();
  if (!settings.codEnabled) {
    return NextResponse.json({ error: "Cash on Delivery is not available right now" }, { status: 400 });
  }

  // Never trust prices/totals/status sent by the browser — recalculate everything from the database.
  let verified;
  try {
    verified = await calculateVerifiedOrderTotals(items, couponCode);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Invalid cart" }, { status: 400 });
  }
  const appliedCoupon = couponCode && verified.discount > 0 ? String(couponCode).toUpperCase().trim() : null;

  const orderNumber = `SSC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;

  const order = await db.order.create({
    data: {
      orderNumber,
      customerName: sanitizeText(customerName),
      email: sanitizeText(email),
      phone: sanitizeText(phone),
      address: sanitizeText(address),
      city: sanitizeText(city),
      state: sanitizeText(state),
      pincode: sanitizeText(pincode),
      notes: notes ? sanitizeText(notes) : null,
      subtotal: verified.subtotal,
      discount: verified.discount,
      shipping: verified.shipping,
      total: verified.total,
      couponCode: appliedCoupon,
      paymentMethod: "COD",
      paymentStatus: "PENDING",
      status: "CONFIRMED",
      items: { create: verified.verifiedItems },
    },
    include: { items: true },
  });

  // Decrement stock & increment soldCount
  for (const item of order.items) {
    if (item.productId) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });
    }
  }

  // Increment coupon usage
  if (appliedCoupon) {
    await db.coupon.updateMany({
      where: { code: appliedCoupon },
      data: { usageCount: { increment: 1 } },
    });
  }

  const serialized = serializeOrder(order);
  // Send emails (non-blocking) — only if email integration is enabled in admin settings
  if (settings.emailEnabled) {
    sendOrderConfirmationEmail(serialized).catch((e) =>
      console.error("Confirmation email failed:", e)
    );
    sendAdminOrderNotification(serialized).catch((e) =>
      console.error("Admin notification email failed:", e)
    );
  } else {
    console.log("[orders] Email disabled in settings, skipping emails for", order.orderNumber);
  }

  return NextResponse.json(serialized, { status: 201 });
}
