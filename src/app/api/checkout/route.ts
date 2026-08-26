import { NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder, isRazorpayConfigured, verifyRazorpaySignature } from "@/lib/razorpay";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";
import { generateOrderNumber } from "@/lib/utils";
import { getSettings } from "@/lib/settings";
import { checkRateLimit, sanitizeText, calculateVerifiedOrderTotals } from "@/lib/security";

export const dynamic = "force-dynamic";

// Create a Razorpay order or verify & save order
export async function POST(req: NextRequest) {
  // Defensive Security: Rate limit checkout API (max 20 checkout attempts per minute per IP)
  if (!checkRateLimit(req, 20, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many checkout requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "create-order") {
      const { items, couponCode, customerName, email } = body;
      
      let verifiedAmount = 0;
      if (items && Array.isArray(items) && items.length > 0) {
        try {
          const verifiedTotals = await calculateVerifiedOrderTotals(items, couponCode);
          verifiedAmount = verifiedTotals.total;
        } catch {
          verifiedAmount = Number(body.amount) || 0;
        }
      } else {
        verifiedAmount = Number(body.amount) || 0;
      }

      if (!verifiedAmount || verifiedAmount < 1) {
        return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
      }

      const configured = await isRazorpayConfigured();
      if (!configured) {
        // Return a mock order so the flow can proceed in dev/test mode
        return NextResponse.json({
          id: `order_mock_${Date.now()}`,
          amount: Math.round(verifiedAmount * 100),
          currency: "INR",
          receipt: generateOrderNumber(),
          status: "created",
          mock: true,
          note: "Razorpay not configured. Configure it from Admin Panel → Settings → Integrations.",
        });
      }

      const receipt = generateOrderNumber();
      const order = await createRazorpayOrder(verifiedAmount, receipt, {
        customer_name: sanitizeText(customerName),
        email: sanitizeText(email),
      });
      return NextResponse.json(order);
    }

    if (action === "verify-and-save") {
      const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        customer,
        items,
        couponCode,
        paymentMethod,
      } = body;

      if (!customer || !items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: "Invalid order payload" }, { status: 400 });
      }

      // Defensive Security: Server-side recalculation of pricing directly from DB!
      let verifiedSubtotal = 0;
      let verifiedDiscount = 0;
      let verifiedShipping = 0;
      let verifiedTotal = 0;
      let verifiedItems = [];

      try {
        const verifiedTotals = await calculateVerifiedOrderTotals(items, couponCode);
        verifiedSubtotal = verifiedTotals.subtotal;
        verifiedDiscount = verifiedTotals.discount;
        verifiedShipping = verifiedTotals.shipping;
        verifiedTotal = verifiedTotals.total;
        verifiedItems = verifiedTotals.verifiedItems;
      } catch (err) {
        return NextResponse.json({ error: (err as Error).message }, { status: 400 });
      }

      let paymentStatus = "PAID";
      let verified = true;

      const rzpConfigured = await isRazorpayConfigured();
      if (rzpConfigured && razorpayOrderId && razorpayPaymentId && razorpaySignature) {
        verified = await verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!verified) {
          return NextResponse.json({ error: "Payment signature verification failed" }, { status: 400 });
        }
      } else if (razorpayOrderId?.startsWith("order_mock_")) {
        paymentStatus = "PAID";
      } else if (paymentMethod === "COD") {
        paymentStatus = "PENDING";
      }

      // Sanitize customer details
      const cleanCustomerName = sanitizeText(customer.customerName);
      const cleanEmail = sanitizeText(customer.email);
      const cleanPhone = sanitizeText(customer.phone);
      const cleanAddress = sanitizeText(customer.address);
      const cleanCity = sanitizeText(customer.city);
      const cleanState = sanitizeText(customer.state);
      const cleanPincode = sanitizeText(customer.pincode);
      const cleanNotes = sanitizeText(customer.notes);

      if (!cleanCustomerName || !cleanEmail || !cleanPhone || !cleanAddress || !cleanPincode) {
        return NextResponse.json({ error: "Required customer fields are missing" }, { status: 400 });
      }

      const orderNumber = generateOrderNumber();
      const order = await db.order.create({
        data: {
          orderNumber,
          customerName: cleanCustomerName,
          email: cleanEmail,
          phone: cleanPhone,
          address: cleanAddress,
          city: cleanCity,
          state: cleanState,
          pincode: cleanPincode,
          notes: cleanNotes || null,
          subtotal: verifiedSubtotal,
          discount: verifiedDiscount,
          shipping: verifiedShipping,
          total: verifiedTotal,
          couponCode: couponCode ? sanitizeText(couponCode).toUpperCase() : null,
          paymentMethod: paymentMethod || "RAZORPAY",
          paymentStatus,
          razorpayOrderId: razorpayOrderId || null,
          razorpayPaymentId: razorpayPaymentId || null,
          razorpaySignature: razorpaySignature || null,
          status: "CONFIRMED",
          items: {
            create: verifiedItems.map((item) => ({
              productId: item.productId,
              name: item.name,
              image: item.image,
              price: item.price,
              quantity: item.quantity,
              weight: item.weight,
              variant: item.variant,
              total: item.total,
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
          where: { code: sanitizeText(couponCode).toUpperCase() },
          data: { usageCount: { increment: 1 } },
        });
      }

      const serialized = serializeOrder(order);
      const settings = await getSettings();
      if (settings.emailEnabled) {
        sendOrderConfirmationEmail(serialized).catch((e) =>
          console.error("Confirmation email failed:", e)
        );
        sendAdminOrderNotification(serialized).catch((e) =>
          console.error("Admin notification email failed:", e)
        );
      }

      return NextResponse.json(serialized, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Checkout route error:", err);
    return NextResponse.json({ error: "Internal server error during checkout" }, { status: 500 });
  }
}
