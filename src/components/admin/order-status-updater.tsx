"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const STATUS_FLOW = [
  { value: "pending", label: "Menunggu" },
  { value: "confirmed", label: "Dikonfirmasi" },
  { value: "preparing", label: "Dimasak" },
  { value: "ready", label: "Siap Diambil" },
  { value: "delivered", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
] as const;

type OrderStatus = (typeof STATUS_FLOW)[number]["value"];

interface Props {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: OrderStatus) {
    setLoading(status);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Gagal update status");
      router.refresh();
    } catch {
      alert("Gagal mengubah status order");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_FLOW.map(({ value, label }) => (
        <Button
          key={value}
          size="sm"
          variant={currentStatus === value ? "default" : value === "cancelled" ? "destructive" : "outline"}
          disabled={currentStatus === value || !!loading}
          onClick={() => updateStatus(value)}
        >
          {loading === value ? "..." : label}
        </Button>
      ))}
    </div>
  );
}
