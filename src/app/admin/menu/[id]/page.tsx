import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MenuForm } from "@/components/admin/menu-form";
import { auth } from "@/lib/auth";
import { getSessionBrand } from "@/lib/session-brand";
import { PageHeader, PageContent } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "Edit Menu" };

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const brandFilter = getSessionBrand(session);

  const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
  if (!item) notFound();

  if (brandFilter && item.brandSlug !== brandFilter) notFound();

  return (
    <>
      <PageHeader
        title={
          <div className="flex flex-col gap-1">
            <Link
              href="/admin/menu"
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 w-fit"
            >
              <ChevronLeft size={13} /> Kelola Menu
            </Link>
            <span>Edit Menu</span>
          </div>
        }
        description={item.name}
      />
      <PageContent>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <MenuForm
            mode="edit"
            lockedBrand={brandFilter}
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
      </PageContent>
    </>
  );
}
