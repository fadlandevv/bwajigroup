import Link from "next/link";
import type { Brand } from "@/types/brand";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <Link
      href={`/${brand.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
    >
      {/* Image / color block — top portion */}
      <div
        className="relative flex h-56 items-center justify-center overflow-hidden"
        style={{ backgroundColor: brand.primaryColor }}
      >
        <span
          className="select-none font-black text-white/10"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: "clamp(6rem, 15vw, 12rem)",
            lineHeight: 1,
          }}
        >
          {brand.name.split(" ").map((w) => w[0]).join("")}
        </span>
        {/* Tag */}
        <span className="absolute bottom-4 left-4 rounded-full bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
          Bwaji Group
        </span>
      </div>

      {/* Info block */}
      <div className="flex items-center justify-between p-5">
        <div>
          <p
            className="text-xl font-black text-[#1D1A40]"
            style={{ fontFamily: "var(--font-archivo)" }}
          >
            {brand.name}
          </p>
          <p className="mt-0.5 text-sm text-[#70758C]">{brand.tagline}</p>
        </div>
        {/* Arrow */}
        <span
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white text-sm font-bold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ backgroundColor: brand.primaryColor }}
        >
          ↗
        </span>
      </div>
    </Link>
  );
}
