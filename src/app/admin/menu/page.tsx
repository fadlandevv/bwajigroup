import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";

export const metadata: Metadata = { title: "Kelola Menu" };

export default async function AdminMenuPage() {
  let items: typeof menuItems.$inferSelect[] = [];
  try {
    items = await db.select().from(menuItems).orderBy(menuItems.createdAt);
  } catch {
    // DB belum terhubung
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Menu</h1>
          <p className="text-sm text-gray-500">{items.length} item terdaftar</p>
        </div>
        <Link href="/admin/menu/new">
          <Button>
            <Plus size={16} />
            Tambah Menu
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Menu</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Brand</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Kategori</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Harga</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">
                  {item.brandSlug.replace("-", " ")}
                </td>
                <td className="px-4 py-3 text-gray-500">{item.category}</td>
                <td className="px-4 py-3 text-right text-gray-900">
                  {formatRupiah(item.price)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={item.isAvailable ? "success" : "danger"}>
                    {item.isAvailable ? "Tersedia" : "Habis"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/menu/${item.id}`}
                    className="text-orange-500 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            Belum ada menu. Tambahkan menu pertama kamu.
          </div>
        )}
      </div>
    </div>
  );
}
