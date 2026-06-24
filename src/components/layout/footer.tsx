import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1A0F0A]">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div>
            <p
              className="text-2xl font-black text-white"
              style={{ fontFamily: "var(--font-archivo)" }}
            >
              Bwaji<span className="text-[#C0272D]">Group.</span>
            </p>
            <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-white/50">
              Grup kuliner Indonesia — menghadirkan cita rasa terbaik setiap hari.
            </p>
          </div>

          <nav className="flex gap-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Brand</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/dapur-bwaji" className="text-sm text-white/60 transition-colors hover:text-white">
                    Dapur Bwaji
                  </Link>
                </li>
                <li>
                  <Link href="/hoki-dimsum" className="text-sm text-white/60 transition-colors hover:text-white">
                    Hoki Dimsum
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30">Info</p>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/produk" className="text-sm text-white/60 transition-colors hover:text-white">
                    Produk
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-sm text-white/60 transition-colors hover:text-white">
                    Tentang
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} Bwaji Group. Semua hak dilindungi.
          </p>
        </div>
      </div>
    </footer>
  );
}
