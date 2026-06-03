import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";

export const metadata: Metadata = { title: "Detail Order" };

const statusVariantMap: Record<string, "default" | "success" | "warning" | "danger" | "gray"> = {
  pending: "warning",
  confirmed: "default",
  preparing: "default",
  ready: "success",
  delivered: "success",
  cancelled: "danger",
};

const statusLabelMap: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  preparing: "Dimasak",
  ready: "Siap Diambil",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  if (!order) notFound();

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={15} /> Kembali
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Detail Order</h1>
          <Badge variant={statusVariantMap[order.status] ?? "gray"}>
            {statusLabelMap[order.status] ?? order.status}
          </Badge>
        </div>
        <p className="text-sm text-gray-400">#{order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Info Pelanggan */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Info Pelanggan</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Nama</span>
              <span className="font-medium text-gray-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Telepon</span>
              <span className="font-medium text-gray-900">{order.customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Brand</span>
              <span className="font-medium capitalize text-gray-900">
                {order.brandSlug.replace("-", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Pembayaran</span>
              <span className="font-medium uppercase text-gray-900">{order.paymentMethod}</span>
            </div>
            {order.customerNote && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-gray-500 text-xs mb-1">Catatan</p>
                <p className="text-gray-700">{order.customerNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Item Pesanan */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3 lg:col-span-2">
          <h2 className="font-semibold text-gray-900">Item Pesanan</h2>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.menuItemName}</p>
                  <p className="text-xs text-gray-400">{formatRupiah(item.unitPrice)} × {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-900">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3 text-sm font-bold text-gray-900">
            <span>Total</span>
            <span>{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Update Status</h2>
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
  );
}
