"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  initialIsOpen: boolean;
  mode: "global" | "brand";
  brandSlug?: string;
}

export function StoreToggle({ initialIsOpen, mode, brandSlug }: Props) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggle() {
    setLoading(true);
    try {
      let res: Response;
      if (mode === "global") {
        res = await fetch("/api/store/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOpen: !isOpen }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error();
        setIsOpen(data.isOpen);
      } else {
        res = await fetch(`/api/brand/${brandSlug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isOpen: !isOpen }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error();
        setIsOpen(data.isOpen);
      }
      router.refresh();
    } catch {
      alert("Gagal mengubah status toko");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full flex items-center justify-between rounded-xl px-4 py-3 transition-colors duration-200 active:opacity-80 disabled:opacity-60 ${
        isOpen
          ? "bg-green-50 border border-green-200"
          : "bg-red-50 border border-red-200"
      }`}
    >
      {/* Status info */}
      <div className="flex items-center gap-3 text-left">
        <span
          className={`h-3 w-3 rounded-full flex-none ${
            isOpen ? "bg-green-500 animate-pulse" : "bg-red-400"
          }`}
        />
        <div>
          <p className={`text-sm font-bold ${isOpen ? "text-green-700" : "text-red-600"}`}>
            {loading ? "Mengubah..." : isOpen ? "BUKA" : "TUTUP"}
          </p>
          <p className={`text-xs ${isOpen ? "text-green-600/70" : "text-red-500/70"}`}>
            {isOpen ? "Pelanggan bisa memesan" : "Pesanan dinonaktifkan"}
          </p>
        </div>
      </div>

      {/* Toggle switch */}
      <div
        className={`relative flex-none rounded-full overflow-hidden transition-colors duration-300 ${
          isOpen ? "bg-green-500" : "bg-red-400"
        }`}
        style={{ width: "52px", height: "28px" }}
      >
        <span
          className={`absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-transform duration-300 ${
            isOpen ? "translate-x-[27px]" : "translate-x-[3px]"
          }`}
        />
      </div>
    </button>
  );
}
