"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatRupiah } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/types/cart";

interface CartItemProps {
  cartItem: CartItemType;
}

export function CartItem({ cartItem }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();
  const { menuItem, quantity } = cartItem;

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{menuItem.name}</p>
        <p className="text-sm text-orange-500">{formatRupiah(menuItem.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(menuItem.id, quantity - 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
          aria-label="Kurangi"
        >
          <Minus size={14} />
        </button>
        <span className="w-5 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => updateQuantity(menuItem.id, quantity + 1)}
          className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
          aria-label="Tambah"
        >
          <Plus size={14} />
        </button>
      </div>

      <p className="w-24 text-right text-sm font-semibold text-gray-900">
        {formatRupiah(menuItem.price * quantity)}
      </p>

      <button
        onClick={() => removeItem(menuItem.id)}
        className="text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Hapus item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
