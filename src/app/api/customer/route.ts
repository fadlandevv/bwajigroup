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
    return NextResponse.json({
      id: customer.id, name: customer.name, phone: customer.phone,
      address: customer.address, avatar: customer.avatar ?? null,
    });
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
    return NextResponse.json({
      id: customer.id, name: customer.name, phone: customer.phone,
      address: customer.address, avatar: customer.avatar ?? null,
    }, { status: 201 });
  }

  return NextResponse.json({ error: "Action tidak valid" }, { status: 400 });
}

export async function PATCH(req: NextRequest) {
  const { id, name, address, avatar, currentPassword, newPassword } = await req.json();

  if (!id) return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });

  const [customer] = await db.select().from(customers).where(eq(customers.id, id));
  if (!customer) return NextResponse.json({ error: "Akun tidak ditemukan" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};

  if (name !== undefined) {
    if (name.trim().length < 2) return NextResponse.json({ error: "Nama minimal 2 karakter" }, { status: 400 });
    updates.name = name.trim();
  }

  if (address !== undefined) updates.address = address;

  if (avatar !== undefined) {
    if (avatar && avatar.length > 3_000_000) return NextResponse.json({ error: "Foto terlalu besar (maks 2MB)" }, { status: 413 });
    updates.avatar = avatar;
  }

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "Masukkan password lama" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, customer.password);
    if (!valid) return NextResponse.json({ error: "Password lama salah" }, { status: 401 });
    if (newPassword.length < 6) return NextResponse.json({ error: "Password baru minimal 6 karakter" }, { status: 400 });
    updates.password = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "Tidak ada yang diubah" }, { status: 400 });

  const [updated] = await db.update(customers).set(updates).where(eq(customers.id, id)).returning();
  return NextResponse.json({
    id: updated.id, name: updated.name, phone: updated.phone,
    address: updated.address, avatar: updated.avatar ?? null,
  });
}
