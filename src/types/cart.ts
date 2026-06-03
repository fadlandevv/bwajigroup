import type { BrandSlug } from "./brand";
import type { MenuItem } from "./menu";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface CartState {
  brandSlug: BrandSlug | null;
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}
