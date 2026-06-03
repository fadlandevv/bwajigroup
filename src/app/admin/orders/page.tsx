import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

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
  let allOrders: typeof orders.$inferSelect[] = [];
  try {
    allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
  } catch {
    // DB belum terhubung
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Order</h1>
        <p className="text-sm text-gray-500">{allOrders.length} order masuk</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Pelanggan</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Brand</th>
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
                <td className="px-4 py-3 capitalize text-gray-500">
                  {order.brandSlug.replace("-", " ")}
                </td>
                <td className="px-4 py-3 uppercase text-gray-500">
                  {order.paymentMethod}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatRupiah(order.totalAmount)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={statusVariantMap[order.status] ?? "gray"}>
                    {statusLabelMap[order.status] ?? order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-orange-500 hover:underline"
                  >
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
    </div>
  );
}
