import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!process.env.SETUP_KEY || key !== process.env.SETUP_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  async function run(label: string, query: string) {
    try {
      await db.execute(sql.raw(query));
      results.push(`✓ ${label}`);
    } catch (e: unknown) {
      const msg = (e as { cause?: { message?: string } })?.cause?.message ?? String(e);
      results.push(`- ${label}: ${msg}`);
    }
  }

  // ── Existing migrations ──────────────────────────────────────────────────
  await run("delivery_type enum", `
    DO $$ BEGIN
      CREATE TYPE "public"."delivery_type" AS ENUM('pickup', 'delivery');
    EXCEPTION WHEN duplicate_object THEN null;
    END $$
  `);
  await run("orders.delivery_type", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_type" "delivery_type" NOT NULL DEFAULT 'pickup'`);
  await run("orders.delivery_address", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_address" text`);
  await run("orders.payment_proof", `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "payment_proof" text`);

  // ── Brand-scoped users ───────────────────────────────────────────────────
  await run("users.brand_slug", `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "brand_slug" "brand_slug"`);

  // ── Store Settings table ─────────────────────────────────────────────────
  await run("store_settings table", `
    CREATE TABLE IF NOT EXISTS "store_settings" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "store_name" text NOT NULL DEFAULT 'Bwaji Group',
      "store_address" text NOT NULL DEFAULT '',
      "store_phone" text NOT NULL DEFAULT '',
      "store_email" text NOT NULL DEFAULT '',
      "is_open" boolean NOT NULL DEFAULT true,
      "opening_hours" text NOT NULL DEFAULT '{}',
      "updated_at" timestamp NOT NULL DEFAULT now()
    )
  `);

  await run("store_settings seed row", `
    INSERT INTO "store_settings" ("store_name", "opening_hours")
    SELECT 'Bwaji Group', '{
      "monday":    {"isOpen":true,"open":"08:00","close":"22:00"},
      "tuesday":   {"isOpen":true,"open":"08:00","close":"22:00"},
      "wednesday": {"isOpen":true,"open":"08:00","close":"22:00"},
      "thursday":  {"isOpen":true,"open":"08:00","close":"22:00"},
      "friday":    {"isOpen":true,"open":"08:00","close":"22:00"},
      "saturday":  {"isOpen":true,"open":"09:00","close":"21:00"},
      "sunday":    {"isOpen":false,"open":"09:00","close":"21:00"}
    }'
    WHERE NOT EXISTS (SELECT 1 FROM "store_settings")
  `);

  // ── Brand Settings table ─────────────────────────────────────────────────
  await run("brand_settings table", `
    CREATE TABLE IF NOT EXISTS "brand_settings" (
      "brand_slug" "brand_slug" PRIMARY KEY,
      "display_name" text NOT NULL,
      "description" text NOT NULL DEFAULT '',
      "phone" text NOT NULL DEFAULT '',
      "address" text NOT NULL DEFAULT '',
      "is_active" boolean NOT NULL DEFAULT true,
      "updated_at" timestamp NOT NULL DEFAULT now()
    )
  `);

  await run("brand_settings seed rows", `
    INSERT INTO "brand_settings" ("brand_slug", "display_name")
    VALUES
      ('dapur-bwaji', 'Dapur Bwaji'),
      ('hoki-dimsum', 'Hoki Dimsum')
    ON CONFLICT ("brand_slug") DO NOTHING
  `);

  await run("brand_settings.is_open", `ALTER TABLE "brand_settings" ADD COLUMN IF NOT EXISTS "is_open" boolean NOT NULL DEFAULT true`);

  // ── Chat Messages table ──────────────────────────────────────────────────
  await run("chat_messages table", `
    CREATE TABLE IF NOT EXISTS "chat_messages" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "session_id" text NOT NULL,
      "brand_slug" text NOT NULL,
      "sender" text NOT NULL,
      "sender_name" text NOT NULL DEFAULT '',
      "message" text NOT NULL,
      "is_read" boolean NOT NULL DEFAULT false,
      "created_at" timestamp NOT NULL DEFAULT now()
    )
  `);

  return NextResponse.json({ ok: true, results });
}
