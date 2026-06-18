import type { Metadata } from "next";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, sum, count, gte, and, sql } from "drizzle-orm";
import { formatRupiah } from "@/lib/utils";
import { FinanceChart } from "@/components/admin/finance-chart";
import { TrendingUp, Calendar, Wallet } from "lucide-react";
import { auth } from "@/lib/auth";
import { getSessionBrand, BRAND_NAMES } from "@/lib/session-brand";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const session = await auth();
  const brandFilter = getSessionBrand(session);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let totalRevenue = 0, todayRevenue = 0, monthRevenue = 0;
  let perBrand: { brand: string; total: string | null; count: number }[] = [];
  let perPayment: { method: string; total: string | null; count: number }[] = [];
  let chartData: { date: string; total: string | null; count: number }[] = [];

  try {
    const deliveredBase = brandFilter
      ? and(eq(orders.status, "delivered"), eq(orders.brandSlug, brandFilter))
      : eq(orders.status, "delivered");

    const [tot] = await db.select({ total: sum(orders.totalAmount) }).from(orders).where(deliveredBase);
    const [today] = await db.select({ total: sum(orders.totalAmount) }).from(orders)
      .where(and(deliveredBase, gte(orders.createdAt, todayStart)));
    const [month] = await db.select({ total: sum(orders.totalAmount) }).from(orders)
      .where(and(deliveredBase, gte(orders.createdAt, monthStart)));

    totalRevenue = Number(tot.total ?? 0);
    todayRevenue = Number(today.total ?? 0);
    monthRevenue = Number(month.total ?? 0);

    if (!brandFilter) {
      perBrand = await db
        .select({ brand: orders.brandSlug, total: sum(orders.totalAmount), count: count() })
        .from(orders).where(eq(orders.status, "delivered")).groupBy(orders.brandSlug) as typeof perBrand;
    }

    perPayment = await db
      .select({ method: orders.paymentMethod, total: sum(orders.totalAmount), count: count() })
      .from(orders).where(deliveredBase).groupBy(orders.paymentMethod) as typeof perPayment;

    chartData = await db
      .select({ date: sql<string>`DATE("created_at")`, total: sum(orders.totalAmount), count: count() })
      .from(orders)
      .where(and(deliveredBase, gte(orders.createdAt, weekAgo)))
      .groupBy(sql`DATE("created_at")`)
      .orderBy(sql`DATE("created_at")`) as typeof chartData;
  } catch {
    // DB not connected
  }

  const totalPerPayment = perPayment.reduce((s, p) => s + Number(p.total ?? 0), 0) || 1;
  const paymentLabels: Record<string, string> = { cash: "Cash", transfer: "Transfer", qris: "QRIS" };
  const paymentColors: Record<string, string> = { cash: "bg-blue-400", transfer: "bg-purple-400", qris: "bg-orange-400" };

  const brandLabel = brandFilter ? ` — ${BRAND_NAMES[brandFilter]}` : "";

  return (
    <>
      <PageHeader
        title="Finance"
        description={`Rekap keuangan dari order selesai${brandLabel}`}
      />
      <PageContent className="space-y-5">

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs text-gray-400 font-medium">Total Revenue</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatRupiah(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-blue-500" />
            <span className="text-xs text-gray-400 font-medium">Hari Ini</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatRupiah(todayRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-purple-500" />
            <span className="text-xs text-gray-400 font-medium">Bulan Ini</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatRupiah(monthRevenue)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Revenue 7 Hari Terakhir</p>
        <FinanceChart data={chartData} />
      </div>

      {!brandFilter && perBrand.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Per Brand</p>
          <div className="space-y-3">
            {perBrand.map((b) => {
              const pct = totalRevenue > 0 ? (Number(b.total ?? 0) / totalRevenue) * 100 : 0;
              return (
                <div key={b.brand}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">
                      {BRAND_NAMES[b.brand as keyof typeof BRAND_NAMES] ?? b.brand}
                    </span>
                    <span className="text-gray-900 font-semibold">{formatRupiah(Number(b.total ?? 0))}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{b.count} order</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
        <p className="text-sm font-semibold text-gray-700 mb-4">Metode Pembayaran</p>
        <div className="space-y-3">
          {perPayment.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada data</p>
          ) : (
            perPayment.map((p) => {
              const pct = (Number(p.total ?? 0) / totalPerPayment) * 100;
              return (
                <div key={p.method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{paymentLabels[p.method] ?? p.method.toUpperCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{p.count} order</span>
                      <span className="text-gray-900 font-semibold">{formatRupiah(Number(p.total ?? 0))}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className={`h-2 rounded-full ${paymentColors[p.method] ?? "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </PageContent>
    </>
  );
}
