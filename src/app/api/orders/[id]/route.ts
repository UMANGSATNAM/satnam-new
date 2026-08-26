import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";
import { getAdminFromRequest } from "@/lib/auth";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const byNumber = searchParams.get("by") === "number";

  const order = byNumber
    ? await db.order.findFirst({
        where: { orderNumber: id },
        include: { items: true },
      })
    : await db.order.findUnique({
        where: { id },
        include: { items: true },
      });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  // Allow access if admin OR if looking up by order number (customer tracking)
  if (!byNumber) {
    const admin = await getAdminFromRequest();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  return NextResponse.json(serializeOrder(order));
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  const order = await db.order.update({
    where: { id },
    data: {
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.paymentStatus !== undefined ? { paymentStatus: body.paymentStatus } : {}),
      ...(body.trackingNumber !== undefined ? { notes: body.trackingNumber } : {}),
    },
    include: { items: true },
  });

  // If admin requested to (re)send order emails, send both confirmation + admin notification
  if (body.sendStatusEmail === true) {
    try {
      await Promise.all([
        sendOrderConfirmationEmail(serializeOrder(order)),
        sendAdminOrderNotification(serializeOrder(order)),
      ]);
    } catch (e) {
      console.error("[orders] Failed to send emails:", e);
    }
  }

  return NextResponse.json(serializeOrder(order));
}
