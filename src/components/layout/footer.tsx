import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1D1A40]">
      {/* Big brand name — K-Lane footer style */}
      <div className="border-b border-white/10 px-5 py-14 lg:px-8">
        <p
          className="font-black uppercase leading-[0.85] text-white"
          style={{
            fontFamily: "var(--font-archivo)",
            fontSize: "clamp(4rem, 16vw, 13rem)",
            letterSpacing: "-0.03em",
          }}
        >
          BWAJI<br />
          <span className="text-[#F97316]">GROUP.</span>
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-col gap-6 px-5 py-8 sm:flex-row sm:items-start sm:justify-between lg:px-8">
        <nav className="flex gap-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Brand</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/dapur-bwaji" className="text-sm text-white/70 hover:text-white transition-colors">Dapur Bwaji</Link></li>
              <li><Link href="/hoki-dimsum" className="text-sm text-white/70 hover:text-white transition-colors">Hoki Dimsum</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Info</p>
            <ul className="mt-3 space-y-2">
              <li><Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors">Tentang</Link></li>
              <li><p className="text-sm text-white/30">@bwajigroup</p></li>
            </ul>
          </div>
        </nav>
        <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} Bwaji Group</p>
      </div>
    </footer>
  );
}
