import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MenuForm } from "@/components/admin/menu-form";

export const metadata: Metadata = { title: "Tambah Menu" };

export default function NewMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/menu"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={15} /> Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Menu</h1>
        <p className="text-sm text-gray-500">Isi detail menu baru</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <MenuForm mode="create" />
      </div>
    </div>
  );
}
