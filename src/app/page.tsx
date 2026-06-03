import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Marquee } from "@/components/ui/marquee";
import { BRANDS } from "@/types/brand";

const ticker1 = ["Bwaji Group", "Grup Kuliner Indonesia", "Est. 2024", "Halal", "Cita Rasa Terbaik", "Bwaji Group", "Dua Brand", "Satu Semangat"];
const ticker2 = ["Dapur Bwaji", "Hoki Dimsum", "Masakan Nusantara", "Dimsum Premium", "Fresh Daily", "Bahan Pilihan"];

const values = [
  { num: "01", title: "Kualitas Tanpa Kompromi", desc: "Bahan segar pilihan dan bumbu terbaik di setiap hidangan." },
  { num: "02", title: "Konsisten & Terpercaya", desc: "Standar rasa yang sama di setiap porsi, setiap hari." },
  { num: "03", title: "Untuk Semua Kalangan", desc: "Harga terjangkau tanpa mengorbankan kualitas." },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── 1. HERO ── */}
        <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#1D1A40]">
          <div className="flex flex-1 flex-col justify-center px-4 pt-20 lg:px-6">
            <h1
              className="font-black uppercase leading-[0.88] text-white"
              style={{
                fontFamily: "var(--font-archivo)",
                fontSize: "clamp(5rem, 26vw, 32rem)",
                letterSpacing: "-0.025em",
              }}
            >
              BWAJI<br />
              <span className="text-[#F97316]">GROUP.</span>
            </h1>
          </div>

          {/* Food image */}
          <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 h-[55%] w-[30%] min-w-[200px] max-w-[360px] -translate-x-1/2 sm:bottom-12">
            <Image
              src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&q=85"
              alt="Featured Food"
              fill
              className="object-contain object-bottom drop-shadow-2xl"
            />
          </div>

          {/* Badge */}
          <div className="absolute right-5 top-[40%] z-20 flex h-24 w-24 -rotate-12 select-none items-center justify-center rounded-full bg-[#FE7BFF] p-3 text-center text-[10px] font-black leading-tight text-[#1D1A40] sm:h-28 sm:w-28 sm:text-[11px] lg:right-10">
            Cita<br />Rasa<br />Terbaik!
          </div>

          {/* Bottom bar */}
          <div className="relative z-20 flex items-center justify-between border-t border-white/10 px-4 py-4 lg:px-6">
            <p className="text-sm text-white/50">Grup Kuliner Indonesia</p>
            <Link href="/about" className="text-sm text-white/50 hover:text-white transition-colors">
              Tentang Kami ↗
            </Link>
          </div>
        </section>

        {/* ── 2. TICKER ── */}
        <div className="overflow-hidden border-y-4 border-[#1D1A40] bg-[#93F3AA] py-3">
          <Marquee items={ticker1} className="text-[#1D1A40]" />
        </div>

        {/* ── 3. ABOUT — split dark + light, K-Lane section 2 ── */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: dark, cerita grup */}
          <div className="bg-[#1D1A40] px-8 py-16 md:px-12 md:py-20">
            <p className="text-xs font-bold uppercase tracking-widest text-white/40">Tentang Bwaji Group</p>
            <h2
              className="mt-4 text-4xl font-black leading-[1.05] text-white lg:text-5xl"
              style={{ fontFamily: "var(--font-archivo)" }}
            >
              Satu grup,<br />
              <span className="text-[#93F3AA]">banyak rasa.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
              Bwaji Group adalah rumah bagi brand-brand kuliner terbaik Indonesia. Lahir dari passion dan dedikasi untuk menghadirkan makanan berkualitas tinggi, lezat, dan selalu fresh.
            </p>
            <Link href="/about"
              className="mt-8 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-[#1D1A40] hover:bg-[#93F3AA] transition-colors"
            >
              Selengkapnya ↗
            </Link>
          </div>

          {/* Right: light, stats */}
          <div className="bg-[#EAEDF6] px-8 py-16 md:px-12 md:py-20">
            <p className="text-xs font-bold uppercase tracking-widest text-[#70758C]">Dalam Angka</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {[
                { v: "2", l: "Brand Kuliner" },
                { v: "50+", l: "Varian Menu" },
                { v: "4.9★", l: "Rating Rata-rata" },
                { v: "Daily", l: "Fresh Cook" },
              ].map(({ v, l }) => (
                <div key={l} className="rounded-2xl bg-white p-6">
                  <p className="text-4xl font-black text-[#1D1A40]" style={{ fontFamily: "var(--font-archivo)" }}>{v}</p>
                  <p className="mt-1 text-xs font-medium text-[#70758C]">{l}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 4. BRAND SHOWCASE — split colored blocks, K-Lane section 3 ── */}
        <section className="grid grid-cols-1 md:grid-cols-2">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/${brand.slug}`}
              className="group relative flex h-80 flex-col justify-end overflow-hidden p-8 md:h-[420px] md:p-10"
              style={{ backgroundColor: brand.primaryColor }}
            >
              {/* Watermark letter */}
              <span
                className="pointer-events-none absolute right-0 top-0 select-none font-black text-white/10"
                style={{
                  fontFamily: "var(--font-archivo)",
                  fontSize: "clamp(8rem, 20vw, 18rem)",
                  lineHeight: 1,
                }}
              >
                {brand.name.split(" ").map(w => w[0]).join("")}
              </span>

              {/* Floating mini badge */}
              <div
                className="absolute right-6 top-6 flex h-16 w-16 rotate-12 items-center justify-center rounded-full text-center text-[10px] font-black leading-tight"
                style={{ backgroundColor: brand.accentColor, color: "#1D1A40" }}
              >
                Lihat<br />Menu
              </div>

              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">Bwaji Group</p>
                <h3
                  className="mt-1 text-3xl font-black text-white transition-transform duration-300 group-hover:translate-x-1 md:text-4xl"
                  style={{ fontFamily: "var(--font-archivo)" }}
                >
                  {brand.name}
                </h3>
                <p className="mt-1 text-sm text-white/70">{brand.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white/80 group-hover:text-white transition-colors">
                  Explore ↗
                </span>
              </div>
            </Link>
          ))}
        </section>

        {/* ── 5. TICKER 2 ── */}
        <div className="overflow-hidden border-y border-[#EAEDF6] bg-[#EAEDF6] py-3">
          <Marquee items={ticker2} reverse className="text-[#70758C]" />
        </div>

        {/* ── 6. VALUES — K-Lane "Stay in touch" equivalent ── */}
        <section className="bg-[#1D1A40] px-5 py-20 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">Nilai Kami</p>
          <h2
            className="mt-4 text-5xl font-black leading-[1.0] text-white lg:text-6xl"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            Kenapa<br />
            <span className="text-[#93F3AA]">Bwaji Group?</span>
          </h2>

          <div className="mt-12 grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-3">
            {values.map(({ num, title, desc }) => (
              <div key={num} className="bg-[#1D1A40] p-8">
                <p className="text-4xl font-black text-white/20" style={{ fontFamily: "var(--font-archivo)" }}>{num}</p>
                <p className="mt-4 text-lg font-black text-white" style={{ fontFamily: "var(--font-archivo)" }}>{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
