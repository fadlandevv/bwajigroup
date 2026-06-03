"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useCartStore } from "@/stores/cart-store";

export function Navbar() {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const openCart = useCartStore((s) => s.openCart);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="fixed left-4 right-4 top-3 z-50 lg:left-6 lg:right-6">
      <div className="flex h-12 items-center rounded-full bg-[#93F3AA] px-5 lg:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="mr-auto text-sm font-black tracking-tight text-[#1D1A40]"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          B/G
        </Link>

        {/* Nav links */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-medium text-[#1D1A40]/60 hover:text-[#1D1A40] transition-colors">
            Home
          </Link>
          <Link href="/dapur-bwaji" className="text-sm font-medium text-[#1D1A40]/60 hover:text-[#1D1A40] transition-colors">
            Menu
          </Link>
          <Link href="/about" className="text-sm font-medium text-[#1D1A40]/60 hover:text-[#1D1A40] transition-colors">
            Tentang
          </Link>
        </nav>

        {/* Cart */}
        <button
          onClick={openCart}
          className="relative ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#1D1A40] text-white transition-opacity hover:opacity-75"
        >
          <ShoppingCart size={14} />
          {mounted && totalItems > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F97316] text-[9px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
