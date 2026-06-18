import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders, menuItems, storeSettings, brandSettings, DEFAULT_OPENING_HOURS } from "@/lib/db/schema";
import { eq, count, and, gte, sum } from "drizzle-orm";
import { formatRupiah } from "@/lib/utils";
import { StoreToggle } from "@/components/admin/store-toggle";
import { ShoppingBag, UtensilsCrossed, ChefHat, TrendingUp, ChevronRight, Clock } from "lucide-react";
import type { OpeningHours } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { getSessionBrand, isSuperAdmin, BRAND_NAMES } from "@/lib/session-brand";
import { PageHeader, PageContent } from "@/components/admin/page-header";

export const metadata: Metadata = { title: "Dashboard" };

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

export default async function AdminDashboardPage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);
  const superAdmin = isSuperAdmin(session);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let totalOrders = 0;
  let pendingOrders = 0;
  let activeOrders = 0;
  let todayOrders = 0;
  let todayRevenue = 0;
  let totalMenu = 0;
  let availableMenu = 0;
  let isOpen = true;
  let openingHours: OpeningHours = DEFAULT_OPENING_HOURS;

  // Brand-specific toggle state
  let brandIsOpen = true;

  try {
    const brandWhere = brandFilter ? eq(orders.brandSlug, brandFilter) : undefined;
    const menuBrandWhere = brandFilter ? eq(menuItems.brandSlug, brandFilter) : undefined;

    const [conf] = await db.select({ count: count() }).from(orders).where(
      brandWhere ? and(eq(orders.status, "confirmed"), brandWhere) : eq(orders.status, "confirmed")
    );
    const [prep] = await db.select({ count: count() }).from(orders).where(
      brandWhere ? and(eq(orders.status, "preparing"), brandWhere) : eq(orders.status, "preparing")
    );
    const [ready] = await db.select({ count: count() }).from(orders).where(
      brandWhere ? and(eq(orders.status, "ready"), brandWhere) : eq(orders.status, "ready")
    );
    const [pend] = await db.select({ count: count() }).from(orders).where(
      brandWhere ? and(eq(orders.status, "pending"), brandWhere) : eq(orders.status, "pending")
    );
    const todayQ = brandWhere
      ? await db.select({ count: count() }).from(orders).where(and(gte(orders.createdAt, todayStart), brandWhere))
      : await db.select({ count: count() }).from(orders).where(gte(orders.createdAt, todayStart));
    const [todayRev] = brandWhere
      ? await db.select({ total: sum(orders.totalAmount) }).from(orders).where(and(eq(orders.status, "delivered"), gte(orders.createdAt, todayStart), brandWhere))
      : await db.select({ total: sum(orders.totalAmount) }).from(orders).where(and(eq(orders.status, "delivered"), gte(orders.createdAt, todayStart)));

    pendingOrders = pend.count;
    activeOrders = conf.count + prep.count + ready.count;
    todayOrders = todayQ[0]?.count ?? 0;
    todayRevenue = Number(todayRev?.total ?? 0);

    const [menuTot] = menuBrandWhere
      ? await db.select({ count: count() }).from(menuItems).where(menuBrandWhere)
      : await db.select({ count: count() }).from(menuItems);
    const [menuAvail] = menuBrandWhere
      ? await db.select({ count: count() }).from(menuItems).where(and(eq(menuItems.isAvailable, true), menuBrandWhere))
      : await db.select({ count: count() }).from(menuItems).where(eq(menuItems.isAvailable, true));
    totalMenu = menuTot.count;
    availableMenu = menuAvail.count;

    if (superAdmin) {
      const [store] = await db.select().from(storeSettings).limit(1);
      if (store) {
        isOpen = store.isOpen;
        try { openingHours = JSON.parse(store.openingHours) as OpeningHours; } catch { /* default */ }
      }
    } else if (brandFilter) {
      const [brand] = await db.select().from(brandSettings).where(eq(brandSettings.brandSlug, brandFilter));
      if (brand) brandIsOpen = brand.isOpen;
      const [store] = await db.select().from(storeSettings).limit(1);
      if (store) {
        try { openingHours = JSON.parse(store.openingHours) as OpeningHours; } catch { /* default */ }
      }
    }
  } catch {
    // DB not connected
  }

  const todayDayKey = DAY_KEYS[now.getDay()];
  const todaySchedule = openingHours[todayDayKey];
  const todayDayName = DAY_NAMES[now.getDay()];

  const displayBrandName = brandFilter ? BRAND_NAMES[brandFilter] : null;

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2 flex-wrap">
            Selamat datang 👋
            {displayBrandName && (
              <span className="text-xs font-semibold rounded-full bg-orange-100 text-orange-600 px-2.5 py-0.5">
                {displayBrandName}
              </span>
            )}
          </span>
        }
        description={now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      />
      <PageContent className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/admin/orders" className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-orange-50 p-2.5">
              <ShoppingBag size={20} className="text-orange-500" />
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Orders Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900">{todayOrders}</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-yellow-600 font-medium">{pendingOrders} menunggu</span>
            <span className="text-blue-600 font-medium">{activeOrders} aktif</span>
          </div>
        </Link>

        <Link href="/admin/menu" className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 active:bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-purple-50 p-2.5">
              <UtensilsCrossed size={20} className="text-purple-500" />
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Total Menu</p>
            <p className="text-2xl font-bold text-gray-900">{totalMenu}</p>
          </div>
          <div className="flex gap-3 text-xs">
            <span className="text-green-600 font-medium">{availableMenu} tersedia</span>
            <span className="text-red-500 font-medium">{totalMenu - availableMenu} habis</span>
          </div>
        </Link>
      </div>

      {/* Revenue */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-green-50 p-2">
              <TrendingUp size={18} className="text-green-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700">Revenue Hari Ini</span>
          </div>
          <Link href="/admin/finance" className="text-xs text-orange-500 font-medium flex items-center gap-0.5">
            Finance <ChevronRight size={13} />
          </Link>
        </div>
        <p className="text-3xl font-bold text-gray-900">{formatRupiah(todayRevenue)}</p>
      </div>

      {/* Store toggle */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4">
        <span className="text-sm font-semibold text-gray-700">Status Toko</span>
        {superAdmin ? (
          <StoreToggle initialIsOpen={isOpen} mode="global" />
        ) : brandFilter ? (
          <StoreToggle initialIsOpen={brandIsOpen} mode="brand" brandSlug={brandFilter} />
        ) : null}
      </div>

      {/* Schedule */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm font-semibold text-gray-700">Jadwal Hari Ini</span>
          </div>
          <Link href="/admin/profile" className="text-xs text-orange-500 font-medium flex items-center gap-0.5">
            Edit <ChevronRight size={13} />
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{todayDayName}</span>
          {todaySchedule?.isOpen ? (
            <span className="text-sm font-semibold text-gray-900">{todaySchedule.open} – {todaySchedule.close}</span>
          ) : (
            <span className="text-sm font-semibold text-red-500">Libur</span>
          )}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {DAY_KEYS.map((key, i) => {
            const sched = openingHours[key];
            const isToday = key === todayDayKey;
            return (
              <div key={key} className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 ${isToday ? "bg-orange-50" : ""}`}>
                <span className={`text-[10px] font-medium ${isToday ? "text-orange-500" : "text-gray-400"}`}>
                  {DAY_NAMES[i === 0 ? 0 : i].slice(0, 3)}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${sched?.isOpen ? "bg-green-400" : "bg-gray-200"}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* KDS shortcut */}
      <Link href="/admin/kitchen" className="flex items-center justify-between rounded-2xl border border-orange-200 bg-orange-50 p-4 active:bg-orange-100">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-100 p-2.5">
            <ChefHat size={20} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-700">Tampilan Dapur (KDS)</p>
            <p className="text-xs text-orange-400">Monitor pesanan aktif secara real-time</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-orange-400" />
      </Link>
      </PageContent>
    </>
  );
}
