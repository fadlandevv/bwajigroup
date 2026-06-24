import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brandSettings, brandEnum } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

type BrandSlug = (typeof brandEnum.enumValues)[number];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const [brand] = await db
    .select()
    .from(brandSettings)
    .where(eq(brandSettings.brandSlug, slug as BrandSlug));
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(brand);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();

  const [existing] = await db
    .select()
    .from(brandSettings)
    .where(eq(brandSettings.brandSlug, slug as BrandSlug));

  if (!existing) {
    const [created] = await db
      .insert(brandSettings)
      .values({ brandSlug: slug as BrandSlug, displayName: body.displayName ?? slug, ...body })
      .returning();
    return NextResponse.json(created);
  }

  const [updated] = await db
    .update(brandSettings)
    .set({
      displayName: body.displayName ?? existing.displayName,
      description: body.description ?? existing.description,
      phone: body.phone ?? existing.phone,
      address: body.address ?? existing.address,
      isActive: body.isActive ?? existing.isActive,
      updatedAt: new Date(),
    })
    .where(eq(brandSettings.brandSlug, slug as BrandSlug))
    .returning();

  return NextResponse.json(updated);
}
