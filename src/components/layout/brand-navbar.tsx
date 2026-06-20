"use client";

import Link from "next/link";
import type { Brand } from "@/types/brand";

export function BrandNavbar({ brand }: { brand: Brand }) {
  const pillBg = brand.slug === "dapur-bwaji" ? "#FFD6B0" : "#FFBABA";

  return (
    <header className="fixed left-4 right-4 top-3 z-50 lg:left-6 lg:right-6">
      <div
        className="flex h-12 items-center rounded-full px-5 lg:px-6"
        style={{ backgroundColor: pillBg }}
      >
        {/* Logo */}
        <div className="mr-auto flex items-center gap-2">
          <Link href="/" className="text-xs font-medium text-[#1D1A40]/40 hover:text-[#1D1A40]/70 transition-colors">
            B/G
          </Link>
          <span className="text-[#1D1A40]/20">/</span>
          <Link
            href={`/${brand.slug}`}
            className="text-sm font-black text-[#1D1A40]"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            {brand.name.split(" ").map(w => w[0]).join("/")}
          </Link>
        </div>

        {/* Nav links */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
          <Link href={`/${brand.slug}`} className="text-sm font-medium text-[#1D1A40]/60 hover:text-[#1D1A40] transition-colors">
            Menu
          </Link>
          <Link href={`/${brand.slug}#tentang`} className="text-sm font-medium text-[#1D1A40]/60 hover:text-[#1D1A40] transition-colors">
            Tentang
          </Link>
        </nav>

        {/* Pesan */}
        <Link
          href="/pesan"
          className="ml-auto flex h-8 items-center justify-center rounded-full px-4 text-xs font-bold text-white transition-opacity hover:opacity-75"
          style={{ backgroundColor: brand.primaryColor }}
        >
          Pesan
        </Link>
      </div>
    </header>
  );
}
