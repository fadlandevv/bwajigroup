import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, menuItems } from "@/lib/db/schema";
import { createOrderSchema } from "@/lib/validations/order";
import { eq, inArray, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get("phone");
  const brand = req.nextUrl.searchParams.get("brand");

  const customerId = req.nextUrl.searchParams.get("customerId");

  if (customerId) {
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerId, customerId))
      .orderBy(desc(orders.createdAt));
    return NextResponse.json(customerOrders);
  }

  if (phone) {
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerPhone, phone))
      .orderBy(desc(orders.createdAt));
    return NextResponse.json(customerOrders);
  }

  const allOrders = brand
    ? await db.select().from(orders).where(eq(orders.brandSlug, brand as "dapur-bwaji" | "hoki-dimsum")).orderBy(desc(orders.createdAt))
    : await db.select().from(orders).orderBy(desc(orders.createdAt));
  return NextResponse.json(allOrders);
}

function generateOrderCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "123456789";
  return (
    letters[Math.floor(Math.random() * letters.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    digits[Math.floor(Math.random() * digits.length)]
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    brandSlug, customerName, customerPhone, customerNote,
    paymentMethod, deliveryType, deliveryAddress, items, customerId,
  } = parsed.data;

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
    .values({
      orderCode: generateOrderCode(),
      customerId: customerId ?? null,
      brandSlug, customerName, customerPhone, customerNote,
      paymentMethod, deliveryType, deliveryAddress: deliveryAddress ?? null, totalAmount,
    })
    .returning();

  await db.insert(orderItems).values(
    orderItemsData.map((oi) => ({ ...oi, orderId: order.id }))
  );

  return NextResponse.json(order, { status: 201 });
}
