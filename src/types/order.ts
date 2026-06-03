import type { BrandSlug } from "./brand";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cash" | "transfer" | "qris";

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  brandSlug: BrandSlug;
  customerName: string;
  customerPhone: string;
  customerNote: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderPayload {
  brandSlug: BrandSlug;
  customerName: string;
  customerPhone: string;
  customerNote?: string;
  paymentMethod: PaymentMethod;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
}
