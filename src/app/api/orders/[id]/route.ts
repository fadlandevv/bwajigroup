import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { updateOrderStatusSchema } from "@/lib/validations/order";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return NextResponse.json({ ...order, items });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(orders)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(orders.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
