import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { inArray, asc, eq, and, lt } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getSessionBrand } from "@/lib/session-brand";

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "ready"] as const;
const AUTO_CONFIRM_MS = 5 * 60 * 1000; // 5 menit

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Auto-confirm pending orders yang sudah > 5 menit
  const cutoff = new Date(Date.now() - AUTO_CONFIRM_MS);
  await db
    .update(orders)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(and(eq(orders.status, "pending"), lt(orders.createdAt, cutoff)));

  const brandFilter = getSessionBrand(session);

  const statusWhere = inArray(orders.status, [...ACTIVE_STATUSES]);
  const activeOrders = await db
    .select()
    .from(orders)
    .where(brandFilter ? and(statusWhere, eq(orders.brandSlug, brandFilter)) : statusWhere)
    .orderBy(asc(orders.createdAt));

  if (activeOrders.length === 0) return NextResponse.json([]);

  const orderIds = activeOrders.map((o) => o.id);
  const allItems = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));

  const itemsByOrderId = allItems.reduce<Record<string, typeof allItems>>(
    (acc, item) => { (acc[item.orderId] ??= []).push(item); return acc; },
    {}
  );

  return NextResponse.json(
    activeOrders.map((o) => ({ ...o, items: itemsByOrderId[o.id] ?? [] }))
  );
}
