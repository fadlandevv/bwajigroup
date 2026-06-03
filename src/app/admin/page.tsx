import type { Metadata } from "next";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, sum, count } from "drizzle-orm";
import { DashboardStats } from "@/components/admin/dashboard-stats";

export const metadata: Metadata = { title: "Dashboard Admin" };

export default async function AdminDashboardPage() {
  let totalOrdersResult = { count: 0 };
  let revenueResult: { total: string | null } = { total: "0" };
  let pendingResult = { count: 0 };
  let completedResult = { count: 0 };

  try {
    [totalOrdersResult] = await db.select({ count: count() }).from(orders);
    [revenueResult] = await db
      .select({ total: sum(orders.totalAmount) })
      .from(orders)
      .where(eq(orders.status, "delivered"));
    [pendingResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "pending"));
    [completedResult] = await db
      .select({ count: count() })
      .from(orders)
      .where(eq(orders.status, "delivered"));
  } catch {
    // DB belum terhubung
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Selamat datang kembali, Admin.</p>
      </div>

      <DashboardStats
        totalOrders={totalOrdersResult.count}
        totalRevenue={Number(revenueResult.total ?? 0)}
        pendingOrders={pendingResult.count}
        completedOrders={completedResult.count}
      />
    </div>
  );
}
