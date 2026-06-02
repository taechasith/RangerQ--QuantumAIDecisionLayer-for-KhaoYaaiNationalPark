"use client";

import {
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

type ZoneLike = {
  code: string;
  baseFireRisk: number;
  baseWildlifeRisk: number;
};

type RiskScoreLike = {
  zoneCode: string;
  fireRisk: number;
  wildlifeRisk: number;
  combinedPriority: number;
};

export function RiskChart({
  zones,
  riskScores
}: {
  zones: ZoneLike[];
  riskScores: RiskScoreLike[];
}) {
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
    <div className="relative h-[22rem] w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#94a3b8"
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            domain={[0, 100]}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#091014",
              borderColor: "rgba(255,255,255,0.12)",
              borderRadius: "12px",
              color: "#f4f4f5",
              fontSize: "11px",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
            labelStyle={{ color: "#5eead4", fontWeight: 800 }}
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
            fill="#f59e0b" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={14}
            opacity={0.85}
          />
          <Bar 
            dataKey="Wildlife Risk" 
            fill="#fb7185" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={14}
            opacity={0.85}
          />
          <Line 
            type="monotone" 
            dataKey="Combined Priority" 
            stroke="#14b8a6" 
            strokeWidth={2.5} 
            dot={{ r: 3, stroke: "#14b8a6", strokeWidth: 1.5, fill: "#081014" }} 
            activeDot={{ r: 5 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
