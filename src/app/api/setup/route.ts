import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, menuItems } from "@/lib/db/schema";

// One-time setup endpoint to seed the database.
// Protected by SETUP_KEY env var. After seeding, this can be disabled.
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  const setupKey = process.env.SETUP_KEY;

  if (!setupKey || key !== setupKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = process.env.ADMIN_EMAIL ?? "admin@bwajigroup.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin123";
  const hashed = await bcrypt.hash(password, 12);

  await db
    .insert(users)
    .values({ name: "Admin", email, password: hashed, role: "admin" })
    .onConflictDoNothing();

  const seeded = await db
    .insert(menuItems)
    .values([
      // ── Dapur Bwaji ───────────────────────────────────────────────────────
      { brandSlug: "dapur-bwaji", name: "Nasi Goreng Spesial", description: "Nasi goreng dengan telur, ayam suwir, dan kerupuk udang", price: 25000, category: "Nasi", isAvailable: true, isFeatured: true },
      { brandSlug: "dapur-bwaji", name: "Nasi Uduk Komplit", description: "Nasi uduk dengan ayam goreng, tempe orek, dan sambal kacang", price: 28000, category: "Nasi", isAvailable: true, isFeatured: false },
      { brandSlug: "dapur-bwaji", name: "Ayam Bakar Madu", description: "Ayam bakar dengan bumbu madu kecap, disajikan dengan lalapan", price: 35000, category: "Lauk", isAvailable: true, isFeatured: true },
      { brandSlug: "dapur-bwaji", name: "Ikan Goreng Bumbu Kuning", description: "Ikan nila goreng dengan bumbu kuning rempah khas nusantara", price: 32000, category: "Lauk", isAvailable: true, isFeatured: false },
      { brandSlug: "dapur-bwaji", name: "Sayur Asem", description: "Sayur asem segar dengan kacang panjang, jagung, dan labu siam", price: 12000, category: "Sayur", isAvailable: true, isFeatured: false },
      { brandSlug: "dapur-bwaji", name: "Tumis Kangkung Terasi", description: "Kangkung segar ditumis dengan terasi dan cabai merah", price: 10000, category: "Sayur", isAvailable: true, isFeatured: false },
      { brandSlug: "dapur-bwaji", name: "Soto Ayam Bening", description: "Soto ayam kuah bening dengan bihun, telur, dan perkedel", price: 22000, category: "Sup", isAvailable: true, isFeatured: true },
      { brandSlug: "dapur-bwaji", name: "Es Teh Manis", description: "Teh manis segar dengan es batu", price: 6000, category: "Minuman", isAvailable: true, isFeatured: false },
      { brandSlug: "dapur-bwaji", name: "Es Jeruk Peras", description: "Jeruk peras segar dengan es batu, tanpa pemanis buatan", price: 10000, category: "Minuman", isAvailable: true, isFeatured: false },
      { brandSlug: "dapur-bwaji", name: "Tempe Mendoan", description: "Tempe tipis digoreng setengah matang dengan tepung berbumbu", price: 8000, category: "Snack", isAvailable: true, isFeatured: false },
      // ── Hoki Dimsum ──────────────────────────────────────────────────────
      { brandSlug: "hoki-dimsum", name: "Siomay Udang Premium", description: "Siomay kukus isi udang segar dengan saus kacang special", price: 28000, category: "Dimsum", isAvailable: true, isFeatured: true },
      { brandSlug: "hoki-dimsum", name: "Hakau Udang", description: "Dimsum kulit tipis isi udang, dikukus sempurna", price: 30000, category: "Dimsum", isAvailable: true, isFeatured: true },
      { brandSlug: "hoki-dimsum", name: "Cheung Fun Udang", description: "Kulit beras lembut isi udang dengan saus kecap manis", price: 25000, category: "Dimsum", isAvailable: true, isFeatured: false },
      { brandSlug: "hoki-dimsum", name: "Bakpao Ayam", description: "Bakpao kukus isi ayam tumis dengan bumbu BBQ", price: 15000, category: "Bakpao", isAvailable: true, isFeatured: false },
      { brandSlug: "hoki-dimsum", name: "Bakpao Coklat", description: "Bakpao kukus isi coklat lumer, cocok untuk dessert", price: 13000, category: "Bakpao", isAvailable: true, isFeatured: false },
      { brandSlug: "hoki-dimsum", name: "Mie Goreng Hongkong", description: "Mie tipis goreng gaya Hongkong dengan tauge dan daun bawang", price: 35000, category: "Mie", isAvailable: true, isFeatured: true },
      { brandSlug: "hoki-dimsum", name: "Kwetiau Goreng Special", description: "Kwetiau goreng dengan udang, cumi, dan telur", price: 38000, category: "Mie", isAvailable: true, isFeatured: false },
      { brandSlug: "hoki-dimsum", name: "Paket Dimsum 10 Pcs", description: "Pilihan 10 dimsum bebas isi: siomay, hakau, atau cheung fun", price: 55000, category: "Paket", isAvailable: true, isFeatured: true },
      { brandSlug: "hoki-dimsum", name: "Teh Panas Jasmine", description: "Teh jasmine harum khas restoran dimsum", price: 8000, category: "Minuman", isAvailable: true, isFeatured: false },
      { brandSlug: "hoki-dimsum", name: "Susu Kedelai Hangat", description: "Susu kedelai asli, disajikan hangat tanpa pengawet", price: 10000, category: "Minuman", isAvailable: true, isFeatured: false },
    ])
    .onConflictDoNothing()
    .returning({ id: menuItems.id, name: menuItems.name });

  return NextResponse.json({
    ok: true,
    admin: email,
    menuItemsSeeded: seeded.length,
    message: seeded.length > 0
      ? `Berhasil seed ${seeded.length} menu items dan admin user.`
      : "Database sudah berisi data (tidak ada yang ditambahkan).",
  });
}
