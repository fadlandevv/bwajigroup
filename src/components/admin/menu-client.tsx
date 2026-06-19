"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { BRAND_NAMES } from "@/lib/session-brand";

type MenuItem = {
  id: string;
  brandSlug: string;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string | null;
};

export function AdminMenuClient({ brandFilter }: { brandFilter: string | null }) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = brandFilter ? `/api/menu?brand=${brandFilter}` : "/api/menu";
    fetch(url)
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [brandFilter]);

  const brandLabel = brandFilter ? ` — ${BRAND_NAMES[brandFilter as keyof typeof BRAND_NAMES] ?? brandFilter}` : "";

  return (
    <>
      <PageHeader
        title="Kelola Menu"
        description={loading ? "Memuat..." : `${items.length} item terdaftar${brandLabel}`}
        action={
          <Link href="/admin/menu/new">
            <Button size="sm">
              <Plus size={16} />
              <span className="hidden sm:inline">Tambah Menu</span>
              <span className="sm:hidden">Tambah</span>
            </Button>
          </Link>
        }
      />
      <PageContent className="space-y-3">
        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 animate-pulse">
                <div className="h-14 w-14 rounded-xl bg-gray-200 flex-none" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-28 rounded bg-gray-200" />
                  <div className="h-3 w-20 rounded bg-gray-100" />
                  <div className="h-4 w-16 rounded bg-gray-200" />
                </div>
                <div className="h-6 w-16 rounded-full bg-gray-200" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
              Belum ada menu.
            </div>
          ) : items.map((item) => (
            <Link key={item.id} href={`/admin/menu/${item.id}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50">
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-xl object-cover flex-none" />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gray-100 flex-none" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">
                  {!brandFilter && `${item.brandSlug.replace("-", " ")} · `}{item.category}
                </p>
                <p className="text-sm font-medium text-gray-700 mt-1">{formatRupiah(item.price)}</p>
              </div>
              <Badge variant={item.isAvailable ? "success" : "danger"} className="flex-none">
                {item.isAvailable ? "Tersedia" : "Habis"}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Menu</th>
                {!brandFilter && <th className="px-4 py-3 text-left font-medium text-gray-500">Brand</th>}
                <th className="px-4 py-3 text-left font-medium text-gray-500">Kategori</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Harga</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-gray-200" /></td>
                    {!brandFilter && <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-gray-200" /></td>}
                    <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-gray-200" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200 ml-auto" /></td>
                    <td className="px-4 py-3"><div className="h-6 w-16 rounded-full bg-gray-200 mx-auto" /></td>
                    <td className="px-4 py-3"><div className="h-4 w-8 rounded bg-gray-200 ml-auto" /></td>
                  </tr>
                ))
              ) : items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  {!brandFilter && <td className="px-4 py-3 text-gray-500 capitalize">{item.brandSlug.replace("-", " ")}</td>}
                  <td className="px-4 py-3 text-gray-500">{item.category}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{formatRupiah(item.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={item.isAvailable ? "success" : "danger"}>
                      {item.isAvailable ? "Tersedia" : "Habis"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/menu/${item.id}`} className="text-orange-500 hover:underline">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && items.length === 0 && (
            <div className="py-12 text-center text-gray-400">Belum ada menu. Tambahkan menu pertama kamu.</div>
          )}
        </div>
      </PageContent>
    </>
  );
}
