import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandNavbar } from "@/components/layout/brand-navbar";
import { BrandFooter } from "@/components/layout/brand-footer";
import { MenuGrid } from "@/components/menu/menu-grid";
import { MenuCard } from "@/components/menu/menu-card";
import { Marquee } from "@/components/ui/marquee";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { dummyMenuDapurBwaji } from "@/lib/data/dummy-menu";
import { BRANDS } from "@/types/brand";
import type { MenuItem } from "@/types/menu";

export const metadata: Metadata = { title: "Dapur Bwaji" };

const brand = BRANDS.find((b) => b.slug === "dapur-bwaji")!;
const tickerItems = ["Nasi Goreng", "Ayam Bakar Madu", "Rendang Sapi", "Soto Ayam", "NEW MENU", "Gado-Gado", "Bumbu Rempah", "NEW MENU"];

export default async function DapurBwajiPage() {
  let items: MenuItem[] = [];
  try {
    items = (await db.select().from(menuItems).where(eq(menuItems.brandSlug, "dapur-bwaji"))) as MenuItem[];
  } catch { items = dummyMenuDapurBwaji; }

  const featured = items.filter((i) => i.isFeatured).slice(0, 3);
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <>
      <BrandNavbar brand={brand} />
      <main>

        {/* ── 1. HERO ── */}
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#F97316]">
          <div className="flex flex-1 flex-col justify-center px-4 pt-20 lg:px-6">
            <h1
              className="font-black uppercase leading-[0.88] text-white"
              style={{
                fontFamily: "var(--font-archivo)",
                fontSize: "clamp(5rem, 26vw, 32rem)",
                letterSpacing: "-0.025em",
              }}
            >
              DAPUR<br />
              <span className="text-[#1D1A40]">BWAJI.</span>
            </h1>
          </div>

          {/* Food image */}
          <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 h-[55%] w-[30%] min-w-[200px] max-w-[360px] -translate-x-1/2 sm:bottom-12">
            <Image
              src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=700&q=85"
              alt="Nasi Goreng"
              fill
              className="object-contain object-bottom drop-shadow-2xl"
            />
          </div>

          {/* Badge */}
          <div className="absolute right-5 top-[40%] z-20 flex h-24 w-24 rotate-12 select-none items-center justify-center rounded-full bg-[#FAA307] p-3 text-center text-[10px] font-black leading-tight text-white sm:h-28 sm:w-28 sm:text-[11px] lg:right-10">
            Cita<br />Rasa<br />Rumahan!
          </div>

          <div className="relative z-20 flex items-center justify-between border-t border-white/20 px-4 py-4 lg:px-6">
            <p className="text-sm text-white/60">Masakan Nusantara</p>
            <div className="flex flex-wrap gap-2">
              {["Bumbu Rempah", "Bahan Segar", "Halal"].map((t) => (
                <span key={t} className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white">{t}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. SPLIT — like K-Lane section 2 ── */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: featured food image */}
          <div className="relative h-64 overflow-hidden bg-[#1D1A40] md:h-96">
            <Image
              src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80"
              alt="Nasi Goreng"
              fill
              className="object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-end p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">Favorit Pelanggan</p>
                <p className="mt-1 text-3xl font-black text-white" style={{ fontFamily: "var(--font-archivo)" }}>
                  Nasi Goreng<br />Spesial
                </p>
              </div>
            </div>
          </div>
          {/* Right: promo text */}
          <div className="flex flex-col justify-between bg-[#FFF3E8] p-7 md:p-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#70758C]">Dapur Bwaji</p>
              <h2
                className="mt-4 text-4xl font-black leading-tight text-[#1D1A40] md:text-5xl"
                style={{ fontFamily: "var(--font-archivo)" }}
              >
                Masak fresh,<br />
                <span className="text-[#F97316]">disajikan hangat.</span>
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#70758C]">
                Setiap menu dimasak dari bahan segar pilihan dengan bumbu rempah asli yang sudah kami racik sendiri.
              </p>
            </div>
            <Link href="#menu"
              className="mt-8 inline-flex w-fit rounded-full bg-[#F97316] px-6 py-3 text-sm font-bold text-white hover:opacity-80 transition-opacity"
            >
              Lihat Semua Menu ↗
            </Link>
          </div>
        </section>

        {/* ── 3. TICKER ── */}
        <div className="overflow-hidden border-y-4 border-[#1D1A40] bg-[#93F3AA] py-3">
          <Marquee items={tickerItems} className="text-[#1D1A40]" />
        </div>

        {/* ── 4. FEATURED — "NEW MENU" product grid ── */}
        <section className="bg-white px-5 py-16 lg:px-8">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#70758C]">Paling Disukai</p>
              <h2
                className="mt-2 text-5xl font-black text-[#1D1A40] lg:text-6xl"
                style={{ fontFamily: "var(--font-archivo)" }}
              >
                Menu Favorit
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => <MenuCard key={item.id} item={item} />)}
          </div>
        </section>

        {/* ── 5. ALL MENU — K-Lane product grid ── */}
        <section id="menu" className="bg-[#EAEDF6] px-5 py-16 lg:px-8">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#70758C]">Semua Menu</p>
            <h2
              className="mt-2 text-5xl font-black text-[#1D1A40] lg:text-6xl"
              style={{ fontFamily: "var(--font-archivo)" }}
            >
              Pilihan Lengkap
            </h2>
          </div>
          <MenuGrid items={items} categories={categories} />
        </section>

        {/* ── 6. ABOUT — "Stay in touch" equivalent ── */}
        <section id="tentang" className="bg-[#F97316] px-5 py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-white/50">Tentang Kami</p>
          <h2
            className="mt-4 max-w-xl text-5xl font-black leading-[1.0] text-white lg:text-6xl"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            Dapur yang lahir dari cinta masak.
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/70">
            Dapur Bwaji hadir dengan satu tekad — menghidangkan masakan nusantara autentik, dimasak fresh setiap hari.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { v: "30+", l: "Varian Menu" },
              { v: "4.9★", l: "Rating" },
              { v: "100%", l: "Bahan Segar" },
              { v: "Daily", l: "Fresh Cook" },
            ].map(({ v, l }) => (
              <div key={l} className="rounded-xl bg-white/20 p-5 text-center">
                <p className="text-3xl font-black text-white" style={{ fontFamily: "var(--font-archivo)" }}>{v}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">{l}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <BrandFooter brand={brand} />
    </>
  );
}
