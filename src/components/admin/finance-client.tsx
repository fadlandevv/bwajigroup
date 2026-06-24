"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { FinanceChart } from "@/components/admin/finance-chart";
import { TrendingUp, Calendar, Wallet } from "lucide-react";
import { PageHeader, PageContent } from "@/components/admin/page-header";
import { BRAND_NAMES } from "@/lib/session-brand";

type FinanceData = {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  perBrand: { brand: string; total: string | null; count: number }[];
  perPayment: { method: string; total: string | null; count: number }[];
  chartData: { date: string; total: string | null; count: number }[];
  statusCounts: { status: string; count: number }[];
};

const paymentLabels: Record<string, string> = { cash: "Cash", transfer: "Transfer", qris: "QRIS" };
const paymentColors: Record<string, string> = { cash: "bg-blue-400", transfer: "bg-purple-400", qris: "bg-orange-400" };

function StatSkeleton() {
  return <div className="rounded-2xl border border-gray-200 bg-white p-4 animate-pulse space-y-2">
    <div className="h-3 w-24 rounded bg-gray-200" />
    <div className="h-7 w-32 rounded bg-gray-200" />
  </div>;
}

export function AdminFinanceClient({ brandFilter }: { brandFilter: string | null }) {
  const [data, setData] = useState<FinanceData | null>(null);

  useEffect(() => {
    const url = brandFilter ? `/api/finance?brand=${brandFilter}` : "/api/finance";
    fetch(url).then((r) => r.json()).then(setData).catch(() => {});
  }, [brandFilter]);

  const brandLabel = brandFilter ? ` — ${BRAND_NAMES[brandFilter as keyof typeof BRAND_NAMES] ?? brandFilter}` : "";
  const totalPerPayment = data ? (data.perPayment.reduce((s, p) => s + Number(p.total ?? 0), 0) || 1) : 1;

  return (
    <>
      <PageHeader title="Finance" description={`Rekap keuangan dari order selesai${brandLabel}`} />
      <PageContent className="space-y-5">
        {/* Revenue cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {!data ? (
            <><StatSkeleton /><StatSkeleton /><StatSkeleton /></>
          ) : (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-500" /><span className="text-xs text-gray-400 font-medium">Total Revenue</span></div>
                <p className="text-xl font-bold text-gray-900">{formatRupiah(data.totalRevenue)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2"><Calendar size={16} className="text-blue-500" /><span className="text-xs text-gray-400 font-medium">Hari Ini</span></div>
                <p className="text-xl font-bold text-gray-900">{formatRupiah(data.todayRevenue)}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2"><Wallet size={16} className="text-purple-500" /><span className="text-xs text-gray-400 font-medium">Bulan Ini</span></div>
                <p className="text-xl font-bold text-gray-900">{formatRupiah(data.monthRevenue)}</p>
              </div>
            </>
          )}
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Revenue 7 Hari Terakhir</p>
          {!data ? (
            <div className="h-40 rounded-xl bg-gray-100 animate-pulse" />
          ) : (
            <FinanceChart data={data.chartData} />
          )}
        </div>

        {/* Per brand */}
        {!brandFilter && data && data.perBrand.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Per Brand</p>
            <div className="space-y-3">
              {data.perBrand.map((b) => {
                const pct = data.totalRevenue > 0 ? (Number(b.total ?? 0) / data.totalRevenue) * 100 : 0;
                return (
                  <div key={b.brand}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700 capitalize">{BRAND_NAMES[b.brand as keyof typeof BRAND_NAMES] ?? b.brand}</span>
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

        {/* Per payment */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
          <p className="text-sm font-semibold text-gray-700 mb-4">Metode Pembayaran</p>
          {!data ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-8 rounded-xl bg-gray-100 animate-pulse" />)}</div>
          ) : data.perPayment.length === 0 ? (
            <p className="text-sm text-gray-400">Belum ada data</p>
          ) : data.perPayment.map((p) => {
            const pct = (Number(p.total ?? 0) / totalPerPayment) * 100;
            return (
              <div key={p.method} className="mb-3">
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
          })}
        </div>
      </PageContent>
    </>
  );
}
