import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { action, name, phone, password } = await req.json();

  if (!phone || !password) {
    return NextResponse.json({ error: "Nomor HP dan password wajib diisi" }, { status: 400 });
  }

  const cleanPhone = phone.trim().replace(/\s+/g, "");

  // ── LOGIN ────────────────────────────────────────────────────────────────
  if (action === "login") {
    const [customer] = await db.select().from(customers).where(eq(customers.phone, cleanPhone));
    if (!customer) {
      return NextResponse.json({ error: "Nomor HP tidak ditemukan. Daftar dulu yuk!" }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, customer.password);
    if (!valid) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }
    return NextResponse.json({ id: customer.id, name: customer.name, phone: customer.phone });
  }

  // ── REGISTER ─────────────────────────────────────────────────────────────
  if (action === "register") {
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Nama minimal 2 karakter" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }
    const existing = await db.select({ id: customers.id }).from(customers).where(eq(customers.phone, cleanPhone));
    if (existing.length > 0) {
      return NextResponse.json({ error: "Nomor HP sudah terdaftar. Silakan login." }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [customer] = await db
      .insert(customers)
      .values({ name: name.trim(), phone: cleanPhone, password: hashed })
      .returning();
    return NextResponse.json({ id: customer.id, name: customer.name, phone: customer.phone }, { status: 201 });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}
