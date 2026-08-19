"use client";

import { useEffect } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DistrictMarketData } from "@/lib/types";

interface TrendModalProps {
  districtName: string;
  provinceName: string;
  data: DistrictMarketData;
  onClose: () => void;
}

export default function TrendModal({ districtName, provinceName, data, onClose }: TrendModalProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const brands = [...data.brands].sort((a, b) => b.marketSharePct - a.marketSharePct);
  const monthCount = brands[0]?.history.length ?? 0;
  const chartData = Array.from({ length: monthCount }, (_, i) => {
    const row: Record<string, string | number> = { month: brands[0].history[i].month };
    for (const b of brands) {
      row[b.brandName] = b.history[i]?.sharePct ?? 0;
    }
    return row;
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111820] shadow-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/10 px-5 py-3.5">
          <div>
            <div className="text-sm font-semibold text-slate-100">
              12-month market share trend — {districtName}
            </div>
            <div className="text-[11px] text-slate-500">{provinceName} · all active brands</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close trend chart"
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-white/5 hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="px-3 py-4">
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
                <CartesianGrid stroke="#2c2c2a" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#898781"
                  tick={{ fill: "#898781", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#383835" }}
                />
                <YAxis
                  stroke="#898781"
                  tick={{ fill: "#898781", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "#383835" }}
                  unit="%"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0d1319",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#e6edf3" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#c3c2b7" }} />
                {brands.map((b) => (
                  <Line
                    key={b.brandId}
                    type="monotone"
                    dataKey={b.brandName}
                    stroke={b.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
