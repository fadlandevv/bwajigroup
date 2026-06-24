import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { storeSettings, DEFAULT_OPENING_HOURS } from "@/lib/db/schema";
import { auth } from "@/lib/auth";

async function getOrCreate() {
  const [existing] = await db.select().from(storeSettings).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(storeSettings)
    .values({ openingHours: JSON.stringify(DEFAULT_OPENING_HOURS) })
    .returning();
  return created;
}

export async function GET() {
  const settings = await getOrCreate();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const settings = await getOrCreate();

  const [updated] = await db
    .update(storeSettings)
    .set({
      storeName: body.storeName ?? settings.storeName,
      storeAddress: body.storeAddress ?? settings.storeAddress,
      storePhone: body.storePhone ?? settings.storePhone,
      storeEmail: body.storeEmail ?? settings.storeEmail,
      openingHours: body.openingHours
        ? JSON.stringify(body.openingHours)
        : settings.openingHours,
      updatedAt: new Date(),
    })
    .returning();

  return NextResponse.json(updated);
}
