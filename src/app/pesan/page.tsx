import type { Metadata } from "next";
import { OrderApp } from "@/components/order/order-app";

export const metadata: Metadata = {
  title: "Pesan Sekarang | Bwaji Group",
  description: "Pesan menu favoritmu dari Dapur Bwaji & Hoki Dimsum.",
};

export default function PesanPage() {
  return (
    // Mobile: full screen | Desktop: centered phone-like container
    <div className="min-h-dvh bg-gray-200/70 md:flex md:items-start md:justify-center md:py-8">
      <div className="flex h-dvh w-full flex-col md:h-[90vh] md:max-w-[430px] md:overflow-hidden md:rounded-3xl md:shadow-2xl">
        <OrderApp />
      </div>
    </div>
  );
}
