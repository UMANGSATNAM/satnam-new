import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder, isRazorpayConfigured, verifyRazorpaySignature } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";
import { generateOrderNumber } from "@/lib/utils";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

// Create a Razorpay order
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === "create-order") {
    const { amount, customerName, email } = body;
    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    const configured = await isRazorpayConfigured();
    if (!configured) {
      // Return a mock order so the flow can proceed in dev/test mode
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: generateOrderNumber(),
        status: "created",
        mock: true,
        note: "Razorpay not configured. Configure it from Admin Panel → Settings → Integrations.",
      });
    }
    try {
      const receipt = generateOrderNumber();
      const order = await createRazorpayOrder(amount, receipt, {
        customer_name: customerName || "",
        email: email || "",
      });
      return NextResponse.json(order);
    } catch (e) {
      console.error("Razorpay order creation failed:", e);
      return NextResponse.json(
        { error: "Failed to create payment order", detail: (e as Error).message },
        { status: 500 }
      );
    }
  }

  if (action === "verify-and-save") {
    // Verify payment signature and create the final order in DB
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customer,
      items,
      subtotal,
      discount,
      shipping,
      total,
      couponCode,
      paymentMethod,
    } = body;

    let paymentStatus = "PAID";
    let verified = true;

    const rzpConfigured = await isRazorpayConfigured();
    if (rzpConfigured && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
      verified = await verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!verified) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
      }
    } else if (razorpayOrderId?.startsWith("order_mock_")) {
      // Mock mode - allow without signature
      paymentStatus = "PAID";
    } else if (paymentMethod === "COD") {
      paymentStatus = "PENDING";
    }

    const orderNumber = generateOrderNumber();
    const order = await db.order.create({
      data: {
        orderNumber,
        customerName: customer.customerName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        pincode: customer.pincode,
        notes: customer.notes || null,
        subtotal: Number(subtotal),
        discount: Number(discount || 0),
        shipping: Number(shipping || 0),
        total: Number(total),
        couponCode: couponCode || null,
        paymentMethod: paymentMethod || "RAZORPAY",
        paymentStatus,
        razorpayOrderId: razorpayOrderId || null,
        razorpayPaymentId: razorpayPaymentId || null,
        razorpaySignature: razorpaySignature || null,
        status: "CONFIRMED",
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
      console.log("[checkout] Email disabled in settings, skipping emails for", order.orderNumber);
    }

    return NextResponse.json(serialized, { status: 201 });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
