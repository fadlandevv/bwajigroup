import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getSessionBrand, BRAND_NAMES } from "@/lib/session-brand";

export const metadata: Metadata = { title: "Kelola Menu" };

export default async function AdminMenuPage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);

  let items: typeof menuItems.$inferSelect[] = [];
  try {
    items = brandFilter
      ? await db.select().from(menuItems).where(eq(menuItems.brandSlug, brandFilter)).orderBy(menuItems.createdAt)
      : await db.select().from(menuItems).orderBy(menuItems.createdAt);
  } catch {
    // DB belum terhubung
  }

  const brandLabel = brandFilter ? ` — ${BRAND_NAMES[brandFilter]}` : "";

  return (
    <>
      <PageHeader
        title="Kelola Menu"
        description={`${items.length} item terdaftar${brandLabel}`}
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
      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/admin/menu/${item.id}`}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50"
          >
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
        {items.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-16 text-center text-gray-400">
            Belum ada menu.
          </div>
        )}
      </div>

      {/* Desktop: table */}
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
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                {!brandFilter && (
                  <td className="px-4 py-3 text-gray-500 capitalize">{item.brandSlug.replace("-", " ")}</td>
                )}
                <td className="px-4 py-3 text-gray-500">{item.category}</td>
                <td className="px-4 py-3 text-right text-gray-900">{formatRupiah(item.price)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={item.isAvailable ? "success" : "danger"}>
                    {item.isAvailable ? "Tersedia" : "Habis"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/menu/${item.id}`} className="text-orange-500 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-12 text-center text-gray-400">Belum ada menu. Tambahkan menu pertama kamu.</div>
        )}
      </div>
      </PageContent>
    </>
  );
}
