import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { MenuForm } from "@/components/admin/menu-form";
import { auth } from "@/lib/auth";
import { getSessionBrand } from "@/lib/session-brand";
import { PageHeader, PageContent } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "Tambah Menu" };

export default async function NewMenuPage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);

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
            <span>Tambah Menu</span>
          </div>
        }
        description="Isi detail menu baru"
      />
      <PageContent>
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <MenuForm mode="create" lockedBrand={brandFilter} />
        </div>
      </PageContent>
    </>
  );
}
