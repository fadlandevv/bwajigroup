import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { menuItemSchema } from "@/lib/validations/menu";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = menuItemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [updated] = await db
    .update(menuItems)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(menuItems.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.delete(menuItems).where(eq(menuItems.id, id));
  return new NextResponse(null, { status: 204 });
}
