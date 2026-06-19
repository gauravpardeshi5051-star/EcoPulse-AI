/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Trophy, 
  Sparkles, 
  Medal, 
  ArrowUp, 
  ArrowDown, 
  Target, 
  Flame, 
  Crown,
  ChevronRight,
  TrendingDown,
  Building,
  Coffee,
  Globe,
  User
} from "lucide-react";
import { CarbonLog, EcoChallenge } from "../types";

interface ClimateLeaderboardProps {
  logs: CarbonLog[];
  challenges: EcoChallenge[];
  currentDailyAverage: number;
  profileArchetype: string;
}

export default function ClimateLeaderboard({ 
  logs, 
  challenges, 
  currentDailyAverage, 
  profileArchetype 
}: ClimateLeaderboardProps) {

  // --- PROGRESSION XP SYSTEM ---
  const completedChallengesCount = challenges.filter(c => c.completed).length;
  const logCount = logs.length;
  
  // Calculate XP: 10XP per log, 25XP per completed challenge, 50XP per active badge/milestone
  const xpFromLogs = logCount * 12;
  const xpFromChallenges = completedChallengesCount * 30;
  const totalXP = xpFromLogs + xpFromChallenges;
  
  // XP Level calculation: level up every 100 XP
  const currentLevel = 1 + Math.floor(totalXP / 100);
  const xpInCurrentLevel = totalXP % 100;
  const nextLevelThreshold = 100;
  const levelProgressPercent = Math.min((xpInCurrentLevel / nextLevelThreshold) * 100, 100);

  // Friendly title based on level
  const getLevelTitle = (lvl: number) => {
    if (lvl >= 10) return "Planetary Guardian 🌟";
    if (lvl >= 6) return "Climate Strategist 🍃";
    if (lvl >= 4) return "Carbon Alchemist ✨";
    if (lvl >= 2) return "Green Explorer 🌱";
    return "Eco Initiate 🐣";
  };

  // --- LEADERBOARD LOGIC ---
  // Weekly footprint: daily average * 7
  const userWeeklyFootprint = currentDailyAverage * 7;
  
  // Simulated competitor profiles (re-ranked dynamically against the user's weekly average)
  const defaultCompetitors = [
    {
      id: "comp_1",
      name: "Apex Enterprise HQ",
      archetype: "corporate",
      weeklyFootprint: 260.0,
      avatar: <Building className="w-3.5 h-3.5" />,
      subText: "Standard tech company baseline"
    },
    {
      id: "comp_2",
      name: "Green Grind Coffee Co.",
      archetype: "small_business",
      weeklyFootprint: 110.0,
      avatar: <Coffee className="w-3.5 h-3.5" />,
      subText: "Local organic retail workspace"
    },
    {
      id: "comp_3",
      name: "Sophia K. (Tech Nomad)",
      archetype: "digital_nomad",
      weeklyFootprint: 48.0,
      avatar: <Globe className="w-3.5 h-3.5" />,
      subText: "High airline & server footprint"
    },
    {
      id: "comp_4",
      name: "The Marcus Household",
      archetype: "individual",
      weeklyFootprint: 36.5,
      avatar: <User className="w-3.5 h-3.5" />,
      subText: "Suburban active energy saver"
    }
  ];

  // Map the current selected profile type icon
  const getProfileIcon = (type: string) => {
    switch(type) {
      case "corporate": return <Building className="w-3.5 h-3.5" />;
      case "small_business": return <Coffee className="w-3.5 h-3.5" />;
      case "digital_nomad": return <Globe className="w-3.5 h-3.5" />;
      default: return <User className="w-3.5 h-3.5" />;
    }
  };

  const getProfileLabel = (type: string) => {
    switch(type) {
      case "corporate": return "Corporate HQ";
      case "small_business": return "Green Cafe";
      case "digital_nomad": return "Digital Nomad";
      default: return "Individual";
    }
  };

  // Build the live leaderboard including "YOU"
  const leaderboardList = [
    ...defaultCompetitors,
    {
      id: "YOU",
      name: `YOU (${getProfileLabel(profileArchetype)})`,
      archetype: profileArchetype,
      weeklyFootprint: userWeeklyFootprint || 0,
      avatar: getProfileIcon(profileArchetype),
      subText: "Your carbon output (Live)"
    }
  ];

  // Sort leaderboard: lower weekly footprint ranks higher!
  leaderboardList.sort((a, b) => a.weeklyFootprint - b.weeklyFootprint);

  // Find user's position (1-indexed)
  const userRank = leaderboardList.findIndex(item => item.id === "YOU") + 1;

  // Render Medal Icons for ranks 1-3
  const renderRankBadge = (rank: number) => {
    switch(rank) {
      case 1:
        return <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />;
      case 2:
        return <Medal className="w-4 h-4 text-slate-300 fill-slate-300" />;
      case 3:
        return <Medal className="w-4 h-4 text-amber-600 fill-amber-600" />;
      default:
        return <span className="font-mono text-[10px] text-slate-400 font-bold">{rank}</span>;
    }
  };

  return (
    <div id="climate_leaderboard_section" className="bg-[#111A2E] rounded-[32px] border border-[#223354] overflow-hidden">
      
      {/* Visual background gradient banner */}
      <div className="p-6 border-b border-[#223354] bg-gradient-to-r from-[#172545]/40 to-[#111A2E] relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DD4BF]/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#2DD4BF]" />
            <h3 className="font-serif italic text-white text-lg">EcoPulse Gamification</h3>
          </div>
          <span className="bg-[#2DD4BF]/10 text-[#2DD4BF] text-[9px] font-bold px-2.5 py-0.5 rounded-full border border-[#2DD4BF]/20 uppercase tracking-widest font-mono">
            Rep Level {currentLevel}
          </span>
        </div>
        <p className="text-xs text-[#E2E8F0]/60 mt-1 leading-relaxed">
          Unlock levels, log consistent offset actions, and outperform other archetypes on the leaderboard.
        </p>
      </div>

      <div className="p-6 space-y-6">

        {/* 1. LEVEL & EXPERIENCE CARD */}
        <div className="p-4 bg-[#0A0F1D] rounded-2xl border border-[#223354] relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[9px] text-[#2DD4BF] tracking-wider uppercase font-bold block mb-0.5">Stature Progression</span>
              <h4 className="text-sm font-bold text-white leading-tight">
                {getLevelTitle(currentLevel)}
              </h4>
            </div>
            <div className="text-right">
              <span className="font-mono text-xs text-white font-bold">{totalXP}</span>
              <span className="text-[10px] text-slate-500 font-semibold font-sans"> Total XP</span>
            </div>
          </div>

          {/* XP Progress Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-medium text-slate-400">
              <span>XP to Level {currentLevel + 1}</span>
              <span className="font-mono">{xpInCurrentLevel}/100 XP</span>
            </div>
            <div className="w-full bg-[#111A2E] h-2 rounded-full overflow-hidden border border-[#223354]/40">
              <div 
                className="bg-[#2DD4BF] h-full transition-all duration-500 ease-out shadow-[0_0_8px_#2dd4bf/20]"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick task suggestions list for level advancement */}
          <div className="mt-4 pt-3.5 border-t border-[#223354]/40 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Log entries(+12 XP) • Complete tasks(+30 XP)</span>
            </span>
            <span className="font-bold text-[#2DD4BF] flex items-center cursor-pointer hover:underline">
              Task Checklist <ChevronRight className="w-3 h-3 ml-0.5" />
            </span>
          </div>
        </div>

        {/* 2. LIVE LEADERBOARD GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-[#2DD4BF] tracking-wider uppercase font-bold">Climate Leaderboard (Weekly Net Footprint)</span>
            <span className="text-[9px] text-slate-500 font-semibold italic">Lower Footprint is better!</span>
          </div>

          <div className="bg-[#0A0F1D] rounded-2xl border border-[#223354] overflow-hidden divide-y divide-[#223354]/40">
            {leaderboardList.map((item, idx) => {
              const rank = idx + 1;
              const isUser = item.id === "YOU";
              
              return (
                <div 
                  key={item.id} 
                  className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    isUser 
                      ? "bg-[#2DD4BF]/5 border-l-2 border-[#2dd4bf]" 
                      : "hover:bg-[#111A2E]/20"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-6 flex items-center justify-center">
                      {renderRankBadge(rank)}
                    </div>
                    
                    {/* User Profile Avatar Icon Wrapper */}
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isUser
                        ? "bg-[#2DD4BF] text-[#0A0F1D] shadow-[0_0_10px_rgba(45,212,191,0.25)]"
                        : "bg-[#111A2E] text-slate-400"
                    }`}>
                      {item.avatar}
                    </div>

                    <div className="min-w-0">
                      <span className={`text-xs font-bold block truncate ${isUser ? "text-[#2DD4BF]" : "text-white"}`}>
                        {item.name}
                      </span>
                      <span className="text-[9px] text-slate-500 block truncate">{item.subText}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono text-xs font-bold block ${isUser ? "text-[#2DD4BF]" : "text-white"}`}>
                      {item.weeklyFootprint.toFixed(1)}
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider block">kg CO₂e/wk</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary status text depending on score ranking placement */}
          <div className="p-3 bg-[#0A0F1D]/40 border border-[#223354] rounded-2xl text-[10.5px] leading-relaxed text-[#E2E8F0]/70 flex items-start gap-2 italic">
            <TrendingDown className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
            <span>
              {userRank === 1 ? (
                "Flawless performance! You sit crowned at the peak spot of the leaderboard. Continue logging offsets to solidify your planetary lead."
              ) : userRank <= 3 ? (
                `Magnificent job! You are ranked #${userRank} out of 5. Commit to standard green transport, eco heating levels, and minor offset adjustments next week to win absolute first!`
              ) : (
                `Currently placed at rank #${userRank} on the leaderboard. Complete additional Active Tasks to descend your weekly output and bypass corporate profiles!`
              )}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
