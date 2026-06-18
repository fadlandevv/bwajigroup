import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, sum, count, gte, and, sql } from "drizzle-orm";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total revenue (delivered only)
  const [totalRevenue] = await db
    .select({ total: sum(orders.totalAmount) })
    .from(orders)
    .where(eq(orders.status, "delivered"));

  // Today's revenue
  const [todayRevenue] = await db
    .select({ total: sum(orders.totalAmount) })
    .from(orders)
    .where(and(eq(orders.status, "delivered"), gte(orders.createdAt, todayStart)));

  // This month's revenue
  const [monthRevenue] = await db
    .select({ total: sum(orders.totalAmount) })
    .from(orders)
    .where(and(eq(orders.status, "delivered"), gte(orders.createdAt, monthStart)));

  // Per brand revenue
  const perBrand = await db
    .select({ brand: orders.brandSlug, total: sum(orders.totalAmount), count: count() })
    .from(orders)
    .where(eq(orders.status, "delivered"))
    .groupBy(orders.brandSlug);

  // Per payment method
  const perPayment = await db
    .select({ method: orders.paymentMethod, total: sum(orders.totalAmount), count: count() })
    .from(orders)
    .where(eq(orders.status, "delivered"))
    .groupBy(orders.paymentMethod);

  // Last 7 days chart data (all statuses that reached delivered)
  const chartData = await db
    .select({
      date: sql<string>`DATE("created_at")`,
      total: sum(orders.totalAmount),
      count: count(),
    })
    .from(orders)
    .where(and(eq(orders.status, "delivered"), gte(orders.createdAt, weekAgo)))
    .groupBy(sql`DATE("created_at")`)
    .orderBy(sql`DATE("created_at")`);

  // Order counts by status
  const statusCounts = await db
    .select({ status: orders.status, count: count() })
    .from(orders)
    .groupBy(orders.status);

  return NextResponse.json({
    totalRevenue: Number(totalRevenue.total ?? 0),
    todayRevenue: Number(todayRevenue.total ?? 0),
    monthRevenue: Number(monthRevenue.total ?? 0),
    perBrand,
    perPayment,
    chartData,
    statusCounts,
  });
}
