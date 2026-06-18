import type { Metadata } from "next";
import { KitchenDisplay } from "@/components/admin/kitchen-display";

export const metadata: Metadata = { title: "Dapur — Kitchen Display" };

export default function KitchenPage() {
  return <KitchenDisplay />;
}
