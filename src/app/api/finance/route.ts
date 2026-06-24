import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, sum, count, gte, and, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const brand = req.nextUrl.searchParams.get("brand") as "dapur-bwaji" | "hoki-dimsum" | null;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const deliveredWhere: SQL = brand
    ? and(eq(orders.status, "delivered"), eq(orders.brandSlug, brand))!
    : eq(orders.status, "delivered");

  const [totalRevenue] = await db.select({ total: sum(orders.totalAmount) }).from(orders).where(deliveredWhere);
  const [todayRevenue] = await db.select({ total: sum(orders.totalAmount) }).from(orders)
    .where(and(deliveredWhere, gte(orders.createdAt, todayStart)));
  const [monthRevenue] = await db.select({ total: sum(orders.totalAmount) }).from(orders)
    .where(and(deliveredWhere, gte(orders.createdAt, monthStart)));

  const perBrand = await db
    .select({ brand: orders.brandSlug, total: sum(orders.totalAmount), count: count() })
    .from(orders).where(deliveredWhere).groupBy(orders.brandSlug);

  const perPayment = await db
    .select({ method: orders.paymentMethod, total: sum(orders.totalAmount), count: count() })
    .from(orders).where(deliveredWhere).groupBy(orders.paymentMethod);

  const chartData = await db
    .select({ date: sql<string>`DATE("created_at")`, total: sum(orders.totalAmount), count: count() })
    .from(orders)
    .where(and(deliveredWhere, gte(orders.createdAt, weekAgo)))
    .groupBy(sql`DATE("created_at")`).orderBy(sql`DATE("created_at")`);

  const statusWhere = brand ? eq(orders.brandSlug, brand) : undefined;
  const statusCounts = await db
    .select({ status: orders.status, count: count() })
    .from(orders).where(statusWhere).groupBy(orders.status);

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
