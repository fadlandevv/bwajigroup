import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  description: z.string().optional().default(""),
  price: z.number().min(1000, "Harga minimal Rp 1.000"),
  imageUrl: z.string().url("URL gambar tidak valid").optional().or(z.literal("")),
  category: z.string().min(1, "Kategori harus diisi"),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  brandSlug: z.enum(["dapur-bwaji", "hoki-dimsum"]),
});

export type MenuItemSchema = z.infer<typeof menuItemSchema>;
