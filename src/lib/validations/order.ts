import { z } from "zod";

export const createOrderSchema = z.object({
  brandSlug: z.enum(["dapur-bwaji", "hoki-dimsum"]),
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerPhone: z
    .string()
    .regex(/^(08|\+628)\d{8,11}$/, "Format nomor HP tidak valid"),
  customerNote: z.string().optional(),
  paymentMethod: z.enum(["cash", "transfer", "qris"]),
  items: z
    .array(
      z.object({
        menuItemId: z.string().uuid(),
        quantity: z.number().min(1).max(99),
      })
    )
    .min(1, "Minimal 1 item"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "delivered",
    "cancelled",
  ]),
});

export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
