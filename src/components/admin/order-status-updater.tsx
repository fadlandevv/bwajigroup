"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_FLOW = [
  { value: "pending",   label: "Menunggu" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "preparing", label: "Dimasak" },
  { value: "ready",     label: "Siap Diambil" },
  { value: "delivered", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
] as const;

type OrderStatus = (typeof STATUS_FLOW)[number]["value"];

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<string>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChange(next: string) {
    if (next === status) return;
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
      setStatus(status);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value as OrderStatus)}
        className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 disabled:opacity-60 cursor-pointer"
      >
        {STATUS_FLOW.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        {loading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
        ) : (
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>
    </div>
  );
}
