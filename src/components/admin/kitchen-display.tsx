"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { RefreshCw, Clock, ChefHat } from "lucide-react";

type OrderItem = {
  id: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

type ActiveOrder = {
  id: string;
  brandSlug: string;
  customerName: string;
  customerPhone: string;
  customerNote: string | null;
  status: string;
  paymentMethod: string;
  deliveryType: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_CONFIG: Record<
  string,
  { label: string; border: string; bg: string; badge: string; nextLabel: string; nextStatus: string }
> = {
  pending: {
    label: "Menunggu",
    border: "border-orange-400",
    bg: "bg-orange-50",
    badge: "bg-orange-100 text-orange-700",
    nextLabel: "Terima Pesanan",
    nextStatus: "confirmed",
  },
  confirmed: {
    label: "Dikonfirmasi",
    border: "border-blue-400",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    nextLabel: "Mulai Masak",
    nextStatus: "preparing",
  },
  preparing: {
    label: "Sedang Dimasak",
    border: "border-purple-400",
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    nextLabel: "Siap Diambil",
    nextStatus: "ready",
  },
  ready: {
    label: "Siap Diambil",
    border: "border-green-400",
    bg: "bg-green-50",
    badge: "bg-green-100 text-green-700",
    nextLabel: "Serahkan ke Pelanggan",
    nextStatus: "delivered",
  },
};

function useElapsed(createdAt: string) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    function update() {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      if (diff < 60) setElapsed(`${diff}d`);
      else if (diff < 3600) setElapsed(`${Math.floor(diff / 60)}m`);
      else setElapsed(`${Math.floor(diff / 3600)}j ${Math.floor((diff % 3600) / 60)}m`);
    }
    update();
    const id = setInterval(update, 10_000);
    return () => clearInterval(id);
  }, [createdAt]);

  return elapsed;
}

function OrderCard({
  order,
  onStatusChange,
}: {
  order: ActiveOrder;
  onStatusChange: (id: string, status: string) => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const elapsed = useElapsed(order.createdAt);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(status: string) {
    setLoading(status);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      onStatusChange(order.id, status);
    } catch {
      alert("Gagal mengubah status pesanan");
    } finally {
      setLoading(null);
    }
  }

  if (!cfg) return null;

  return (
    <div className={`flex flex-col rounded-2xl border-2 ${cfg.border} ${cfg.bg} overflow-hidden shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-gray-700">
            #{order.id.slice(0, 6).toUpperCase()}
          </span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          <span>{elapsed}</span>
        </div>
      </div>

      {/* Customer */}
      <div className="px-4 pt-3 pb-1">
        <p className="font-bold text-gray-900 text-base leading-tight">{order.customerName}</p>
        <p className="text-xs text-gray-400 capitalize">
          {order.brandSlug.replace("-", " ")} &middot; {order.deliveryType === "delivery" ? "Antar" : "Ambil"}
          &middot; <span className="uppercase">{order.paymentMethod}</span>
        </p>
      </div>

      {/* Items */}
      <div className="flex-1 px-4 py-2 space-y-1.5">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-700">
                {item.quantity}
              </span>
              <span className="text-sm font-medium text-gray-900">{item.menuItemName}</span>
            </div>
            <span className="text-xs text-gray-400">{formatRupiah(item.subtotal)}</span>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.customerNote && (
        <div className="mx-4 mb-2 rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2">
          <p className="text-xs text-yellow-700">
            <span className="font-semibold">Catatan: </span>
            {order.customerNote}
          </p>
        </div>
      )}

      {/* Total */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-white/60">
        <span className="text-xs text-gray-500">Total</span>
        <span className="font-bold text-gray-900">{formatRupiah(order.totalAmount)}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 pb-4 pt-2">
        <Button
          size="sm"
          variant="destructive"
          className="flex-none rounded-xl"
          disabled={!!loading}
          onClick={() => handleAction("cancelled")}
        >
          {loading === "cancelled" ? "..." : "Batal"}
        </Button>
        <Button
          size="sm"
          className="flex-1 rounded-xl"
          disabled={!!loading}
          onClick={() => handleAction(cfg.nextStatus)}
        >
          {loading === cfg.nextStatus ? "..." : cfg.nextLabel}
        </Button>
      </div>
    </div>
  );
}

export function KitchenDisplay() {
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [error, setError] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/active", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data: ActiveOrder[] = await res.json();
      setOrders(data);
      setLastUpdate(new Date());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const id = setInterval(fetchOrders, 10_000);
    return () => clearInterval(id);
  }, [fetchOrders]);

  function handleStatusChange(orderId: string, newStatus: string) {
    if (newStatus === "delivered" || newStatus === "cancelled") {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  }

  const byStatus = {
    pending: orders.filter((o) => o.status === "pending"),
    confirmed: orders.filter((o) => o.status === "confirmed"),
    preparing: orders.filter((o) => o.status === "preparing"),
    ready: orders.filter((o) => o.status === "ready"),
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat size={24} className="text-orange-500" />
            Dapur — Pesanan Aktif
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {orders.length === 0 ? "Tidak ada pesanan aktif" : `${orders.length} pesanan aktif`}
            &ensp;&middot;&ensp;Update otomatis setiap 10 detik
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
              Gagal memuat data
            </span>
          )}
          <span className="text-xs text-gray-400">
            {lastUpdate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white">
          <div className="text-center">
            <ChefHat size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 font-medium">Belum ada pesanan masuk</p>
            <p className="text-xs text-gray-300 mt-1">Halaman akan otomatis update saat ada pesanan baru</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(["pending", "confirmed", "preparing", "ready"] as const).flatMap((status) =>
            byStatus[status].map((order) => (
              <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
