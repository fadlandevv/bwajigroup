import type { BrandSlug } from "./brand";

export type MenuCategory = string;

export interface MenuItem {
  id: string;
  brandSlug: BrandSlug;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  category: MenuCategory;
  isAvailable: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemFormData {
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  isAvailable: boolean;
  isFeatured: boolean;
  brandSlug: BrandSlug;
}
