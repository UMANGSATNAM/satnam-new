import Razorpay from "razorpay";
import crypto from "crypto";
import { getSettings } from "./settings";

// Cache of Razorpay instance keyed by keyId+secret so we don't rebuild every request
let cachedInstance: { key: string; instance: Razorpay } | null = null;

function isPlaceholderKey(v: string) {
  return !v || v.includes("1234567890abcdef") || v.includes("xxxx") || v.includes("your-");
}

/**
 * Build a Razorpay instance from the DB-stored settings (with env fallback).
 * Returns null if keys are not configured.
 */
export async function getRazorpay(): Promise<Razorpay | null> {
  const settings = await getSettings();
  const keyId = settings.razorpayKeyId;
  const keySecret = settings.razorpayKeySecret;
  if (isPlaceholderKey(keyId) || isPlaceholderKey(keySecret)) {
    return null;
  }
  const cacheKey = `${keyId}:${keySecret}`;
  if (cachedInstance && cachedInstance.key === cacheKey) {
    return cachedInstance.instance;
  }
  const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  cachedInstance = { key: cacheKey, instance };
  return instance;
}

/** Check whether Razorpay is fully configured (DB or env). */
export async function isRazorpayConfigured(): Promise<boolean> {
  const settings = await getSettings();
  return !isPlaceholderKey(settings.razorpayKeyId) && !isPlaceholderKey(settings.razorpayKeySecret);
}

export async function createRazorpayOrder(amount: number, receipt: string, notes?: Record<string, string>) {
  const rzp = await getRazorpay();
  if (!rzp) return null;
  // amount in paise
  const order = await rzp.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt,
    notes,
  });
  return order;
}

export async function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): Promise<boolean> {
  const settings = await getSettings();
  const keySecret = settings.razorpayKeySecret;
  if (isPlaceholderKey(keySecret)) return false;
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto.createHmac("sha256", keySecret).update(body).digest("hex");
  return expected === signature;
}

/**
 * Test the Razorpay connection by fetching a tiny test order (then cancelling it).
 * Returns { ok: boolean, message: string }.
 */
export async function testRazorpayConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const rzp = await getRazorpay();
    if (!rzp) {
      return { ok: false, message: "Razorpay keys are not configured. Please enter your Key ID and Key Secret." };
    }
    // Create a ₹1 test order to verify the keys work, then cancel it
    const order = await rzp.orders.create({
      amount: 100,
      currency: "INR",
      receipt: `test_${Date.now()}`,
      notes: { test: "admin-connection-check" },
    });
    if (order && order.id) {
      return { ok: true, message: `✅ Connected successfully! Test order created (ID: ${order.id}). Keys are valid.` };
    }
    return { ok: false, message: "Unexpected response from Razorpay. Please verify your keys." };
  } catch (e) {
    const msg = (e as Error).message || String(e);
    return { ok: false, message: `❌ ${msg}` };
  }
}
