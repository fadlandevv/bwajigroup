import type { Session } from "next-auth";
import type { brandEnum } from "@/lib/db/schema";

export type BrandSlug = (typeof brandEnum.enumValues)[number];

export const BRAND_NAMES: Record<BrandSlug, string> = {
  "dapur-bwaji": "Dapur Bwaji",
  "hoki-dimsum": "Hoki Dimsum",
};

/**
 * Returns the user's brand filter. null = super admin (no filter).
 */
export function getSessionBrand(session: Session | null): BrandSlug | null {
  return (session?.user?.brandSlug as BrandSlug | null | undefined) ?? null;
}

export function isSuperAdmin(session: Session | null): boolean {
  return getSessionBrand(session) === null;
}
