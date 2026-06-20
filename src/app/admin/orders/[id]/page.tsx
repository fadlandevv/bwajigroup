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
import { OrderTimerBar } from "@/components/admin/order-timer-bar";
import { PageHeader, PageContent } from "@/components/admin/page-header";

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
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <PageHeader
        title={
          <div className="flex flex-col gap-1">
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 w-fit"
            >
              <ChevronLeft size={13} /> Kelola Order
            </Link>
            <div className="flex items-center gap-2 flex-wrap">
              <span>Detail Order</span>
              <Badge variant={statusVariantMap[order.status] ?? "gray"} className="text-xs">
                {statusLabelMap[order.status] ?? order.status}
              </Badge>
            </div>
          </div>
        }
        description={`#${order.id.slice(0, 8).toUpperCase()}`}
      />

      <PageContent className="space-y-4">
        {/* Info Pelanggan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Info Pelanggan</h2>
          <div className="space-y-2.5">
            <Row label="Nama" value={order.customerName} />
            <Row label="Telepon" value={order.customerPhone} />
            <Row label="Brand" value={order.brandSlug.replace(/-/g, " ")} capitalize />
            <Row label="Pembayaran" value={order.paymentMethod} uppercase />
            {order.customerNote && (
              <div className="pt-2.5 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Catatan</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{order.customerNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* Item Pesanan */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Item Pesanan</h2>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.menuItemName}</p>
                  <p className="text-xs text-gray-400">{formatRupiah(item.unitPrice)} × {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 shrink-0">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-sm font-bold text-gray-900">{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>

        {/* Timer */}
        <OrderTimerBar
          status={order.status}
          createdAt={order.createdAt.toISOString()}
          updatedAt={order.updatedAt.toISOString()}
          totalItems={totalItems}
        />

        {/* Update Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Update Status</h2>
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        </div>

        {/* Bukti Pembayaran */}
        {order.paymentProof && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Bukti Pembayaran</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.paymentProof}
              alt="Bukti pembayaran"
              className="w-full rounded-xl border border-gray-100 object-contain max-h-80"
            />
          </div>
        )}
      </PageContent>
    </>
  );
}

function Row({
  label,
  value,
  capitalize,
  uppercase,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
  uppercase?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-gray-400 shrink-0 pt-0.5">{label}</span>
      <span
        className={`text-sm font-medium text-gray-900 text-right ${capitalize ? "capitalize" : ""} ${uppercase ? "uppercase" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
