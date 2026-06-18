import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc, eq, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { getSessionBrand, BRAND_NAMES } from "@/lib/session-brand";
import { PageHeader, PageContent } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "Kelola Order" };

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
  ready: "Siap",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
};

export default async function AdminOrdersPage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);

  let allOrders: typeof orders.$inferSelect[] = [];
  try {
    allOrders = brandFilter
      ? await db.select().from(orders).where(eq(orders.brandSlug, brandFilter)).orderBy(desc(orders.createdAt))
      : await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch {
    // DB belum terhubung
  }

  const brandLabel = brandFilter ? ` — ${BRAND_NAMES[brandFilter]}` : "";

  return (
    <>
      <PageHeader
        title="Kelola Order"
        description={`${allOrders.length} order masuk${brandLabel}`}
      />
      <PageContent className="space-y-3">
      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {allOrders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-gray-500">
                  #{order.id.slice(0, 6).toUpperCase()}
                </span>
                <Badge variant={statusVariantMap[order.status] ?? "gray"}>
                  {statusLabelMap[order.status] ?? order.status}
                </Badge>
              </div>
              <p className="font-semibold text-gray-900">{order.customerName}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">
                {order.brandSlug.replace("-", " ")} &middot;{" "}
                <span className="uppercase">{order.paymentMethod}</span>
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-none">
              <span className="font-bold text-gray-900 text-sm">{formatRupiah(order.totalAmount)}</span>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          </Link>
        ))}
        {allOrders.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
            Belum ada order masuk.
          </div>
        )}
      </div>

      {/* Desktop: table */}
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
            {allOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-400">{order.customerPhone}</p>
                </td>
                {!brandFilter && (
                  <td className="px-4 py-3 capitalize text-gray-500">
                    {order.brandSlug.replace("-", " ")}
                  </td>
                )}
                <td className="px-4 py-3 uppercase text-gray-500">{order.paymentMethod}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatRupiah(order.totalAmount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={statusVariantMap[order.status] ?? "gray"}>
                    {statusLabelMap[order.status] ?? order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-orange-500 hover:underline">
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {allOrders.length === 0 && (
          <div className="py-12 text-center text-gray-400">Belum ada order masuk.</div>
        )}
      </div>
      </PageContent>
    </>
  );
}
