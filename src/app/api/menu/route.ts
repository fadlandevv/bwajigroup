import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { menuItems } from "@/lib/db/schema";
import { menuItemSchema } from "@/lib/validations/menu";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { dummyMenuDapurBwaji, dummyMenuHokiDimsum } from "@/lib/data/dummy-menu";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const brandSlug = searchParams.get("brand");

  try {
    const query = db.select().from(menuItems);
    const result = brandSlug
      ? await query.where(eq(menuItems.brandSlug, brandSlug as "dapur-bwaji" | "hoki-dimsum"))
      : await query;

    if (result.length > 0) return NextResponse.json(result);
  } catch {
    // DB tidak tersedia, gunakan dummy
  }

  const fallback =
    brandSlug === "dapur-bwaji" ? dummyMenuDapurBwaji :
    brandSlug === "hoki-dimsum" ? dummyMenuHokiDimsum :
    [...dummyMenuDapurBwaji, ...dummyMenuHokiDimsum];

  return NextResponse.json(fallback);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = menuItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const [item] = await db
    .insert(menuItems)
    .values({
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
    })
    .returning();

  return NextResponse.json(item, { status: 201 });
}
