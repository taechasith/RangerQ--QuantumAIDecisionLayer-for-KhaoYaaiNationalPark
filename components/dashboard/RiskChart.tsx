"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  ComposedChart
} from "recharts";

type ChartDataPoint = {
  name: string;
  "Fire Risk": number;
  "Wildlife Risk": number;
  "Combined Priority": number;
};

export function RiskChart({
  zones,
  riskScores
}: {
  zones: any[];
  riskScores: any[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-80 w-full animate-pulse bg-zinc-900/20 rounded-xl border border-zinc-900 flex items-center justify-center text-xs text-zinc-500">
        Loading analytics engine...
      </div>
    );
  }

  // Build chart dataset
  const hasRiskScores = riskScores.length > 0;
  const chartData: ChartDataPoint[] = (hasRiskScores ? riskScores : zones)
    .slice(0, 10) // Display top 10 highest risk zones for legibility
    .map((item) => {
      const code = "zoneCode" in item ? item.zoneCode : item.code;
      const fireRisk = "fireRisk" in item ? item.fireRisk : item.baseFireRisk;
      const wildlifeRisk = "wildlifeRisk" in item ? item.wildlifeRisk : item.baseWildlifeRisk;
      const combinedPriority = "combinedPriority" in item 
        ? item.combinedPriority 
        : Math.round((item.baseFireRisk + item.baseWildlifeRisk) / 2);

      return {
        name: code,
        "Fire Risk": fireRisk,
        "Wildlife Risk": wildlifeRisk,
        "Combined Priority": combinedPriority
      };
    });

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#09090b",
              borderColor: "#18181b",
              borderRadius: "12px",
              color: "#f4f4f5",
              fontSize: "11px",
            }}
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
          />
          <Legend 
            verticalAlign="top" 
            height={36} 
            iconType="circle" 
            iconSize={8}
            wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }}
          />
          <Bar 
            dataKey="Fire Risk" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={20}
            opacity={0.85}
          />
          <Bar 
            dataKey="Wildlife Risk" 
            fill="#06b6d4" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={20}
            opacity={0.85}
          />
          <Line 
            type="monotone" 
            dataKey="Combined Priority" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={{ r: 3, stroke: "#10b981", strokeWidth: 1, fill: "#09090b" }} 
            activeDot={{ r: 5 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
