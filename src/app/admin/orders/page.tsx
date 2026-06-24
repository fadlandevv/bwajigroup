import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getSessionBrand } from "@/lib/session-brand";
import { AdminOrdersClient } from "@/components/admin/orders-client";

export const metadata: Metadata = { title: "Kelola Order" };

export default async function AdminOrdersPage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);
  return <AdminOrdersClient brandFilter={brandFilter} />;
}
