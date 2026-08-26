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
  const search = searchParams.get("search");
  const format = searchParams.get("format"); // "json" | "csv"

  const where: Record<string, unknown> = {};
  if (search) {
    where.email = { contains: search };
  }

  const subscribers = await db.newsletterSubscriber.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  if (format === "csv") {
    const csvRows = [
      ["Email", "Subscribed Date"].join(","),
      ...subscribers.map((s) => `"${s.email}","${s.createdAt.toISOString()}"`),
    ];
    const csvContent = csvRows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="subscribers-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({
    subscribers,
    count: subscribers.length,
  });
}

export async function DELETE(req: NextRequest) {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing subscriber ID" }, { status: 400 });
  }

  await db.newsletterSubscriber.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
