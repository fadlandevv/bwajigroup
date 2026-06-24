"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";

const STATUS_FLOW = [
  { value: "pending",   label: "Menunggu",      color: "text-amber-700",  bg: "bg-amber-50",  dot: "bg-amber-400" },
  { value: "confirmed", label: "Dikonfirmasi",  color: "text-blue-700",   bg: "bg-blue-50",   dot: "bg-blue-400" },
  { value: "preparing", label: "Dimasak",       color: "text-orange-700", bg: "bg-orange-50", dot: "bg-orange-400" },
  { value: "ready",     label: "Siap Diambil",  color: "text-green-700",  bg: "bg-green-50",  dot: "bg-green-400" },
  { value: "delivered", label: "Selesai",       color: "text-emerald-700",bg: "bg-emerald-50",dot: "bg-emerald-500" },
  { value: "cancelled", label: "Dibatalkan",    color: "text-red-700",    bg: "bg-red-50",    dot: "bg-red-400" },
] as const;

type OrderStatus = (typeof STATUS_FLOW)[number]["value"];

function getStatus(value: string) {
  return STATUS_FLOW.find((s) => s.value === value) ?? STATUS_FLOW[0];
}

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSelect(next: OrderStatus) {
    setOpen(false);
    if (next === status) return;
    const prev = status;
    setStatus(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Gagal mengubah status order");
      setStatus(prev);
    } finally {
      setLoading(false);
    }
  }

  const current = getStatus(status);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${current.bg} ${current.color} border-current/20 hover:brightness-95 disabled:opacity-60`}
      >
        <div className="flex items-center gap-2">
          {loading ? (
            <div className="h-2 w-2 animate-ping rounded-full bg-current opacity-75" />
          ) : (
            <div className={`h-2 w-2 rounded-full ${current.dot}`} />
          )}
          {current.label}
        </div>
        <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          {STATUS_FLOW.map((s) => (
            <button
              key={s.value}
              onClick={() => handleSelect(s.value)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${s.color}`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`h-2 w-2 rounded-full ${s.dot}`} />
                <span className="font-medium text-gray-800">{s.label}</span>
              </div>
              {s.value === status && <Check size={14} className="text-orange-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
