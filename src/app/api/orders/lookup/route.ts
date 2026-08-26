import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serializeOrder } from "@/lib/serialize";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim();

  if (!query) {
    return NextResponse.json({ error: "Please provide an order number, email, or phone" }, { status: 400 });
  }

  // Check by order number first
  let orders = await db.order.findMany({
    where: {
      OR: [
        { orderNumber: { equals: query } },
        { email: { equals: query.toLowerCase() } },
        { phone: { contains: query } },
      ],
    },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  if (!orders.length && query.length >= 4) {
    // Partial search fallback
    orders = await db.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: query } },
          { email: { contains: query.toLowerCase() } },
        ],
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }

  return NextResponse.json({
    orders: orders.map(serializeOrder),
    count: orders.length,
  });
}
