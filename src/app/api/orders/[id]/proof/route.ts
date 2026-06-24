import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { paymentProof } = await req.json();

  if (!paymentProof || typeof paymentProof !== "string") {
    return NextResponse.json({ error: "paymentProof required" }, { status: 400 });
  }

  // Limit to ~2MB of base64 data
  if (paymentProof.length > 2_800_000) {
    return NextResponse.json({ error: "File terlalu besar (max 2MB)" }, { status: 413 });
  }

  await db
    .update(orders)
    .set({ paymentProof })
    .where(eq(orders.id, id));

  return NextResponse.json({ ok: true });
}
