import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = body;
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  } catch {
    // already subscribed
  }
  return NextResponse.json({ success: true });
}
