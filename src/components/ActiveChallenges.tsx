/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Award, CheckCircle, Circle, Flame, Sparkles, HelpCircle } from "lucide-react";
import { EcoChallenge, CARBON_CONFIG } from "../types";

interface ActiveChallengesProps {
  challenges: EcoChallenge[];
  onToggleChallenge: (id: string) => Promise<void>;
  loading: boolean;
}

export default function ActiveChallenges({ challenges, onToggleChallenge, loading }: ActiveChallengesProps) {
  const completedCount = challenges.filter(c => c.completed).length;
  const totalCount = challenges.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const totalCO2PotentialSaved = challenges
    .filter(c => c.completed)
    .reduce((acc, current) => acc + current.potentialReduction, 0);

  const getDifficultyBadge = (difficulty: EcoChallenge["difficulty"]) => {
    switch (difficulty) {
      case "easy":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2DD4BF]/10 text-[#2DD4BF] border border-[#2DD4BF]/20 uppercase">Easy</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/25 uppercase">Medium</span>;
      case "hard":
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/25 uppercase">Hard</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#223354] text-[#E2E8F0]/70 uppercase">General</span>;
    }
  };

  const getCategoryColorBorder = (cat: string) => {
    const matched = CARBON_CONFIG[cat as any];
    return matched ? matched.color : "#223354";
  };

  return (
    <div id="eco_challenges_card" className="bg-[#111A2E] rounded-[32px] border border-[#223354] overflow-hidden">
      
      {/* Top Header Card */}
      <div className="p-6 border-b border-[#223354] bg-gradient-to-r from-[#223354]/30 to-[#111A2E]">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#2DD4BF]" />
          <h3 className="font-serif italic text-white text-lg">Weekly Eco-Challenges</h3>
        </div>
        <p className="text-xs text-[#E2E8F0]/60 mt-1 leading-relaxed">Adopt carbon-conscious habits with high-impact weekly tasks</p>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs font-semibold text-[#E2E8F0]/70 mb-1.5">
            <span>Challenges Logged</span>
            <span className="font-mono text-[11px] font-bold">{completedCount} of {totalCount} Completed</span>
          </div>
          <div className="w-full bg-[#0A0F1D] h-1.5 rounded-full overflow-hidden border border-[#223354]/35">
            <div 
              className="bg-[#2DD4BF] h-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {totalCO2PotentialSaved > 0 && (
          <div className="mt-4 flex items-center gap-1.5 p-2.5 bg-[#0A0F1D] rounded-xl text-xs font-medium text-[#2DD4BF] border border-[#223354]">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>Reduced <strong className="text-white">{totalCO2PotentialSaved.toFixed(1)} kg CO₂e</strong> this week!</span>
          </div>
        )}
      </div>

      {/* Challenges Checklist List */}
      <div className="p-6 space-y-3.5">
        {challenges.length === 0 ? (
          <p className="text-xs text-[#E2E8F0]/40 italic text-center py-6">No loaded challenges. Check server connectivity.</p>
        ) : (
          challenges.map((c) => {
            const isCompleted = c.completed;
            const categoryLabel = CARBON_CONFIG[c.category]?.label || c.category;
            
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => !loading && onToggleChallenge(c.id)}
                disabled={loading}
                aria-label={`Toggle challenge: ${c.title}. Potential reduction is ${c.potentialReduction} kilograms of carbon dioxide equivalent per week.`}
                className={`w-full flex items-start gap-3.5 p-3.5 rounded-2xl text-left border cursor-pointer transition-all ${
                  isCompleted 
                    ? "bg-[#0A0F1D]/50 border-[#223354]/30 opacity-60" 
                    : "bg-[#0A0F1D] border-[#223354] hover:border-[#2DD4BF]/45 hover:shadow-xs"
                }`}
                style={{ borderLeftWidth: "4px", borderLeftColor: getCategoryColorBorder(c.category) }}
              >
                
                {/* Complete Status Checkbox */}
                <div className="mt-0.5 shrink-0 transition-transform hover:scale-110">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-[#2DD4BF] fill-[#111A2E]" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#223354]" />
                  )}
                </div>

                {/* Challenge description content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <span className={`text-xs font-bold ${isCompleted ? "line-through text-[#E2E8F0]/50" : "text-white"}`}>
                      {c.title}
                    </span>
                    <div className="flex items-center gap-1">
                      {getDifficultyBadge(c.difficulty)}
                    </div>
                  </div>
                  <p className={`text-xs mt-1 leading-relaxed ${isCompleted ? "text-[#E2E8F0]/40" : "text-[#E2E8F0]/70"}`}>
                    {c.description}
                  </p>
                  
                  {/* Category and savings tracker row */}
                  <div className="flex items-center justify-between mt-3 text-[10px] font-bold text-[#E2E8F0]/50 uppercase tracking-widest">
                    <span className="capitalize">{categoryLabel}</span>
                    <span className="text-[#2DD4BF] bg-[#223354]/65 border border-[#223354] px-2 py-0.5 rounded-md font-mono shrink-0">
                      -{c.potentialReduction} kg / wk
                    </span>
                  </div>
                </div>

              </button>
            );
          })
        )}

        {/* Dynamic completed celebration card */}
        {progressPercent === 100 && totalCount > 0 && (
          <div className="p-4 bg-[#0D1527] border border-[#223354] rounded-2xl flex items-center gap-3 animate-pulse">
            <Sparkles className="w-5 h-5 text-[#2DD4BF] shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Carbon Champion!</p>
              <p className="text-[11px] text-[#E2E8F0]/70">All weekly eco-challenges complete. Your planet appreciates your commitment!</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
