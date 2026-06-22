"use client";

import Link from "next/link";
import { Utensils } from "lucide-react";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 bg-[#FFFCF8] transition-all duration-200 ${
        scrolled ? "shadow-md shadow-black/5" : "border-b border-[#E8D5C0]"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center px-5 lg:px-8">
        <Link
          href="/"
          className="mr-auto text-lg font-black tracking-tight text-[#1A0F0A]"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          <span className="text-[#C0272D]">Bwaji</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-medium text-[#7A6955] transition-colors hover:text-[#1A0F0A]">
            Home
          </Link>
          <Link href="/produk" className="text-sm font-medium text-[#7A6955] transition-colors hover:text-[#1A0F0A]">
            Produk
          </Link>
          <Link href="/about" className="text-sm font-medium text-[#7A6955] transition-colors hover:text-[#1A0F0A]">
            Tentang
          </Link>
        </nav>

        <Link
          href="/pesan"
          className="ml-8 inline-flex items-center gap-1.5 rounded-full bg-[#C0272D] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-85"
        >
          <Utensils size={14} />
          <span className="hidden sm:inline">Pesan Sekarang</span>
          <span className="sm:hidden">Pesan</span>
        </Link>
      </div>
    </header>
  );
}
