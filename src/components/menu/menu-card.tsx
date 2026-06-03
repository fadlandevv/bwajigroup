"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";
import type { MenuItem } from "@/types/menu";

export function MenuCard({ item }: { item: MenuItem }) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[#EAEDF6]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-30">🍽️</div>
        )}
        {item.isFeatured && (
          <span className="absolute left-3 top-3 rounded-full bg-[#F97316] px-2.5 py-1 text-[11px] font-bold text-white">
            ★ Favorit
          </span>
        )}
      </div>

      {/* Info — exact K-Lane card structure */}
      <div className="flex flex-1 flex-col gap-1 p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#70758C]">
          {item.category}
        </p>
        <p
          className="text-lg font-bold leading-snug text-[#1D1A40]"
          style={{ fontFamily: "var(--font-archivo)" }}
        >
          {item.name}
        </p>
        {item.description && (
          <p className="mt-0.5 text-sm leading-relaxed text-[#70758C] line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Price + Add — K-Lane style */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="rounded-full bg-[#EAEDF6] px-4 py-1.5 text-sm font-bold text-[#1D1A40]">
            {formatRupiah(item.price)}
          </span>
          <button
            onClick={() => { addItem(item); openCart(); }}
            disabled={!item.isAvailable}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D1A40] text-white transition-transform hover:scale-110 active:scale-95 disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>
        {!item.isAvailable && (
          <p className="text-[11px] font-medium text-red-400">Sedang habis</p>
        )}
      </div>
    </div>
  );
}
