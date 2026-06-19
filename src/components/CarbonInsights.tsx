/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, RefreshCw, HelpCircle, Flame, CheckCircle, TrendingDown, ArrowRight, Brain } from "lucide-react";
import { CarbonCategory, CARBON_CONFIG } from "../types";

// Types matching server response
interface AIRecommendation {
  title: string;
  category: string;
  impactKg: number;
  details: string;
}

interface AIInsightData {
  overallEvaluation: string;
  percentageDifferenceFromGoal: number; // Comparative positive or negative gap
  highestSector: string;
  recommendations: AIRecommendation[];
}

interface CarbonInsightsProps {
  insight: AIInsightData | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
  dailyAverage: number;
}

export default function CarbonInsights({ insight, loading, onRefresh, dailyAverage }: CarbonInsightsProps) {
  
  const getCategoryColor = (cat: string) => {
    const matched = CARBON_CONFIG[cat.toLowerCase() as CarbonCategory];
    return matched ? matched.color : "#64748b"; // fallback slate
  };

  return (
    <div id="ai_insights_card" className="bg-[#111A2E] rounded-[32px] border border-[#223354] overflow-hidden relative">
      
      {/* Decorative colored glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#2DD4BF]/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      {/* Tab Header block */}
      <div className="p-6 border-b border-[#223354] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-[#2DD4BF] animate-pulse" />
          <div>
            <h3 className="font-serif italic text-white text-lg flex items-center gap-2 flex-wrap">
              Carbon Coach Analytics
              <span className="bg-[#2DD4BF] text-[#0A0F1D] text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase shrink-0">AI Diagnostics</span>
            </h3>
            <p className="text-xs text-[#E2E8F0]/60 mt-0.5">Personalized climate diagnostics computed on your logs</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="px-3 py-1.5 bg-[#0A0F1D] border border-[#223354] hover:border-[#2DD4BF]/40 text-[#2DD4BF] hover:text-white rounded-lg flex items-center gap-1.5 text-xs font-bold shrink-0 transition-colors cursor-pointer"
          title="Recalculate with Gemini"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#2DD4BF]" : ""}`} />
          {loading ? "Analyzing..." : "Refresh"}
        </button>
      </div>

      {/* Main body */}
      <div className="p-6 space-y-5">
        
        {loading ? (
          <div className="py-16 flex flex-col items-center text-center">
            <RefreshCw className="w-8 h-8 text-[#2DD4BF] animate-spin mb-4" />
            <p className="text-sm font-bold text-white">Analyzing Carbon Habits...</p>
            <p className="text-xs text-[#E2E8F0]/50 max-w-xs mt-2 leading-relaxed">
              Gemini is compiling your daily transportation, diet, and consumption metrics to formulate custom-styled efficiency recommendations.
            </p>
          </div>
        ) : insight ? (
          <>
            {/* Status overview cards */}
            <div className="grid grid-cols-1 gap-3.5">
              
              {/* Daily Average compared to goal */}
              <div className="p-4.5 bg-[#0A0F1D] rounded-2xl border border-[#223354]">
                <p className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest">Daily Average</p>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-serif italic text-white">{dailyAverage.toFixed(1)}</span>
                  <span className="text-xs text-[#E2E8F0]/60 font-semibold">kg CO₂e</span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] font-bold font-sans">
                  {insight.percentageDifferenceFromGoal > 0 ? (
                    <>
                      <span className="text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 px-1.5 py-0.5 rounded">+{insight.percentageDifferenceFromGoal}%</span>
                      <span className="text-[#E2E8F0]/60 font-semibold">above target budget</span>
                    </>
                  ) : insight.percentageDifferenceFromGoal < 0 ? (
                    <>
                      <span className="text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 px-1.5 py-0.5 rounded">{insight.percentageDifferenceFromGoal}%</span>
                      <span className="text-[#2DD4BF] font-semibold">under target budget (Ideal)</span>
                    </>
                  ) : (
                    <span className="text-[#E2E8F0]/60 font-semibold">Matching goal budget exactly</span>
                  )}
                </div>
              </div>

              {/* Target budget indicator */}
              <div className="p-4.5 bg-[#0A0F1D] rounded-2xl border border-[#223354]">
                <p className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest">Sustainable Budget</p>
                <div className="flex items-baseline gap-1 mt-1.5">
                  <span className="text-2xl font-serif italic text-[#2DD4BF]">5.4</span>
                  <span className="text-xs text-[#E2E8F0]/60 font-semibold">kg CO₂e / day</span>
                </div>
                <p className="text-[10px] text-[#E2E8F0]/50 mt-3 font-medium leading-relaxed">
                  Required metric threshold per person to comply with historic carbon neutralization targets.
                </p>
              </div>

              {/* Highest emission sector */}
              <div className="p-4.5 bg-[#0A0F1D] rounded-2xl border border-[#223354]">
                <p className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest">Critical Impact Sector</p>
                <div className="mt-1.5">
                  <span className="text-sm font-bold text-white block truncate">{insight.highestSector}</span>
                  {insight.highestSector !== "None" ? (
                    <span className="text-[10px] text-[#FF6B6B] bg-[#FF6B6B]/15 border border-[#FF6B6B]/25 px-2 py-0.5 rounded-md inline-block font-bold mt-2">Needs attention</span>
                  ) : (
                    <span className="text-[10px] text-[#2DD4BF] bg-[#2DD4BF]/15 border border-[#2DD4BF]/25 px-2 py-0.5 rounded-md inline-block font-bold mt-2 font-mono">Ideal balance!</span>
                  )}
                </div>
              </div>

            </div>

            {/* AI conversational feedback area */}
            <div className="p-4.5 bg-[#0D1527] border border-[#223354] rounded-2xl relative overflow-hidden">
              <div className="flex items-center gap-1.5 text-[#2DD4BF] font-bold text-xs mb-2">
                <Sparkles className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                <span className="uppercase tracking-widest text-[10.5px]">AI Carbon Insights</span>
              </div>
              <p className="text-xs text-[#E2E8F0]/90 leading-relaxed font-sans">
                {insight.overallEvaluation}
              </p>
            </div>

            {/* Generated specific actions list */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest mb-1.5">Proposed Action Pathways</h4>
              <div className="space-y-3">
                {insight.recommendations && insight.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 bg-[#0A0F1D] border border-[#223354] rounded-2xl hover:border-[#2DD4BF]/30 transition-all flex items-start gap-3">
                    <div className="p-2 bg-[#111A2E] border border-[#223354] rounded-lg mt-0.5 shrink-0" style={{ borderLeft: `3px solid ${getCategoryColor(rec.category)}` }}>
                      <TrendingDown className="w-4 h-4 text-[#2DD4BF]" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-bold text-white">{rec.title}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 rounded-md font-mono shrink-0">
                          -{rec.impactKg} kg / wk
                        </span>
                      </div>
                      <p className="text-xs text-[#E2E8F0]/70 mt-1.5 leading-relaxed font-sans">{rec.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center bg-[#0A0F1D] border border-[#223354] rounded-2xl">
            <Sparkles className="w-8 h-8 text-[#2DD4BF] mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Unlock AI Insights</p>
            <p className="text-xs text-[#E2E8F0]/50 max-w-sm mx-auto mt-2 leading-relaxed">
              Log at least 1 activity to let Gemini AI compute customized trend forecasts, percentage performance outputs, and targeted reduction pathways.
            </p>
            <button
              type="button"
              onClick={onRefresh}
              className="mt-5 px-6 py-2.5 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-[#0A0F1D] font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm"
            >
              Generate AI Assessment
            </button>
          </div>
        )}

      </div>

    </div>
  );
}
