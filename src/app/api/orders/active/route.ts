import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { inArray, asc } from "drizzle-orm";

const ACTIVE_STATUSES = ["pending", "confirmed", "preparing", "ready"] as const;

export async function GET() {
  const activeOrders = await db
    .select()
    .from(orders)
    .where(inArray(orders.status, [...ACTIVE_STATUSES]))
    .orderBy(asc(orders.createdAt));

  if (activeOrders.length === 0) return NextResponse.json([]);

  const orderIds = activeOrders.map((o) => o.id);
  const allItems = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, orderIds));

  const itemsByOrderId = allItems.reduce<Record<string, typeof allItems>>(
    (acc, item) => {
      (acc[item.orderId] ??= []).push(item);
      return acc;
    },
    {}
  );

  return NextResponse.json(
    activeOrders.map((o) => ({ ...o, items: itemsByOrderId[o.id] ?? [] }))
  );
}
