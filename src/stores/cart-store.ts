import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartState, CartItem } from "@/types";
import type { MenuItem } from "@/types/menu";
import type { BrandSlug } from "@/types/brand";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      brandSlug: null,
      items: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (menuItem: MenuItem) => {
        const { brandSlug, items } = get();

        if (brandSlug && brandSlug !== menuItem.brandSlug) {
          if (
            !window.confirm(
              "Menambahkan item dari brand berbeda akan mereset keranjang. Lanjutkan?"
            )
          ) {
            return;
          }
          set({ brandSlug: menuItem.brandSlug, items: [] });
        }

        const existing = items.find((i) => i.menuItem.id === menuItem.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.menuItem.id === menuItem.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({
            brandSlug: menuItem.brandSlug as BrandSlug,
            items: [...items, { menuItem, quantity: 1 }],
          });
        }
      },

      removeItem: (menuItemId: string) => {
        const items = get().items.filter((i) => i.menuItem.id !== menuItemId);
        set({ items, brandSlug: items.length === 0 ? null : get().brandSlug });
      },

      updateQuantity: (menuItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.menuItem.id === menuItemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], brandSlug: null }),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.menuItem.price * i.quantity,
          0
        ),
    }),
    {
      name: "bwajigroup-cart",
    }
  )
);
