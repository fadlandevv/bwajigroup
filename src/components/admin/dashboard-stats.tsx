import { ShoppingBag, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";

interface StatsProps {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
}

export function DashboardStats({
  totalOrders,
  totalRevenue,
  pendingOrders,
  completedOrders,
}: StatsProps) {
  const stats = [
    {
      label: "Total Order",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Total Revenue",
      value: formatRupiah(totalRevenue),
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Menunggu",
      value: pendingOrders.toString(),
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "Selesai",
      value: completedOrders.toString(),
      icon: CheckCircle,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`rounded-xl p-3 ${bg}`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
