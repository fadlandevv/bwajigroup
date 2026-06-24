CREATE TYPE "public"."delivery_type" AS ENUM('pickup', 'delivery');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_type" "delivery_type" DEFAULT 'pickup' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivery_address" text;