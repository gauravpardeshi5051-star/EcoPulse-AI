import React from "react";
import { 
  Award, 
  Flame, 
  Sparkles, 
  Leaf, 
  Zap, 
  CheckCircle, 
  Lock, 
  Gift, 
  HelpCircle 
} from "lucide-react";
import { CarbonLog, EcoChallenge } from "../types";

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "streak" | "challenges" | "offsets";
  requirementText: string;
  checkUnlocked: (logs: CarbonLog[], streak: number, completedChallenges: number) => boolean;
  getProgress: (logs: CarbonLog[], streak: number, completedChallenges: number) => { current: number; target: number };
}

const BADGES: BadgeDefinition[] = [
  {
    id: "eco_initiate",
    title: "Eco Initiate",
    description: "Successfully commenced your climate journal footprint tracking journey.",
    icon: <Leaf className="w-5 h-5" />,
    category: "streak",
    requirementText: "Log at least 1 carbon activity",
    checkUnlocked: (logs) => logs.length >= 1,
    getProgress: (logs) => ({ current: Math.min(logs.length, 1), target: 1 })
  },
  {
    id: "consistent_crusher",
    title: "Consistent Crusher",
    description: "Maintained structural habit consistency by registering high engagement scores.",
    icon: <Flame className="w-5 h-5 animate-pulse" />,
    category: "streak",
    requirementText: "Maintain a streak of 3+",
    checkUnlocked: (_logs, streak) => streak >= 3,
    getProgress: (_logs, streak) => ({ current: Math.min(streak, 3), target: 3 })
  },
  {
    id: "carbon_crusher",
    title: "Carbon Crusher",
    description: "Earned supreme diagnostic status by reaching a peak carbon mitigation multiplier momentum.",
    icon: <Zap className="w-5 h-5" />,
    category: "streak",
    requirementText: "Maintain an active streak of 6+",
    checkUnlocked: (_logs, streak) => streak >= 6,
    getProgress: (_logs, streak) => ({ current: Math.min(streak, 6), target: 6 })
  },
  {
    id: "first_triumph",
    title: "First Triumph",
    description: "Took proactive control of carbon emissions by conquering one active weekly task.",
    icon: <CheckCircle className="w-5 h-5" />,
    category: "challenges",
    requirementText: "Complete 1 weekly challenge",
    checkUnlocked: (_logs, _streak, completedChallenges) => completedChallenges >= 1,
    getProgress: (_logs, _streak, completedChallenges) => ({ current: Math.min(completedChallenges, 1), target: 1 })
  },
  {
    id: "eco_warrior",
    title: "Eco Warrior",
    description: "Achieved planetary stewardship benchmark by fulfilling multiple elite weekly tasks.",
    icon: <Award className="w-5 h-5" />,
    category: "challenges",
    requirementText: "Complete 3+ weekly challenges",
    checkUnlocked: (_logs, _streak, completedChallenges) => completedChallenges >= 3,
    getProgress: (_logs, _streak, completedChallenges) => ({ current: Math.min(completedChallenges, 3), target: 3 })
  },
  {
    id: "climate_compensator",
    title: "Climate Compensator",
    description: "Actively offset ecological footprints by financing or executing positive sinks.",
    icon: <Sparkles className="w-5 h-5" />,
    category: "offsets",
    requirementText: "Log 1 environmental offset log",
    checkUnlocked: (logs) => logs.some(l => l.category === "offset"),
    getProgress: (logs) => {
      const offsetCount = logs.filter(l => l.category === "offset").length;
      return { current: Math.min(offsetCount, 1), target: 1 };
    }
  }
];

interface AchievementsProps {
  logs: CarbonLog[];
  streak: number;
  challenges: EcoChallenge[];
}

export default function Achievements({ logs, streak, challenges }: AchievementsProps) {
  const completedChallenges = challenges.filter(c => c.completed).length;

  // Track state of clicked badge for celebratory micro-details modal
  const [selectedBadge, setSelectedBadge] = React.useState<BadgeDefinition | null>(null);

  // Calculate unlocked stats
  const statusList = BADGES.map(badge => ({
    badge,
    unlocked: badge.checkUnlocked(logs, streak, completedChallenges),
    progress: badge.getProgress(logs, streak, completedChallenges)
  }));

  const unlockedCount = statusList.filter(s => s.unlocked).length;
  const totalBadges = BADGES.length;
  const completionPercentage = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0;

  return (
    <div id="achievements_journal_section" className="bg-[#111A2E] rounded-[32px] border border-[#223354] overflow-hidden">
      
      {/* Header block */}
      <div className="p-6 border-b border-[#223354] bg-gradient-to-r from-[#223354]/30 to-[#111A2E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#2DD4BF]" />
            <h3 className="font-serif italic text-white text-lg">Ecological Badges</h3>
          </div>
          <span className="text-[10px] font-bold text-[#2DD4BF] bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 px-2.5 py-0.5 rounded-full font-mono uppercase shrink-0">
            {unlockedCount} / {totalBadges} Unlocked
          </span>
        </div>
        <p className="text-xs text-[#E2E8F0]/60 mt-1 leading-relaxed font-sans">
          Unlock credentials by registering daily actions, maintaining streaks, and conquering challenges
        </p>

        {/* Global Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#E2E8F0]/70 mb-1.5">
            <span>Overall Badge Completion</span>
            <span className="font-mono text-[11px] font-bold text-white">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-[#0A0F1D] h-1.5 rounded-full overflow-hidden border border-[#223354]/35">
            <div 
              className="bg-[#2DD4BF] h-full transition-all duration-500 ease-out shadow-[0_0_12px_#2DD4BF/40]"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid listing */}
      <div className="p-6 grid grid-cols-2 gap-3.5">
        {statusList.map(({ badge, unlocked, progress }) => {
          const percent = Math.round((progress.current / progress.target) * 100);

          return (
            <button
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              aria-label={`View details for badge ${badge.title}. Progress is ${progress.current} out of ${progress.target}.`}
              className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                unlocked
                  ? "bg-[#0D1527] border-[#2dd4bf]/30 hover:border-[#2dd4bf]/70 hover:shadow-[0_0_15px_-3px_rgba(45,212,191,0.2)]"
                  : "bg-[#0A0F1D]/60 border-[#223354] opacity-75 hover:opacity-100 hover:border-[#223354]/80"
              }`}
            >
              <div>
                {/* Icon Circle */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-105 ${
                    unlocked
                      ? "bg-[#2dd4bf] text-[#0A0F1D] shadow-[0_0_10px_rgba(45,212,191,0.3)]"
                      : "bg-[#1E293B] text-[#E2E8F0]/30"
                  }`}>
                    {badge.icon}
                  </div>
                  {unlocked ? (
                    <span className="text-[9px] font-bold text-[#2dd4bf] bg-[#2dd4bf]/10 px-2 py-0.5 rounded-md font-mono flex items-center gap-1 uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-ping" /> Active
                    </span>
                  ) : (
                    <div className="p-1 px-1.5 bg-[#1E293B] rounded-lg text-slate-500 flex items-center justify-center">
                      <Lock className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                </div>

                <h4 className={`text-xs font-bold leading-snug ${unlocked ? "text-white" : "text-white/60"}`}>
                  {badge.title}
                </h4>
                <p className="text-[10px] text-[#E2E8F0]/40 mt-1 lines-clamp-2 md:line-clamp-2 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Requirement or checklist stat */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[8.5px] font-mono tracking-wider font-bold mb-1 uppercase">
                  <span className={unlocked ? "text-[#2dd4bf]" : "text-[#E2E8F0]/40"}>
                    {badge.requirementText}
                  </span>
                  <span className={unlocked ? "text-white" : "text-[#E2E8F0]/30"}>
                    {progress.current}/{progress.target}
                  </span>
                </div>
                {/* Progress bar inside single badge block */}
                <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${unlocked ? "bg-[#2dd4bf]" : "bg-[#223354]"}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Celebratory details dialog/modal */}
      {selectedBadge && (() => {
        const isUnlocked = selectedBadge.checkUnlocked(logs, streak, completedChallenges);
        const { current, target } = selectedBadge.getProgress(logs, streak, completedChallenges);
        
        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/90 backdrop-blur-md animate-fade-in"
            onClick={() => setSelectedBadge(null)}
          >
            <div 
              className="w-full max-w-sm bg-[#111A2E] rounded-[31px] shadow-2xl border border-[#223354] overflow-hidden p-6 text-center focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Badge Visual Circle */}
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center mb-5">
                <div className={`absolute inset-0 rounded-full blur-xl scale-75 opacity-40 ${
                  isUnlocked ? "bg-[#2dd4bf]" : "bg-slate-700"
                }`} />
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-xl ${
                  isUnlocked 
                    ? "bg-[#2dd4bf]/10 border-[#2dd4bf] text-[#2dd4bf]" 
                    : "bg-[#0A0F1D] border-[#223354] text-[#E2E8F0]/30"
                }`}>
                  <div className="scale-[1.6]">
                    {selectedBadge.icon}
                  </div>
                </div>
              </div>

              {/* Badges copy details */}
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] font-mono ${
                isUnlocked ? "text-[#2dd4bf]" : "text-slate-500"
              }`}>
                {isUnlocked ? "UNLOCKED STAGED" : "LOCKED STATUS"}
              </span>
              <h3 className="font-serif italic text-2xl text-white mt-1.5">{selectedBadge.title}</h3>
              <p className="text-xs text-[#E2E8F0]/70 mt-3.5 leading-relaxed font-sans max-w-xs mx-auto">
                {selectedBadge.description}
              </p>

              {/* Locked/Unlocked diagnostics bar in modal */}
              <div className="mt-6 p-4 bg-[#0A0F1D] rounded-2xl border border-[#223354] text-xs font-sans text-left">
                <div className="flex justify-between items-center mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#E2E8F0]/50">
                  <span>Requirement:</span>
                  <span className={isUnlocked ? "text-[#2dd4bf]" : "text-slate-400"}>
                    {isUnlocked ? "Fulfilled" : "In Progress"}
                  </span>
                </div>
                <p className="text-white font-medium mb-3">{selectedBadge.requirementText}</p>
                
                <div className="flex justify-between items-center font-mono text-[10px] text-slate-400 mb-1">
                  <span>Progress Ratio</span>
                  <span className="text-white font-semibold">{current} / {target}</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 ${isUnlocked ? "bg-[#2dd4bf]" : "bg-[#223354]"}`}
                    style={{ width: `${Math.round((current / target) * 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => setSelectedBadge(null)}
                className="mt-6 w-full py-2.5 bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-[#0A0F1D] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm uppercase tracking-wider"
              >
                Close Details
              </button>
            </div>
          </div>
        );
      })()}
      
    </div>
  );
}
