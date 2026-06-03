"use client";

import { useState } from "react";
import { MenuCard } from "./menu-card";
import type { MenuItem } from "@/types/menu";

export function MenuGrid({ items, categories }: { items: MenuItem[]; categories: string[] }) {
  const [active, setActive] = useState("Semua");
  const all = ["Semua", ...categories];
  const filtered = active === "Semua" ? items : items.filter((i) => i.category === active);

  return (
    <div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {all.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              active === cat
                ? "bg-[#1D1A40] text-white"
                : "bg-[#EAEDF6] text-[#70758C] hover:bg-[#1D1A40]/10 hover:text-[#1D1A40]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-[#70758C]">
          Tidak ada menu untuk kategori ini.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => <MenuCard key={item.id} item={item} />)}
        </div>
      )}
    </div>
  );
}
