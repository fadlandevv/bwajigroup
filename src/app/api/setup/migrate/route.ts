import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!process.env.SETUP_KEY || key !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE "public"."delivery_type" AS ENUM('pickup', 'delivery');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);
    results.push("✓ delivery_type enum created (or already exists)");
  } catch (e: unknown) {
    const cause = (e as { cause?: { message?: string } })?.cause?.message ?? String(e);
    results.push(`- delivery_type enum: ${cause}`);
  }

  try {
    await db.execute(sql`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_type" "delivery_type" NOT NULL DEFAULT 'pickup'`);
    results.push("✓ orders.delivery_type column added");
  } catch (e: unknown) {
    const cause = (e as { cause?: { message?: string } })?.cause?.message ?? String(e);
    results.push(`- orders.delivery_type: ${cause}`);
  }

  try {
    await db.execute(sql`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_address" text`);
    results.push("✓ orders.delivery_address column added");
  } catch (e: unknown) {
    results.push(`- orders.delivery_address: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    await db.execute(sql`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_proof" text`);
    results.push("✓ orders.payment_proof column added");
  } catch (e: unknown) {
    const cause = (e as { cause?: { message?: string } })?.cause?.message ?? String(e);
    results.push(`- orders.payment_proof: ${cause}`);
  }

  return NextResponse.json({ ok: true, results });
}
