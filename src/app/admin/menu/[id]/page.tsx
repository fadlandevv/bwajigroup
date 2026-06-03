import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MenuForm } from "@/components/admin/menu-form";

export const metadata: Metadata = { title: "Edit Menu" };

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!item) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/menu"
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={15} /> Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Menu</h1>
        <p className="text-sm text-gray-500">{item.name}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <MenuForm
          mode="edit"
          defaultValues={{
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl ?? "",
            category: item.category,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            brandSlug: item.brandSlug,
          }}
        />
      </div>
    </div>
  );
}
