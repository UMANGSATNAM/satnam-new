import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalProducts, totalOrders, pendingOrders, deliveredOrders, lowStockProducts, reviews] =
    await Promise.all([
      db.product.count(),
      db.order.count(),
      db.order.count({ where: { status: "PENDING" } }),
      db.order.count({ where: { status: "DELIVERED" } }),
      db.product.count({ where: { stockQuantity: { lt: 10 } } }),
      db.review.count(),
    ]);

  const revenueResult = await db.order.aggregate({
    _sum: { total: true },
    where: { paymentStatus: "PAID" },
  });

  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const lowStock = await db.product.findMany({
    where: { stockQuantity: { lt: 10 } },
    take: 5,
    select: { id: true, name: true, slug: true, stockQuantity: true, inStock: true },
  });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentOrdersForChart = await db.order.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { total: true, createdAt: true },
  });
  const salesByDay: { date: string; total: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dayOrders = recentOrdersForChart.filter(
      (o) => o.createdAt.toISOString().slice(0, 10) === key
    );
    salesByDay.push({
      date: d.toLocaleDateString("en-IN", { weekday: "short" }),
      total: dayOrders.reduce((s, o) => s + o.total, 0),
      count: dayOrders.length,
    });
  }

  const topProducts = await db.product.findMany({
    take: 5,
    orderBy: { soldCount: "desc" },
    select: { id: true, name: true, slug: true, soldCount: true, price: true, salePrice: true },
  });

  return NextResponse.json({
    totalProducts,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    lowStockProducts,
    totalReviews: reviews,
    totalRevenue: revenueResult._sum.total || 0,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt.toISOString(),
      itemCount: o.items.length,
    })),
    lowStock,
    salesByDay,
    topProducts,
  });
}
