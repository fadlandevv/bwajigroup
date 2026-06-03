import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const brandEnum = pgEnum("brand_slug", ["dapur-bwaji", "hoki-dimsum"]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "transfer",
  "qris",
]);

export const roleEnum = pgEnum("user_role", ["admin", "staff"]);

// ─── Users (admin) ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("staff"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Menu Items ───────────────────────────────────────────────────────────────
export const menuItems = pgTable("menu_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandSlug: brandEnum("brand_slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  isAvailable: boolean("is_available").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandSlug: brandEnum("brand_slug").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerNote: text("customer_note"),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  totalAmount: integer("total_amount").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Order Items ──────────────────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItems.id),
  menuItemName: text("menu_item_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(),
  subtotal: integer("subtotal").notNull(),
});
