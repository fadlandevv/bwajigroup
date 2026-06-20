"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

const AUTO_CONFIRM_MS = 5 * 60 * 1000;
function kitchenMs(qty: number) { return (qty <= 7 ? 15 : 20) * 60 * 1000; }
function fmt(ms: number) {
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

interface Props {
  status: string;
  createdAt: string;
  updatedAt: string;
  totalItems: number;
}

export function OrderTimerBar({ status, createdAt, updatedAt, totalItems }: Props) {
  const isPending = status === "pending";
  const isKitchen = status === "confirmed" || status === "preparing";
  if (!isPending && !isKitchen) return null;

  const totalMs  = isPending ? AUTO_CONFIRM_MS : kitchenMs(totalItems);
  const startMs  = new Date(isPending ? createdAt : updatedAt).getTime();
  const endMs    = startMs + totalMs;

  const label    = isPending ? "Auto-terima" : "Waktu Masak";
  const sublabel = isPending
    ? "Pesanan otomatis dikonfirmasi setelah 5 menit"
    : `Estimasi ${totalItems <= 7 ? "15" : "20"} menit · ${totalItems} item`;

  return <TimerUI endMs={endMs} totalMs={totalMs} label={label} sublabel={sublabel} />;
}

function TimerUI({ endMs, totalMs, label, sublabel }: { endMs: number; totalMs: number; label: string; sublabel: string }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, endMs - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, endMs - Date.now())), 1000);
    return () => clearInterval(id);
  }, [endMs]);

  const pct     = Math.max(0, Math.min(100, (remaining / totalMs) * 100));
  const done    = remaining <= 0;
  const urgent  = !done && remaining < totalMs * 0.2;
  const warning = !done && remaining < totalMs * 0.5;

  const barColor  = done ? "bg-gray-200" : urgent ? "bg-red-500" : warning ? "bg-orange-400" : "bg-emerald-500";
  const textColor = done ? "text-gray-400" : urgent ? "text-red-600" : warning ? "text-orange-500" : "text-emerald-600";
  const bgColor   = done ? "bg-gray-50"   : urgent ? "bg-red-50"   : warning ? "bg-orange-50"   : "bg-emerald-50";
  const borderColor = done ? "border-gray-200" : urgent ? "border-red-200" : warning ? "border-orange-200" : "border-emerald-200";

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${bgColor} ${borderColor}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold flex items-center gap-1.5 ${textColor}`}>
            <Clock size={14} />
            {label}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
        </div>
        <span className={`text-3xl font-mono font-bold tabular-nums leading-none ${textColor}`}>
          {done ? "--:--" : fmt(remaining)}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 w-full rounded-full bg-white/70 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Labels below bar */}
      <div className="flex justify-between text-[10px] text-gray-400">
        <span>{done ? "Waktu habis" : "Berjalan"}</span>
        <span>{fmt(totalMs)} total</span>
      </div>
    </div>
  );
}
