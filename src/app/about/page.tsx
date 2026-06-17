import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Tentang Kami | Bwaji Group",
  description: "Mengenal lebih dekat Bwaji Group dan brand-brand unggulan kami.",
};

const stats = [
  { v: "2", l: "Brand Kuliner" },
  { v: "50+", l: "Varian Menu" },
  { v: "4.9★", l: "Rating Rata-rata" },
  { v: "Daily", l: "Fresh Cook" },
];

const values = [
  { num: "01", title: "Kualitas Tanpa Kompromi", desc: "Bahan segar pilihan dan bumbu terbaik di setiap hidangan, setiap hari." },
  { num: "02", title: "Konsisten & Terpercaya", desc: "Standar rasa yang sama di setiap porsi. Tidak ada kompromi soal rasa." },
  { num: "03", title: "Untuk Semua Kalangan", desc: "Harga terjangkau tanpa mengorbankan kualitas. Makanan enak adalah hak semua orang." },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── PAGE HEADER ── */}
        <section className="bg-[#FAF3EB] px-5 pb-16 pt-32 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#C0272D]">Tentang Kami</span>
            <h1
              className="mt-3 text-5xl font-black leading-tight text-[#1A0F0A] sm:text-6xl"
              style={{ fontFamily: "var(--font-archivo)", letterSpacing: "-0.02em" }}
            >
              Mengenal<br />Bwaji Group
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#7A6955]">
              Kami adalah grup kuliner yang lahir dari cinta mendalam terhadap makanan Indonesia — sederhana, tulus, dan selalu dibuat dengan sepenuh hati.
            </p>
          </div>
        </section>

        {/* ── CERITA — image + text ── */}
        <section className="bg-[#FFFCF8] px-5 py-16 lg:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#FAF3EB]">
              <Image
                src="https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85"
                alt="Dapur Bwaji"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C0272D]">Cerita Kami</span>
              <h2
                className="mt-3 text-4xl font-black leading-tight text-[#1A0F0A]"
                style={{ fontFamily: "var(--font-archivo)" }}
              >
                Dari Dapur Kecil, Kini Melayani Ribuan
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#7A6955]">
                Bwaji Group lahir dari kecintaan mendalam terhadap kuliner Indonesia. Bermula dari dapur rumahan yang sederhana, kami membangun dua brand dengan karakter masing-masing — namun tetap terikat satu visi: membawa kebahagiaan lewat makanan.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#7A6955]">
                Hari ini, Bwaji Group terus berkembang dengan semangat yang sama seperti hari pertama — memasak dengan tulus, menyajikan dengan bangga.
              </p>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div className="border-y border-[#E8D5C0] bg-[#FAF3EB]">
          <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-[#E8D5C0] px-5 sm:grid-cols-4 lg:px-8">
            {stats.map(({ v, l }) => (
              <div key={l} className="py-10 text-center">
                <p
                  className="text-4xl font-black text-[#1A0F0A]"
                  style={{ fontFamily: "var(--font-archivo)" }}
                >
                  {v}
                </p>
                <p className="mt-2 text-sm text-[#7A6955]">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── NILAI ── */}
        <section className="bg-[#FFFCF8] px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#C0272D]">Nilai Kami</span>
              <h2
                className="mt-3 text-4xl font-black text-[#1A0F0A]"
                style={{ fontFamily: "var(--font-archivo)" }}
              >
                Mengapa Memilih Bwaji Group?
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {values.map(({ num, title, desc }) => (
                <div key={num} className="rounded-2xl border border-[#E8D5C0] bg-white p-8">
                  <p
                    className="text-4xl font-black text-[#C0272D]/20"
                    style={{ fontFamily: "var(--font-archivo)" }}
                  >
                    {num}
                  </p>
                  <h3 className="mt-4 font-bold text-[#1A0F0A]">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#7A6955]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#FAF3EB] px-5 py-16 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <h2
              className="text-3xl font-black text-[#1A0F0A]"
              style={{ fontFamily: "var(--font-archivo)" }}
            >
              Siap Mencoba?
            </h2>
            <p className="mt-3 text-sm text-[#7A6955]">
              Temukan menu terbaik dari dua brand unggulan kami.
            </p>
            <Link
              href="/produk"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#C0272D] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
            >
              Lihat Produk Kami <ArrowRight size={15} />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
