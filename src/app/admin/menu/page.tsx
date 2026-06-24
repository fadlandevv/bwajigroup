import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getSessionBrand } from "@/lib/session-brand";
import { AdminMenuClient } from "@/components/admin/menu-client";

export const metadata: Metadata = { title: "Kelola Menu" };

export default async function AdminMenuPage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);
  return <AdminMenuClient brandFilter={brandFilter} />;
}
