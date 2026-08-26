import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";
import { checkRateLimit, sanitizeText } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Rate limiting (max 5 contact messages per minute per IP)
  if (!checkRateLimit(req, 5, 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many messages sent. Please wait a minute before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const name = sanitizeText(body.name);
    const email = sanitizeText(body.email);
    const phone = sanitizeText(body.phone);
    const subject = sanitizeText(body.subject);
    const message = sanitizeText(body.message);

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }

    await db.contactMessage.create({
      data: { name, email, phone: phone || null, subject, message },
    });

    sendContactEmail(name, email, phone || "", subject, message).catch((e) =>
      console.error("Contact email error:", e)
    );

    return NextResponse.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to send contact message" }, { status: 500 });
  }
}
