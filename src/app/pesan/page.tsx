import type { Metadata } from "next";
import { OrderApp } from "@/components/order/order-app";

export const metadata: Metadata = {
  title: "Pesan Sekarang | Bwaji Group",
  description: "Pesan menu favoritmu dari Dapur Bwaji & Hoki Dimsum.",
};

export default function PesanPage() {
  return (
    <div className="flex h-dvh flex-col">
      <OrderApp />
    </div>
  );
}
