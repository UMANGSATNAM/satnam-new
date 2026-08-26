import { NextRequest } from "next/server";
import { db } from "./db";

// Rate limiting in-memory store: IP -> { count, expiresAt }
const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

/**
 * Basic rate limiting helper.
 * @param req NextRequest object
 * @param limit Max allowed requests within window
 * @param windowMs Window duration in milliseconds (default: 1 minute)
 * @returns boolean true if allowed, false if limit exceeded
 */
export function checkRateLimit(req: NextRequest, limit: number = 30, windowMs: number = 60 * 1000): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.expiresAt) {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count += 1;
  return true;
}

/**
 * Sanitize plain text strings by stripping unsafe HTML tags and script tags to prevent XSS attacks.
 */
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export interface ClientCartItem {
  productId?: string;
  quantity: number;
  weight?: string;
  variant?: string;
}

/**
 * HACKER-PROOF PRICE VALIDATOR:
 * Recalculate order subtotal and shipping cost server-side directly from Prisma Product records.
 * Never trust client-submitted unit prices or total amounts!
 */
export async function calculateVerifiedOrderTotals(items: ClientCartItem[], couponCode?: string) {
  let subtotal = 0;
  const verifiedItems = [];

  for (const item of items) {
    if (!item.productId) {
      throw new Error("Invalid item: Product ID missing");
    }

    const product = await db.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new Error(`Product not found for ID ${item.productId}`);
    }

    // Determine base unit price from DB (sale price or regular price)
    let unitPrice = product.salePrice ?? product.price;

    // Check if variant has specific price in DB variants array
    if (item.variant && product.variants) {
      try {
        const variantsList = JSON.parse(product.variants);
        const match = variantsList.find((v: { value?: string; label?: string; price?: number }) =>
          v.value === item.variant || v.label === item.variant
        );
        if (match && typeof match.price === "number" && match.price > 0) {
          unitPrice = match.price;
        }
      } catch {
        // Fallback to product price
      }
    }

    const qty = Math.max(1, Math.min(100, Math.floor(Number(item.quantity) || 1)));
    const itemTotal = unitPrice * qty;
    subtotal += itemTotal;

    let parsedImage = null;
    if (product.images) {
      try {
        const imgs = JSON.parse(product.images);
        parsedImage = Array.isArray(imgs) ? imgs[0] : null;
      } catch {
        parsedImage = product.images;
      }
    }

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      image: parsedImage,
      price: unitPrice,
      quantity: qty,
      weight: item.weight || product.weight || null,
      variant: item.variant || null,
      total: itemTotal,
    });
  }

  // Calculate discount if coupon applies
  let discount = 0;
  if (couponCode) {
    const coupon = await db.coupon.findUnique({
      where: { code: couponCode.toUpperCase().trim() },
    });

    if (
      coupon &&
      coupon.isActive &&
      (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date()) &&
      coupon.usageCount < coupon.usageLimit &&
      subtotal >= coupon.minOrder
    ) {
      if (coupon.type === "PERCENTAGE") {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.type === "FLAT") {
        discount = Math.min(coupon.value, subtotal);
      }
    }
  }

  // Determine shipping threshold from settings
  const settingsRows = await db.setting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const r of settingsRows) settingsMap[r.key] = r.value;

  const threshold = Number(settingsMap.freeShippingThreshold || 499);
  const baseShippingFee = Number(settingsMap.shippingFee || 49);
  const shipping = subtotal >= threshold ? 0 : baseShippingFee;

  const total = Math.max(0, subtotal - discount + shipping);

  return {
    verifiedItems,
    subtotal,
    discount,
    shipping,
    total,
  };
}
