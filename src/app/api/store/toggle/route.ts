import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeSettings, DEFAULT_OPENING_HOURS } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { isOpen } = await req.json();
  if (typeof isOpen !== "boolean") {
    return NextResponse.json({ error: "isOpen must be boolean" }, { status: 400 });
  }

  const [existing] = await db.select().from(storeSettings).limit(1);

  if (!existing) {
    const [created] = await db
      .insert(storeSettings)
      .values({ isOpen, openingHours: JSON.stringify(DEFAULT_OPENING_HOURS) })
      .returning();
    return NextResponse.json({ isOpen: created.isOpen });
  }

  const [updated] = await db
    .update(storeSettings)
    .set({ isOpen, updatedAt: new Date() })
    .returning();

  return NextResponse.json({ isOpen: updated.isOpen });
}
