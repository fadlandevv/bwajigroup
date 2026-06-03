"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCartStore } from "@/stores/cart-store";
import { createOrderSchema, type CreateOrderSchema } from "@/lib/validations/order";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatRupiah } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, brandSlug, getTotalPrice, clearCart } = useCartStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderSchema>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { brandSlug: brandSlug ?? undefined, paymentMethod: "qris" },
  });

  const onSubmit = async (data: CreateOrderSchema) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        brandSlug,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Order gagal");

      clearCart();
      router.push("/checkout/success");
    } catch {
      alert("Terjadi kesalahan, coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/cart" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
              <h2 className="font-semibold text-gray-900">Data Pemesan</h2>
              <Input
                label="Nama Lengkap"
                placeholder="John Doe"
                error={errors.customerName?.message}
                {...register("customerName")}
              />
              <Input
                label="Nomor HP"
                placeholder="08xxxxxxxxxx"
                error={errors.customerPhone?.message}
                {...register("customerPhone")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Catatan (opsional)
                </label>
                <textarea
                  className="h-20 w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Contoh: tidak pedas, tidak pakai bawang..."
                  {...register("customerNote")}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-3">
              <h2 className="font-semibold text-gray-900">Metode Pembayaran</h2>
              {(["qris", "transfer", "cash"] as const).map((method) => (
                <label key={method} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    value={method}
                    {...register("paymentMethod")}
                    className="accent-orange-500"
                  />
                  <span className="text-sm font-medium capitalize text-gray-700">
                    {method === "qris" ? "QRIS" : method === "transfer" ? "Transfer Bank" : "Bayar di Tempat (Cash)"}
                  </span>
                </label>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">Total Pembayaran</p>
                <p className="text-xl font-bold text-orange-500">
                  {formatRupiah(getTotalPrice())}
                </p>
              </div>
              <Button type="submit" className="mt-4 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Memproses..." : "Buat Pesanan"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
