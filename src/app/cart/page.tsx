"use client";

import Link from "next/link";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { CartItem } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { formatRupiah } from "@/lib/utils";

export default function CartPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-300" />
              <p className="mt-4 text-gray-500">Keranjang kamu masih kosong.</p>
              <Link href="/">
                <Button className="mt-4">Mulai Pesan</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="divide-y divide-gray-100 px-6">
                {items.map((item) => (
                  <CartItem key={item.menuItem.id} cartItem={item} />
                ))}
              </div>

              <div className="border-t border-gray-100 bg-gray-50 px-6 py-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">Total</p>
                  <p className="text-xl font-bold text-orange-500">
                    {formatRupiah(getTotalPrice())}
                  </p>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1"
                  >
                    Kosongkan
                  </Button>
                  <Link href="/checkout" className="flex-1">
                    <Button className="w-full">Lanjut ke Checkout</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
