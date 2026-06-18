import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getSessionBrand, BRAND_NAMES } from "@/lib/session-brand";
import { KitchenDisplay } from "@/components/admin/kitchen-display";

export const metadata: Metadata = { title: "Dapur — Kitchen Display" };

export default async function KitchenPage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);
  const brandLabel = brandFilter ? BRAND_NAMES[brandFilter] : null;

  return <KitchenDisplay brandLabel={brandLabel} />;
}
