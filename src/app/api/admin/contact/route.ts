import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "unread" | "read" | "all"
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (status === "unread") where.isRead = false;
  if (status === "read") where.isRead = true;

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { subject: { contains: search } },
      { message: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const [messages, unreadCount, totalCount] = await Promise.all([
    db.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    db.contactMessage.count({ where: { isRead: false } }),
    db.contactMessage.count(),
  ]);

  return NextResponse.json({
    messages,
    unreadCount,
    totalCount,
  });
}

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, isRead } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
  }

  const message = await db.contactMessage.update({
    where: { id },
    data: { isRead: Boolean(isRead) },
  });

  return NextResponse.json(message);
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing message ID" }, { status: 400 });
  }

  await db.contactMessage.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
