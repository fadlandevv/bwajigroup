import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BRANDS } from "@/types/brand";

const stats = [
  { v: "2", l: "Brand Kuliner" },
  { v: "50+", l: "Varian Menu" },
  { v: "4.9★", l: "Rating Rata-rata" },
  { v: "100%", l: "Halal & Fresh" },
];

const values = [
  { title: "Bahan Segar Pilihan", desc: "Setiap menu dimasak dari bahan yang fresh, dipilih langsung setiap paginya." },
  { title: "Rasa Autentik Nusantara", desc: "Resep bumbu rempah asli khas Indonesia yang sudah kami racik sendiri." },
  { title: "Harga yang Terjangkau", desc: "Kualitas terbaik dengan harga yang ramah di kantong untuk semua kalangan." },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── HERO ── */}
        <section className="bg-[#FFFCF8] px-5 pt-16 lg:px-8">
          <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 py-24 md:flex-row md:gap-16">

            {/* Text */}
            <div className="flex-1">
              <span className="inline-block rounded-full bg-[#FEF2F2] px-4 py-1.5 text-xs font-semibold text-[#C0272D]">
                Grup Kuliner Indonesia 🇮🇩
              </span>
              <h1
                className="mt-5 text-5xl font-black leading-tight text-[#1A0F0A] sm:text-6xl lg:text-7xl"
                style={{ fontFamily: "var(--font-archivo)", letterSpacing: "-0.02em" }}
              >
                Cita Rasa<br />
                Rumahan yang<br />
                <span className="text-[#C0272D]">Menggugah.</span>
              </h1>
              <p className="mt-5 max-w-md text-base leading-relaxed text-[#7A6955]">
                Bwaji Group menghadirkan pengalaman makan terbaik melalui dua brand kuliner unggulan — masakan nusantara dan dimsum premium.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/produk"
                  className="inline-flex items-center gap-2 rounded-full bg-[#C0272D] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-85"
                >
                  Lihat Produk <ArrowRight size={15} />
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E8D5C0] bg-white px-6 py-3 text-sm font-semibold text-[#1A0F0A] transition-colors hover:bg-[#FAF3EB]"
                >
                  Tentang Kami
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-5">
                {["Halal", "Fresh Daily", "Bumbu Rempah Asli"].map((t) => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-[#7A6955]">
                    <CheckCircle size={14} className="text-[#C0272D]" />
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className="relative w-full flex-1 md:max-w-[460px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#FAF3EB]">
                <Image
                  src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85"
                  alt="Bwaji Group Food"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -left-4 rounded-2xl bg-white p-4 shadow-lg shadow-black/10">
                <p className="text-xs font-medium text-[#7A6955]">Rating Pelanggan</p>
                <p
                  className="text-2xl font-black text-[#1A0F0A]"
                  style={{ fontFamily: "var(--font-archivo)" }}
                >
                  4.9 ★
                </p>
              </div>
              <div className="absolute -right-4 top-8 rounded-2xl bg-[#C0272D] p-4 text-white shadow-lg shadow-red-900/20">
                <p className="text-xs font-medium opacity-80">Menu Tersedia</p>
                <p
                  className="text-2xl font-black"
                  style={{ fontFamily: "var(--font-archivo)" }}
                >
                  50+
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="border-y border-[#E8D5C0] bg-[#FAF3EB]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[#E8D5C0] px-5 sm:grid-cols-4 lg:px-8">
            {stats.map(({ v, l }) => (
              <div key={l} className="py-7 text-center">
                <p
                  className="text-3xl font-black text-[#1A0F0A]"
                  style={{ fontFamily: "var(--font-archivo)" }}
                >
                  {v}
                </p>
                <p className="mt-1 text-xs text-[#7A6955]">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── BRAND SECTION ── */}
        <section className="bg-[#FFFCF8] px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C0272D]">Brand Kami</span>
              <h2
                className="mt-2 text-4xl font-black text-[#1A0F0A]"
                style={{ fontFamily: "var(--font-archivo)" }}
              >
                Dua Brand, Satu Semangat
              </h2>
              <p className="mt-3 text-sm text-[#7A6955]">
                Temukan menu favoritmu dari brand kuliner unggulan kami
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {BRANDS.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/${brand.slug}`}
                  className="group relative overflow-hidden rounded-3xl p-8 text-white transition-transform hover:-translate-y-1 hover:shadow-xl"
                  style={{ backgroundColor: brand.primaryColor }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage: `radial-gradient(circle at 90% 10%, ${brand.accentColor}, transparent 50%)`,
                    }}
                  />
                  <div className="relative">
                    <span className="text-xs font-semibold uppercase tracking-widest opacity-70">Bwaji Group</span>
                    <h3
                      className="mt-2 text-3xl font-black"
                      style={{ fontFamily: "var(--font-archivo)" }}
                    >
                      {brand.name}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed opacity-80">{brand.description}</p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold transition-colors group-hover:bg-white/30">
                      Lihat Menu <ArrowRight size={14} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── VALUES ── */}
        <section className="bg-[#FAF3EB] px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C0272D]">Kenapa Bwaji Group?</span>
              <h2
                className="mt-2 text-4xl font-black text-[#1A0F0A]"
                style={{ fontFamily: "var(--font-archivo)" }}
              >
                Komitmen Kami
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {values.map(({ title, desc }) => (
                <div key={title} className="rounded-2xl bg-white p-8 shadow-sm shadow-black/5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FEF2F2]">
                    <CheckCircle size={20} className="text-[#C0272D]" />
                  </div>
                  <h3 className="font-bold text-[#1A0F0A]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#7A6955]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="bg-[#C0272D] px-5 py-16 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2
                className="text-3xl font-black text-white sm:text-4xl"
                style={{ fontFamily: "var(--font-archivo)" }}
              >
                Lapar? Pesan Sekarang.
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Fresh, lezat, dan siap diantar ke tempatmu.
              </p>
            </div>
            <Link
              href="/produk"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#C0272D] transition-opacity hover:opacity-90"
            >
              Lihat Menu <ArrowRight size={15} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
