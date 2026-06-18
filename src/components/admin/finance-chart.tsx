"use client";

import { formatRupiah } from "@/lib/utils";

type ChartPoint = { date: string; total: string | null; count: number };

interface Props {
  data: ChartPoint[];
}

const DAY_LABELS: Record<string, string> = {
  "0": "Min", "1": "Sen", "2": "Sel", "3": "Rab",
  "4": "Kam", "5": "Jum", "6": "Sab",
};

function fillLast7Days(data: ChartPoint[]): { label: string; total: number; date: string }[] {
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const found = data.find((p) => p.date === dateStr);
    result.push({
      date: dateStr,
      label: i === 0 ? "Hari ini" : DAY_LABELS[String(d.getDay())],
      total: Number(found?.total ?? 0),
    });
  }
  return result;
}

export function FinanceChart({ data }: Props) {
  const points = fillLast7Days(data);
  const hasData = points.some((p) => p.total > 0);
  const maxTotal = Math.max(...points.map((p) => p.total), 1);

  if (!hasData) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-100">
        <p className="text-sm text-gray-300">Belum ada revenue dalam 7 hari terakhir</p>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-1.5 h-40">
      {points.map((p) => {
        const heightPct = p.total > 0 ? Math.max((p.total / maxTotal) * 100, 8) : 0;
        return (
          <div key={p.date} className="flex flex-1 flex-col items-center gap-1 min-w-0">
            <span className="text-[9px] text-gray-400 truncate w-full text-center leading-tight h-3">
              {p.total > 0 ? formatRupiah(p.total).replace("Rp ", "").replace("Rp ", "") : ""}
            </span>
            <div className="flex w-full flex-col justify-end" style={{ height: "90px" }}>
              <div
                className="w-full rounded-t-lg bg-orange-400 transition-all duration-500"
                style={{ height: p.total > 0 ? `${heightPct}%` : "0px" }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-medium truncate w-full text-center">
              {p.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
