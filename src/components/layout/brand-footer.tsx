import Link from "next/link";
import type { Brand } from "@/types/brand";

export function BrandFooter({ brand }: { brand: Brand }) {
  return (
    <footer className="bg-[#1D1A40]">
      <div className="border-b border-white/10 px-5 py-12 lg:px-8">
        <p
          className="font-black uppercase leading-[0.85] text-white"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: "clamp(3.5rem, 13vw, 10rem)",
            letterSpacing: "-0.03em",
          }}
        >
          {brand.name.toUpperCase().replace(" ", "\n")}
        </p>
      </div>
      <div className="flex flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex gap-6">
          <Link href={`/${brand.slug}`} className="text-sm text-white/60 hover:text-white transition-colors">Menu</Link>
          <Link href={`/${brand.slug}#tentang`} className="text-sm text-white/60 hover:text-white transition-colors">Tentang</Link>
          <Link href="/" className="text-sm text-white/60 hover:text-white transition-colors">← BwajiGroup</Link>
        </div>
        <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} {brand.name}</p>
      </div>
    </footer>
  );
}
