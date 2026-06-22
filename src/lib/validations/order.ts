import { z } from "zod";

// Schema for the checkout form — plain object, no ZodEffects
// Delivery address validated manually in the submit handler
export const orderFormSchema = z.object({
  customerName: z.string().min(2, "Nama minimal 2 karakter"),
  customerPhone: z
    .string()
    .min(1, "Nomor HP wajib diisi")
    .regex(/^(08|\+628)\d{8,11}$/, "Format HP tidak valid (contoh: 081234567890)"),
  customerNote: z.string().optional(),
  paymentMethod: z.enum(["cash", "transfer", "qris"]),
  deliveryType: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().optional(),
});

// Full schema used by the API endpoint
export const createOrderSchema = z
  .object({
    brandSlug: z.enum(["dapur-bwaji", "hoki-dimsum"]),
    customerName: z.string().min(2, "Nama minimal 2 karakter"),
    customerPhone: z
      .string()
      .regex(/^(08|\+628)\d{8,11}$/, "Format nomor HP tidak valid"),
    customerNote: z.string().optional(),
    paymentMethod: z.enum(["cash", "transfer", "qris"]),
    deliveryType: z.enum(["pickup", "delivery"]),
    deliveryAddress: z.string().optional(),
    customerId: z.string().uuid().optional(),
    items: z
      .array(
        z.object({
          menuItemId: z.string().min(1),
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

export type OrderFormData = z.infer<typeof orderFormSchema>;
export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusSchema = z.infer<typeof updateOrderStatusSchema>;
