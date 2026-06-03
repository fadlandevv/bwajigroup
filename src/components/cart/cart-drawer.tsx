"use client";

import Link from "next/link";
import { X, ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function CartDrawer() {
  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalPrice,
  } = useCartStore();

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-orange-500" />
            <h2 className="font-semibold text-gray-900">Keranjang</h2>
            {items.length > 0 && (
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                {items.length} item
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <ShoppingCart size={28} className="text-gray-400" />
              </div>
              <p className="font-medium text-gray-500">Keranjang masih kosong</p>
              <p className="text-sm text-gray-400">Tambahkan menu favoritmu!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 px-5">
              {items.map(({ menuItem, quantity }) => (
                <div key={menuItem.id} className="flex items-center gap-3 py-4">
                  {/* Image */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {menuItem.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={menuItem.imageUrl}
                        alt={menuItem.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl">🍽️</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{menuItem.name}</p>
                    <p className="text-sm font-semibold text-orange-500">{formatRupiah(menuItem.price)}</p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => removeItem(menuItem.id)}
                      className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="text-lg font-bold text-gray-900">{formatRupiah(getTotalPrice())}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                className="flex-shrink-0 rounded-lg border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-white transition-colors"
              >
                Kosongkan
              </button>
              <Link href="/checkout" onClick={closeCart} className="flex-1">
                <Button className="w-full">Checkout</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
