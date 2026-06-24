"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Copy, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { orderFormSchema, type OrderFormData } from "@/lib/validations/order";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatRupiah } from "@/lib/utils";

type Step = "form" | "qris";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, brandSlug, getTotalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("form");
  const [totalAmount, setTotalAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { paymentMethod: "qris", deliveryType: "pickup" },
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (data: OrderFormData) => {
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

      const total = getTotalPrice();
      clearCart();

      if (data.paymentMethod === "qris") {
        setTotalAmount(total);
        setStep("qris");
      } else {
        router.push("/checkout/success");
      }
    } catch {
      alert("Terjadi kesalahan, coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function copyAmount() {
    navigator.clipboard.writeText(String(totalAmount));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (items.length === 0 && step === "form") {
    router.push("/cart");
    return null;
  }

  if (step === "qris") {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-gray-50">
          <div className="mx-auto max-w-md px-4 py-10 sm:px-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Langkah 2 dari 2</p>
                <h1 className="mt-2 text-2xl font-bold text-gray-900">Scan & Bayar</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Scan QR di bawah menggunakan aplikasi pembayaran apapun
                </p>
              </div>

              {/* Nominal */}
              <div className="rounded-xl bg-orange-50 border border-orange-100 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">Transfer tepat sebesar</p>
                <p className="mt-1 text-4xl font-black text-orange-500">
                  {formatRupiah(totalAmount)}
                </p>
                <button
                  onClick={copyAmount}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-orange-400 hover:text-orange-600"
                >
                  {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                  {copied ? "Disalin!" : "Salin nominal"}
                </button>
              </div>

              {/* QRIS Image */}
              <div className="flex justify-center">
                <div className="relative h-56 w-56 overflow-hidden rounded-xl border-2 border-gray-200">
                  <Image
                    src="/qris.svg"
                    alt="QRIS Bwaji Group"
                    fill
                    className="object-contain p-2"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Pastikan nominal yang kamu transfer <span className="font-semibold text-gray-600">sama persis</span> agar pesanan langsung diproses.
              </p>

              <Button className="w-full" onClick={() => router.push("/checkout/success")}>
                Saya Sudah Bayar
              </Button>

              <p className="text-xs text-gray-400">
                Butuh bantuan?{" "}
                <a href="https://wa.me/62" className="text-orange-500 hover:underline">
                  Hubungi via WhatsApp
                </a>
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
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
                <label className="text-sm font-medium text-gray-700">Catatan (opsional)</label>
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
                <label key={method} className="flex cursor-pointer items-center gap-3 rounded-xl border border-transparent p-2 hover:bg-gray-50">
                  <input
                    type="radio"
                    value={method}
                    {...register("paymentMethod")}
                    className="accent-orange-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {method === "qris" ? "QRIS" : method === "transfer" ? "Transfer Bank" : "Bayar di Tempat (Cash)"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {method === "qris"
                        ? "Scan QR, bayar sesuai nominal"
                        : method === "transfer"
                        ? "Transfer ke rekening kami"
                        : "Bayar langsung saat ambil pesanan"}
                    </p>
                  </div>
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
                {isSubmitting
                  ? "Memproses..."
                  : paymentMethod === "qris"
                  ? "Lanjut ke Pembayaran QRIS →"
                  : "Buat Pesanan"}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
