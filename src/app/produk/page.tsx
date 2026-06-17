import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BRANDS } from "@/types/brand";

export const metadata: Metadata = {
  title: "Produk | Bwaji Group",
  description: "Dua brand kuliner unggulan Bwaji Group — Dapur Bwaji & Hoki Dimsum.",
};

export default function ProdukPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── HEADER ── */}
        <section className="bg-[#FAF3EB] px-5 pb-16 pt-32 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C0272D]">Bwaji Group</span>
            <h1
              className="mt-3 text-5xl font-black leading-tight text-[#1A0F0A] sm:text-6xl"
              style={{ fontFamily: "var(--font-archivo)", letterSpacing: "-0.02em" }}
            >
              Produk Kami
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-[#7A6955]">
              Dua brand kuliner dengan karakter unik masing-masing. Pilih brand favoritmu dan jelajahi menu terbaik kami.
            </p>
          </div>
        </section>

        {/* ── BRAND CARDS ── */}
        <section className="bg-[#FFFCF8] px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {BRANDS.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/${brand.slug}`}
                  className="group relative overflow-hidden rounded-3xl p-10 text-white transition-all hover:-translate-y-1 hover:shadow-2xl"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  <div
                    className="absolute inset-0 opacity-25"
                    style={{
                      backgroundImage: `radial-gradient(circle at 90% 10%, ${brand.accentColor}, transparent 55%)`,
                    }}
                  />
                  <div className="relative">
                    <span className="text-xs font-semibold uppercase tracking-widest opacity-70">
                      Bwaji Group
                    </span>
                    <h2
                      className="mt-3 text-4xl font-black leading-tight"
                      style={{ fontFamily: "var(--font-archivo)" }}
                    >
                      {brand.name}
                    </h2>
                    <p className="mt-1 text-sm opacity-75">{brand.tagline}</p>
                    <p className="mt-4 max-w-xs text-sm leading-relaxed opacity-80">
                      {brand.description}
                    </p>
                    <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-semibold transition-colors group-hover:bg-white/35">
                      Lihat Menu <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
