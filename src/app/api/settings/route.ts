import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/settings";
import { getAdminFromRequest } from "@/lib/auth";
import { isEmailConfigured, sendTestEmail } from "@/lib/email";
import { isRazorpayConfigured, testRazorpayConnection } from "@/lib/razorpay";
import { SECRET_MASK } from "@/lib/types";

export const dynamic = "force-dynamic";

// Mask a secret value for the GET response: show mask if set, empty if not
function maskSecret(v: string | undefined): string {
  if (!v) return "";
  return SECRET_MASK;
}

/** Public GET — returns settings with secrets masked. */
export async function GET() {
  const settings = await getSettings();
  const [emailConfigured, razorpayConfigured] = await Promise.all([
    isEmailConfigured(),
    isRazorpayConfigured(),
  ]);
  return NextResponse.json({
    ...settings,
    // Mask secrets so the client never receives the raw key/password
    razorpayKeySecret: maskSecret(settings.razorpayKeySecret),
    gmailAppPassword: maskSecret(settings.gmailAppPassword),
    // Expose public key id for client-side Razorpay checkout
    razorpayKeyId: settings.razorpayKeyId,
    emailConfigured,
    razorpayConfigured,
  });
}

/** Admin PUT — saves settings. Handles the masked-secret sentinel so unchanged secrets are preserved. */
export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  // Build the patch — skip secret fields that came back as the mask (unchanged)
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value === undefined) continue;
    // If a secret field still has the mask sentinel, skip it (don't overwrite the stored secret)
    if (
      (key === "razorpayKeySecret" || key === "gmailAppPassword") &&
      typeof value === "string" &&
      (value === SECRET_MASK || value === "")
    ) {
      // Only skip if it equals the mask; allow clearing by sending a different non-empty value
      if (value === SECRET_MASK) continue;
    }
    patch[key] = value;
  }

  await saveSettings(patch);
  const settings = await getSettings();
  const [emailConfigured, razorpayConfigured] = await Promise.all([
    isEmailConfigured(),
    isRazorpayConfigured(),
  ]);
  return NextResponse.json({
    ...settings,
    razorpayKeySecret: maskSecret(settings.razorpayKeySecret),
    gmailAppPassword: maskSecret(settings.gmailAppPassword),
    razorpayKeyId: settings.razorpayKeyId,
    emailConfigured,
    razorpayConfigured,
  });
}

/** Admin POST — test email or razorpay connection. */
export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { action } = body;

  if (action === "test-email") {
    // Optionally save latest settings first so the test uses the form values
    if (body.settings) {
      const patch: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(body.settings as Record<string, unknown>)) {
        if (value === undefined) continue;
        if (
          (key === "razorpayKeySecret" || key === "gmailAppPassword") &&
          typeof value === "string" &&
          value === SECRET_MASK
        ) {
          continue;
        }
        patch[key] = value;
      }
      if (Object.keys(patch).length > 0) {
        await saveSettings(patch);
      }
    }
    const result = await sendTestEmail(body.toEmail);
    return NextResponse.json(result);
  }

  if (action === "test-razorpay") {
    if (body.settings) {
      const patch: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(body.settings as Record<string, unknown>)) {
        if (value === undefined) continue;
        if (
          (key === "razorpayKeySecret" || key === "gmailAppPassword") &&
          typeof value === "string" &&
          value === SECRET_MASK
        ) {
          continue;
        }
        patch[key] = value;
      }
      if (Object.keys(patch).length > 0) {
        await saveSettings(patch);
      }
    }
    const result = await testRazorpayConnection();
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
