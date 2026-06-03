import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, menuItems } from "@/lib/db/schema";
import { createOrderSchema } from "@/lib/validations/order";
import { inArray } from "drizzle-orm";

export async function GET() {
  const allOrders = await db.select().from(orders);
  return NextResponse.json(allOrders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { brandSlug, customerName, customerPhone, customerNote, paymentMethod, items } =
    parsed.data;

  const menuItemIds = items.map((i) => i.menuItemId);
  const menuData = await db
    .select()
    .from(menuItems)
    .where(inArray(menuItems.id, menuItemIds));

  const menuMap = new Map(menuData.map((m) => [m.id, m]));

  let totalAmount = 0;
  const orderItemsData = items.map((i) => {
    const menu = menuMap.get(i.menuItemId);
    if (!menu) throw new Error(`Menu ${i.menuItemId} tidak ditemukan`);
    const subtotal = menu.price * i.quantity;
    totalAmount += subtotal;
    return {
      menuItemId: i.menuItemId,
      menuItemName: menu.name,
      quantity: i.quantity,
      unitPrice: menu.price,
      subtotal,
    };
  });

  const [order] = await db
    .insert(orders)
    .values({ brandSlug, customerName, customerPhone, customerNote, paymentMethod, totalAmount })
    .returning();

  await db.insert(orderItems).values(
    orderItemsData.map((oi) => ({ ...oi, orderId: order.id }))
  );

  return NextResponse.json(order, { status: 201 });
}
