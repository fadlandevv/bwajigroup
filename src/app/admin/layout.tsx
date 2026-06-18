import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { auth } from "@/lib/auth";
import { getSessionBrand, BRAND_NAMES } from "@/lib/session-brand";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Login page — no nav, no layout chrome
  if (!session) {
    return <>{children}</>;
  }

  const brandFilter = getSessionBrand(session);
  const brandLabel = brandFilter ? BRAND_NAMES[brandFilter] : null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar brandLabel={brandLabel} />
      <div className="flex flex-1 flex-col min-h-0 min-w-0">
        <main className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
      <AdminMobileNav brandLabel={brandLabel} />
    </div>
  );
}
