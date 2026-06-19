/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  PieChart,
  Pie
} from "recharts";
import { CarbonLog, CARBON_CONFIG, CarbonCategory } from "../types";
import { Activity, Flame, ShieldAlert, Sparkles } from "lucide-react";

interface AnalyticsChartsProps {
  logs: CarbonLog[];
}

export default function AnalyticsCharts({ logs }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState<"category" | "trend" | "offset">("category");

  // If no logs, return clean empty display
  const hasData = logs.length > 0;

  // 1. Data Prep: Category Breakdown
  const categorySummary = logs.reduce((acc, log) => {
    if (log.category !== "offset") {
      acc[log.category] = (acc[log.category] || 0) + log.co2e;
    }
    return acc;
  }, {} as Record<string, number>);

  const barChartData = [
    { name: "Transit", value: Number((categorySummary.transport || 0).toFixed(1)), color: "#2DD4BF" },
    { name: "Energy", value: Number((categorySummary.energy || 0).toFixed(1)), color: "#3B82F6" },
    { name: "Diet", value: Number((categorySummary.diet || 0).toFixed(1)), color: "#10B981" },
    { name: "Shopping", value: Number((categorySummary.consumption || 0).toFixed(1)), color: "#EC4899" }
  ];

  // 2. Data Prep: Daily Trend over the last 10 recordable days
  const logsByDate = logs.reduce((acc, log) => {
    const d = log.date;
    if (!acc[d]) {
      acc[d] = { date: d, netEmissions: 0, footprint: 0, offsets: 0 };
    }
    const val = Number(log.co2e);
    if (log.category === "offset") {
      acc[d].offsets += Math.abs(val);
      acc[d].netEmissions -= Math.abs(val);
    } else {
      acc[d].footprint += val;
      acc[d].netEmissions += val;
    }
    return acc;
  }, {} as Record<string, { date: string; netEmissions: number; footprint: number; offsets: number }>);

  // Convert to sorted array and take last 10 unique days
  const trendData = Object.values(logsByDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map(t => ({
      ...t,
      netEmissions: Number(t.netEmissions.toFixed(1)),
      footprint: Number(t.footprint.toFixed(1)),
      offsets: Number(t.offsets.toFixed(1)),
      label: t.date.substring(5)
    }));

  // 3. Data Prep: Offset vs Emissions Ratio
  const totalEmissions = logs
    .filter(l => l.category !== "offset")
    .reduce((sum, current) => sum + current.co2e, 0);

  const totalOffsets = Math.abs(
    logs
      .filter(l => l.category === "offset")
      .reduce((sum, current) => sum + current.co2e, 0)
  );

  const pieData = [
    { name: "Emissions Footprint", value: Number(totalEmissions.toFixed(1)), color: "#FF6B6B" },
    { name: "Active Offsets", value: Number(totalOffsets.toFixed(1)), color: "#2DD4BF" }
  ];

  const totalCarbonNetValue = Number((totalEmissions - totalOffsets).toFixed(1));

  return (
    <div id="analytics_charts_card" className="bg-[#111A2E] rounded-[32px] border border-[#223354] overflow-hidden">
      
      {/* Top selection navbar */}
      <div className="p-6 border-b border-[#223354] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0A0F1D]/30 mr-0">
        <div>
          <h3 className="font-serif italic text-white text-lg">Emissions Analytics</h3>
          <p className="text-xs text-[#E2E8F0]/50 mt-1 leading-normal">Measure, visualize, and compare your carbon footprint indices</p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-[#0A0F1D] border border-[#223354] rounded-xl self-start sm:self-auto shrink-0 select-none">
          <button
            onClick={() => setActiveTab("category")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all ${
              activeTab === "category" ? "bg-[#2DD4BF] text-[#0A0F1D] shadow-xs" : "text-[#E2E8F0]/50 hover:text-white"
            }`}
          >
            Sector Impact
          </button>
          <button
            onClick={() => setActiveTab("trend")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all ${
              activeTab === "trend" ? "bg-[#2DD4BF] text-[#0A0F1D] shadow-xs" : "text-[#E2E8F0]/50 hover:text-white"
            }`}
          >
            Daily Progress
          </button>
          <button
            onClick={() => setActiveTab("offset")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border-0 cursor-pointer transition-all ${
              activeTab === "offset" ? "bg-[#2DD4BF] text-[#0A0F1D] shadow-xs" : "text-[#E2E8F0]/50 hover:text-white"
            }`}
          >
            Balance Ratio
          </button>
        </div>
      </div>

      {/* Main chart panels */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        {!hasData ? (
          <div className="text-center py-16 max-w-sm text-[#E2E8F0]/60">
            <Activity className="w-10 h-10 text-[#2DD4BF] mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-bold text-white">Analytics charts are currently empty</p>
            <p className="text-xs mt-2 leading-relaxed">
              Once you start logging activities across transportation, household energy, meals, and offsets, beautiful analytics graphs will render here.
            </p>
          </div>
        ) : (
          <div className="w-full">
            {activeTab === "category" && (
              <div>
                <p className="text-xs font-bold text-[#E2E8F0]/60 mb-5 font-sans text-center">
                  Total CO₂e Emissions breakdown by Category (expressed in kg)
                </p>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#223354" strokeOpacity={0.6} />
                      <XAxis dataKey="name" stroke="#E2E8F0" strokeOpacity={0.4} fontSize={10} tickLine={false} />
                      <YAxis stroke="#E2E8F0" strokeOpacity={0.4} fontSize={10} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#0A0F1D", borderRadius: "16px", border: "1px solid #223354", color: "#E2E8F0" }}
                        labelStyle={{ fontWeight: "bold", fontSize: "11px", color: "#2DD4BF" }}
                        itemStyle={{ fontSize: "12px", color: "#E2E8F0" }}
                        formatter={(value) => [`${value} kg CO₂e`, "Emissions"]}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={45}>
                        {barChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "trend" && (
              <div>
                <p className="text-xs font-bold text-[#E2E8F0]/60 mb-5 font-sans text-center flex items-center justify-center gap-1">
                  Net Daily CO₂e emissions vs Daily Budget limit (5.4 kg CO₂e/day)
                </p>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 15, right: 15, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#223354" strokeOpacity={0.6} />
                      <XAxis dataKey="label" stroke="#E2E8F0" strokeOpacity={0.4} fontSize={10} tickLine={false} />
                      <YAxis stroke="#E2E8F0" strokeOpacity={0.4} fontSize={10} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0A0F1D", borderRadius: "16px", border: "1px solid #223354", color: "#E2E8F0" }}
                        labelStyle={{ fontWeight: "bold", fontSize: "11px", color: "#2DD4BF" }}
                        itemStyle={{ fontSize: "12px", color: "#E2E8F0" }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold", color: "#E2E8F0" }} />
                      
                      {/* Budget reference threshold line */}
                      <ReferenceLine y={5.4} stroke="#FF6B6B" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Budget ceiling (5.4 kg)", fill: "#FF6B6B", fontSize: 9, position: "top" }} />
                      
                      <Line type="monotone" name="Net Emissions" dataKey="netEmissions" stroke="#2DD4BF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" name="Gross Footprint" dataKey="footprint" stroke="#FF6B6B" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {activeTab === "offset" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Custom Donut shape chart */}
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} kg`, "Amount"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* KPI Metrics block */}
                <div className="space-y-4 px-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#E2E8F0]/70">Gross Climate Impact</span>
                    <span className="font-bold text-white font-mono">{totalEmissions.toFixed(1)} kg CO₂e</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#2DD4BF]">Active Compensatory Offsets</span>
                    <span className="font-bold text-[#2DD4BF] font-mono">-{totalOffsets.toFixed(1)} kg CO₂e</span>
                  </div>
                  
                  <hr className="border-[#223354]/40" />

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">Net Ecological Balance</span>
                    <div className="text-right">
                      <span className={`text-xl font-serif italic ${totalCarbonNetValue <= 0 ? "text-[#2DD4BF]" : "text-white"}`}>
                        {totalCarbonNetValue <= 0 ? "" : "+"}{totalCarbonNetValue}
                      </span>
                      <span className="text-[10px] font-bold text-[#E2E8F0]/50 ml-1">kg CO₂e</span>
                    </div>
                  </div>

                  {totalCarbonNetValue <= 0 ? (
                    <div className="p-3 bg-[#2DD4BF]/10 text-[#2DD4BF] text-[11px] font-bold rounded-2xl border border-[#2DD4BF]/25 text-center flex items-center gap-1.5 justify-center">
                      <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
                      <span>Ecological Balance Achieved! Net-Neutral state</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-[#FF6B6B]/10 text-white/95 text-[11px] font-medium leading-relaxed rounded-2xl border border-[#FF6B6B]/20 text-left">
                      Tip: Increase positive offsets (composting, tree plantings, buying community carbon certificates) to balance out score.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
