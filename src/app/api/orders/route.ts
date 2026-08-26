import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";
import { getSettings } from "@/lib/settings";

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
  const body = await req.json();

  // Create order from cart (called after Razorpay verification OR for COD)
  const {
    customerName,
    email,
    phone,
    address,
    city,
    state,
    pincode,
    notes,
    items,
    subtotal,
    discount,
    shipping,
    total,
    couponCode,
    paymentMethod,
    paymentStatus,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status,
  } = body;

  if (!customerName || !email || !phone || !address || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const orderNumber = `SSC${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 100)}`;

  const order = await db.order.create({
    data: {
      orderNumber,
      customerName,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      notes: notes || null,
      subtotal: Number(subtotal),
      discount: Number(discount || 0),
      shipping: Number(shipping || 0),
      total: Number(total),
      couponCode: couponCode || null,
      paymentMethod: paymentMethod || "RAZORPAY",
      paymentStatus: paymentStatus || "PENDING",
      razorpayOrderId: razorpayOrderId || null,
      razorpayPaymentId: razorpayPaymentId || null,
      razorpaySignature: razorpaySignature || null,
      status: status || "CONFIRMED",
      items: {
        create: items.map((item: {
          productId?: string;
          name: string;
          image?: string;
          price: number;
          quantity: number;
          weight?: string;
          variant?: string;
          total: number;
        }) => ({
          productId: item.productId || null,
          name: item.name,
          image: item.image || null,
          price: Number(item.price),
          quantity: Number(item.quantity),
          weight: item.weight || null,
          variant: item.variant || null,
          total: Number(item.total),
        })),
      },
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
  if (couponCode) {
    await db.coupon.updateMany({
      where: { code: couponCode },
      data: { usageCount: { increment: 1 } },
    });
  }

  const serialized = serializeOrder(order);
  // Send emails (non-blocking) — only if email integration is enabled in admin settings
  const settings = await getSettings();
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
