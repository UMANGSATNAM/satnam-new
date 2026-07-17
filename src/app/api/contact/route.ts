import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendContactEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, subject, message } = body;
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  await db.contactMessage.create({
    data: { name, email, phone: phone || null, subject, message },
  });
  await sendContactEmail(name, email, phone || "", subject, message);
  return NextResponse.json({ success: true });
}
