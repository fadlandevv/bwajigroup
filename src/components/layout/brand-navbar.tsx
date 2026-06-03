"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import type { Brand } from "@/types/brand";

export function BrandNavbar({ brand }: { brand: Brand }) {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

        {/* Cart */}
        <button
          onClick={openCart}
          className="relative ml-auto flex h-8 w-8 items-center justify-center rounded-full text-white transition-opacity hover:opacity-75"
          style={{ backgroundColor: brand.primaryColor }}
        >
          <ShoppingCart size={14} />
          {mounted && totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1D1A40] text-[9px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
