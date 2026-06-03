import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BRANDS } from "@/types/brand";
import { ArrowRight, Heart, Star, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Mengenal lebih dekat Bwaji Group dan brand-brand unggulan kami.",
};

const values = [
  {
    icon: Heart,
    title: "Dibuat dengan Cinta",
    desc: "Setiap hidangan kami dimasak dengan bahan pilihan dan penuh kasih sayang, seperti masakan rumah sendiri.",
  },
  {
    icon: Star,
    title: "Kualitas Tanpa Kompromi",
    desc: "Kami memastikan standar bahan baku dan kebersihan dapur selalu terjaga di level tertinggi.",
  },
  {
    icon: Users,
    title: "Untuk Semua Kalangan",
    desc: "Dari keluarga, sahabat, hingga momen spesial — kami hadir untuk menemani setiap momen makanmu.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden bg-gray-900 px-4 py-28 text-center sm:px-6 lg:px-8">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 50%, #f97316 0%, transparent 60%), radial-gradient(circle at 70% 50%, #dc2626 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
              Tentang Kami
            </p>
            <h1 className="mt-3 text-5xl font-bold text-white sm:text-6xl">
              Bwaji<span className="text-orange-400">Group</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-300">
              Kami adalah grup kuliner yang berdedikasi menghadirkan pengalaman makan terbaik
              melalui dua brand unggulan kami. Dari dapur rumahan yang hangat hingga hidangan
              dimsum premium — semua ada di sini.
            </p>
          </div>
        </section>

        {/* Cerita */}
        <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
                Cerita Kami
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Berawal dari Dapur Kecil, Kini Melayani Ribuan Pelanggan
              </h2>
              <p className="mt-4 text-gray-500 leading-relaxed">
                Bwaji Group lahir dari kecintaan mendalam terhadap kuliner Indonesia.
                Bermula dari dapur rumahan yang sederhana, kami membangun dua brand
                dengan karakter dan keunikan masing-masing — namun tetap terikat satu visi:
                membawa kebahagiaan lewat makanan.
              </p>
              <p className="mt-3 text-gray-500 leading-relaxed">
                Hari ini, Bwaji Group terus berkembang dengan semangat yang sama seperti hari
                pertama — memasak dengan tulus, menyajikan dengan bangga.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-orange-50 p-6 text-center">
                <p className="text-4xl font-bold text-orange-500">2+</p>
                <p className="mt-1 text-sm text-gray-500">Brand Kuliner</p>
              </div>
              <div className="rounded-2xl bg-red-50 p-6 text-center">
                <p className="text-4xl font-bold text-red-500">500+</p>
                <p className="mt-1 text-sm text-gray-500">Menu Terjual / Hari</p>
              </div>
              <div className="rounded-2xl bg-yellow-50 p-6 text-center">
                <p className="text-4xl font-bold text-yellow-500">1K+</p>
                <p className="mt-1 text-sm text-gray-500">Pelanggan Setia</p>
              </div>
              <div className="rounded-2xl bg-green-50 p-6 text-center">
                <p className="text-4xl font-bold text-green-500">4.9</p>
                <p className="mt-1 text-sm text-gray-500">Rating Rata-rata</p>
              </div>
            </div>
          </div>
        </section>

        {/* Nilai */}
        <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
                Nilai Kami
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                Mengapa Memilih Bwaji Group?
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100">
                    <Icon size={24} className="text-orange-500" />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Cards */}
        <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              Brand Kami
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              Dua Brand, Satu Semangat
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {BRANDS.map((brand) => (
              <Link
                key={brand.slug}
                href={`/${brand.slug}`}
                className="group relative overflow-hidden rounded-2xl p-8 text-white transition-transform hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: brand.primaryColor }}
              >
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `radial-gradient(circle at 80% 20%, ${brand.accentColor}, transparent 60%)`,
                  }}
                />
                <div className="relative">
                  <p className="text-sm font-semibold uppercase tracking-widest opacity-80">
                    Bwaji Group
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">{brand.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed opacity-90">
                    {brand.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                    Lihat Menu
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
