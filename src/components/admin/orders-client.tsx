"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { ChevronRight, Clock } from "lucide-react";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { BRAND_NAMES } from "@/lib/session-brand";

const AUTO_CONFIRM_MS = 5 * 60 * 1000;

function fmt(ms: number) {
  if (ms <= 0) return "00:00";
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function PendingTimer({ createdAt }: { createdAt: string }) {
  const target = new Date(createdAt).getTime() + AUTO_CONFIRM_MS;
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    const id = setInterval(() => setRemaining(Math.max(0, target - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);

  const urgent = remaining < 60_000;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgent ? "bg-red-100 text-red-600 animate-pulse" : "bg-orange-100 text-orange-600"}`}>
      <Clock size={9} />
      {remaining <= 0 ? "Mengkonfirmasi..." : fmt(remaining)}
    </span>
  );
}

type Order = {
  id: string;
  brandSlug: string;
  customerName: string;
  customerPhone: string;
  status: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
};

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "gray"> = {
  pending: "warning", confirmed: "default", preparing: "default",
  ready: "success", delivered: "success", cancelled: "danger",
};
const statusLabelMap: Record<string, string> = {
  pending: "Menunggu", confirmed: "Dikonfirmasi", preparing: "Dimasak",
  ready: "Siap", delivered: "Selesai", cancelled: "Dibatalkan",
};

export function AdminOrdersClient({ brandFilter }: { brandFilter: string | null }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = brandFilter ? `/api/orders?brand=${brandFilter}` : "/api/orders";
    fetch(url)
      .then((r) => r.json())
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brandFilter]);

  const brandLabel = brandFilter ? ` — ${BRAND_NAMES[brandFilter as keyof typeof BRAND_NAMES] ?? brandFilter}` : "";

  return (
    <>
      <PageHeader
        title="Kelola Order"
        description={loading ? "Memuat..." : `${orders.length} order masuk${brandLabel}`}
      />
      <PageContent className="space-y-3">
        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 flex items-center gap-3 animate-pulse">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-gray-200" />
                  <div className="h-3 w-48 rounded bg-gray-100" />
                </div>
                <div className="h-6 w-16 rounded-full bg-gray-200" />
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
              Belum ada order masuk.
            </div>
          ) : orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono text-xs font-bold text-gray-500">#{order.id.slice(0, 6).toUpperCase()}</span>
                  <Badge variant={statusVariantMap[order.status] ?? "gray"}>{statusLabelMap[order.status] ?? order.status}</Badge>
                  {order.status === "pending" && <PendingTimer createdAt={order.createdAt} />}
                </div>
                <p className="font-semibold text-gray-900">{order.customerName}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {order.brandSlug.replace("-", " ")} · <span className="uppercase">{order.paymentMethod}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-none">
                <span className="font-bold text-gray-900 text-sm">{formatRupiah(order.totalAmount)}</span>
                <ChevronRight size={16} className="text-gray-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Pelanggan</th>
                {!brandFilter && <th className="px-4 py-3 text-left font-medium text-gray-500">Brand</th>}
                <th className="px-4 py-3 text-left font-medium text-gray-500">Pembayaran</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-32 rounded bg-gray-200" /></td>
                    {!brandFilter && <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-gray-200" /></td>}
                    <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-gray-200" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-20 rounded-full bg-gray-200 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-10 rounded bg-gray-200 ml-auto" /></td>
                  </tr>
                ))
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerPhone}</p>
                  </td>
                  {!brandFilter && <td className="px-4 py-3 capitalize text-gray-500">{order.brandSlug.replace("-", " ")}</td>}
                  <td className="px-4 py-3 uppercase text-gray-500">{order.paymentMethod}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatRupiah(order.totalAmount)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <Badge variant={statusVariantMap[order.status] ?? "gray"}>{statusLabelMap[order.status] ?? order.status}</Badge>
                      {order.status === "pending" && <PendingTimer createdAt={order.createdAt} />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-orange-500 hover:underline">Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <div className="py-12 text-center text-gray-400">Belum ada order masuk.</div>
          )}
        </div>
      </PageContent>
    </>
  );
}
