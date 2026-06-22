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

export const deliveryTypeEnum = pgEnum("delivery_type", ["pickup", "delivery"]);

export const roleEnum = pgEnum("user_role", ["admin", "staff"]);

// ─── Customers (pemesan) ─────────────────────────────────────────────────────
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Users (admin) ───────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("staff"),
  // null = super admin (sees all brands), set = hanya brand itu
  brandSlug: brandEnum("brand_slug"),
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
  orderCode: text("order_code"),
  customerId: uuid("customer_id").references(() => customers.id, { onDelete: "set null" }),
  brandSlug: brandEnum("brand_slug").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerNote: text("customer_note"),
  status: orderStatusEnum("status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  deliveryType: deliveryTypeEnum("delivery_type").notNull().default("pickup"),
  deliveryAddress: text("delivery_address"),
  paymentProof: text("payment_proof"),
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

// ─── Store Settings (singleton) ───────────────────────────────────────────────
export const storeSettings = pgTable("store_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeName: text("store_name").notNull().default("Bwaji Group"),
  storeAddress: text("store_address").notNull().default(""),
  storePhone: text("store_phone").notNull().default(""),
  storeEmail: text("store_email").notNull().default(""),
  isOpen: boolean("is_open").notNull().default(true),
  // JSON string: { monday: { isOpen, open, close }, ... }
  openingHours: text("opening_hours").notNull().default("{}"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Brand Settings ───────────────────────────────────────────────────────────
export const brandSettings = pgTable("brand_settings", {
  brandSlug: brandEnum("brand_slug").primaryKey(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  isOpen: boolean("is_open").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Chat Messages ────────────────────────────────────────────────────────────
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: text("session_id").notNull(), // phone number
  brandSlug: text("brand_slug").notNull(),
  sender: text("sender").notNull(), // "customer" | "admin"
  senderName: text("sender_name").notNull().default(""),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Types ────────────────────────────────────────────────────────────────────
export type DaySchedule = { isOpen: boolean; open: string; close: string };
export type OpeningHours = Record<
  "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
  DaySchedule
>;

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday:    { isOpen: true, open: "08:00", close: "22:00" },
  tuesday:   { isOpen: true, open: "08:00", close: "22:00" },
  wednesday: { isOpen: true, open: "08:00", close: "22:00" },
  thursday:  { isOpen: true, open: "08:00", close: "22:00" },
  friday:    { isOpen: true, open: "08:00", close: "22:00" },
  saturday:  { isOpen: true, open: "09:00", close: "21:00" },
  sunday:    { isOpen: false, open: "09:00", close: "21:00" },
};
