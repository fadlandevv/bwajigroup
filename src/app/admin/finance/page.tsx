import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getSessionBrand } from "@/lib/session-brand";
import { AdminFinanceClient } from "@/components/admin/finance-client";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);
  return <AdminFinanceClient brandFilter={brandFilter} />;
}
