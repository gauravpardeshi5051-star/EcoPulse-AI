/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Leaf, 
  Flame, 
  Sparkles, 
  HelpCircle, 
  RefreshCw, 
  Car, 
  Plus, 
  Calendar, 
  Award, 
  MessageSquare,
  Compass,
  AlertTriangle,
  Github,
  Edit
} from "lucide-react";
import { CarbonLog, EcoChallenge, ChatMessage, UserStats } from "./types";
import LogsTable from "./components/LogsTable";
import AddLogModal from "./components/AddLogModal";
import ActiveChallenges from "./components/ActiveChallenges";
import CarbonInsights from "./components/CarbonInsights";
import AIPersonalCoach from "./components/AIPersonalCoach";
import AnalyticsCharts from "./components/AnalyticsCharts";
import Achievements from "./components/Achievements";
import CarbonComparison from "./components/CarbonComparison";
import ClimateLeaderboard from "./components/ClimateLeaderboard";

export default function App() {
  const [logs, setLogs] = useState<CarbonLog[]>([]);
  const [challenges, setChallenges] = useState<EcoChallenge[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Budget tracking and workspace profile settings
  const [profileArchetype, setProfileArchetype] = useState<"individual" | "digital_nomad" | "corporate" | "small_business">("individual");
  const [monthlyBudget, setMonthlyBudget] = useState<number>(160);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);
  const [budgetValueInput, setBudgetValueInput] = useState<string>("160");
  
  // Loading indicators
  const [logsLoading, setLogsLoading] = useState(true);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  
  // Modals & triggers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(true);
  
  // Simple toast Notification
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" | null }>({
    message: "",
    type: null
  });

  const triggerToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: null });
    }, 4000);
  };

  // 1. Fetch Carbon Logs
  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await fetch("/api/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  // 2. Fetch Active Challenges
  const fetchChallenges = async () => {
    try {
      setChallengesLoading(true);
      const res = await fetch("/api/challenges");
      if (res.ok) {
        const data = await res.json();
        setChallenges(data);
      }
    } catch (err) {
      console.error("Error fetching challenges:", err);
    } finally {
      setChallengesLoading(false);
    }
  };

  // Check health and server configuration
  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setGeminiConfigured(data.geminiConfigured);
      }
    } catch (err) {
      console.error("Server health check failed:", err);
    }
  };

  // 3. Trigger dynamic Gemini insights formulation
  const handleGenerateInsights = async () => {
    if (!geminiConfigured) {
      triggerToast("Missing Gemini API Key. AI analysis is bypassed.", "info");
      return;
    }
    try {
      setInsightsLoading(true);
      const res = await fetch("/api/gemini/insights", {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
        triggerToast("Daily Carbon Insights updated successfully!", "success");
      } else {
        const errData = await res.json();
        if (res.status === 412) {
          setGeminiConfigured(false);
          triggerToast("Gemini key required to calculate diagnostics.", "info");
        } else {
          triggerToast(errData.error || "Failed to formulate AI insights.", "error");
        }
      }
    } catch (err) {
      console.error("Insights API error:", err);
      triggerToast("Error contacting Gemini server insights endpoint.", "error");
    } finally {
      setInsightsLoading(false);
    }
  };

  // Fetch monthly carbon budget and profile archetype settings
  const fetchBudget = async () => {
    try {
      const res = await fetch("/api/budget");
      if (res.ok) {
        const data = await res.json();
        setMonthlyBudget(data.monthlyBudget);
        setBudgetValueInput(data.monthlyBudget.toString());
        if (data.profileArchetype) {
          setProfileArchetype(data.profileArchetype);
        }
      }
    } catch (err) {
      console.error("Error fetching budget settings:", err);
    }
  };

  const handleUpdateBudget = async (newVal: number) => {
    if (isNaN(newVal) || newVal <= 0) {
      triggerToast("Please enter a valid positive budget value.", "error");
      return;
    }
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyBudget: newVal, profileArchetype: profileArchetype })
      });
      if (res.ok) {
        const data = await res.json();
        setMonthlyBudget(data.monthlyBudget);
        setBudgetValueInput(data.monthlyBudget.toString());
        setIsEditingBudget(false);
        triggerToast(`Monthly carbon budget set to ${data.monthlyBudget} kg CO₂e!`, "success");
      } else {
        triggerToast("Failed to update carbon budget.", "error");
      }
    } catch (err) {
      console.error("Error updating budget:", err);
      triggerToast("Network error updating budget.", "error");
    }
  };

  const handleUpdateArchetypeSetting = async (archetype: "individual" | "digital_nomad" | "corporate" | "small_business") => {
    // Standard starting budget presets based on target operational parameters
    const presetBudgets = {
      individual: 160,
      digital_nomad: 195,
      corporate: 1350,
      small_business: 750
    };
    const correspondingBudget = presetBudgets[archetype];

    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          profileArchetype: archetype, 
          monthlyBudget: correspondingBudget 
        })
      });
      if (res.ok) {
        const data = await res.json();
        setProfileArchetype(data.profileArchetype);
        setMonthlyBudget(data.monthlyBudget);
        setBudgetValueInput(data.monthlyBudget.toString());
        triggerToast(`Switched profile archetype to ${archetype.replace("_", " ")}!`, "success");
        
        // Auto-recalculate active AI diagnostics
        handleGenerateInsights();
      } else {
        triggerToast("Failed to adjust workspace environment setting.", "error");
      }
    } catch (err) {
      console.error("Error adjusting setting:", err);
      triggerToast("Network error setting ecosystem workspace profile.", "error");
    }
  };

  // On mount actions
  useEffect(() => {
    checkHealth();
    fetchLogs();
    fetchChallenges();
    fetchBudget();
  }, []);

  // Soft trigger insights calculations when logs are populated initially
  useEffect(() => {
    if (logs.length > 0 && !insights && geminiConfigured) {
      // Small debounce
      const timeout = setTimeout(() => {
        handleGenerateInsights();
      }, 1200);
      return () => clearTimeout(timeout);
    }
  }, [logs]);

  // 4. Create new carbon log implementation
  const handleAddLog = async (newLogData: Omit<CarbonLog, "id" | "createdAt">) => {
    try {
      const res = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLogData)
      });
      if (res.ok) {
        const savedLog = await res.json();
        setLogs(prev => [...prev, savedLog]);
        triggerToast(`Recorded ${newLogData.subcategory} activity successfully!`, "success");
        
        // Re-generate insights in background to keep metrics clean
        if (geminiConfigured) {
          handleGenerateInsights();
        }
      } else {
        triggerToast("Failed to save carbon footprint log.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error communicating with saving API.", "error");
    }
  };

  // 5. Delete carbon log
  const handleDeleteLog = async (id: string) => {
    try {
      const res = await fetch(`/api/logs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLogs(prev => prev.filter(l => l.id !== id));
        triggerToast("Activity record deleted from journal.", "success");
        if (geminiConfigured) {
          handleGenerateInsights();
        }
      } else {
        triggerToast("Could not remove log entry.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error contacting deletion API.", "error");
    }
  };

  // 6. Toggle Eco challenges checklist
  const handleToggleChallenge = async (id: string) => {
    try {
      const res = await fetch("/api/challenges/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const updatedChallenge = await res.json();
        setChallenges(prev => prev.map(c => c.id === id ? updatedChallenge : c));
        triggerToast(
          updatedChallenge.completed 
            ? `Eco-challenge checklist item complete! Saved CO₂e` 
            : "Challenge item marked incomplete.", 
          "success"
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 7. Conversational Chat Send Message with Carbon Coach
  const handleSendChatMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: "chat_user_" + Date.now(),
      sender: "user",
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (res.ok) {
        const reply = await res.json();
        const assistantMsg: ChatMessage = {
          id: "chat_ai_" + Date.now(),
          sender: "ai",
          text: reply.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setChatMessages(prev => [...prev, assistantMsg]);
      } else {
        const assistantMsg: ChatMessage = {
          id: "chat_ai_" + Date.now(),
          sender: "ai",
          text: "I am having trouble connecting to my environmental brain. Please check your network or try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setChatMessages(prev => [...prev, assistantMsg]);
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error communicating with Carbon Coach API.", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChatHistory = () => {
    setChatMessages([]);
    triggerToast("Personal Coach dialog history cleared.", "info");
  };

  // --- STATS COMPILATION FOR TOP DASHBOARD HEADER ---
  
  // Total emissions calculation
  const totalGrossImpact = logs
    .filter(l => l.category !== "offset")
    .reduce((acc, current) => acc + current.co2e, 0);

  const totalActiveOffsets = logs
    .filter(l => l.category === "offset")
    .reduce((acc, current) => acc + Math.abs(current.co2e), 0);

  const netCarbonTotal = totalGrossImpact - totalActiveOffsets;

  // Group logs by days to calculate Daily Average
  const totalDaysObserved = Array.from(new Set(logs.map(l => l.date))).length || 1;
  const currentDailyAverage = totalGrossImpact / totalDaysObserved;

  // Streak days calculation
  const currentStreak = logs.length > 0 ? Math.min(totalDaysObserved, 5) + Math.min(challenges.filter(c => c.completed).length, 4) : 0;

  // --- MONTHLY BUDGET CALCULATION ---
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // "YYYY-MM"
  const currentMonthEmissions = logs
    .filter(l => l.date.startsWith(currentMonthPrefix) && l.category !== "offset")
    .reduce((acc, current) => acc + current.co2e, 0);

  const currentMonthOffsets = logs
    .filter(l => l.date.startsWith(currentMonthPrefix) && l.category === "offset")
    .reduce((acc, current) => acc + Math.abs(current.co2e), 0);

  const currentMonthNet = Math.max(0, currentMonthEmissions - currentMonthOffsets);
  const budgetProgressPercent = Math.min(Math.round((currentMonthNet / (monthlyBudget || 1)) * 100), 100);

  // Footprint ranking text evaluation
  let rankingText: "excellent" | "average" | "high" = "excellent";
  if (currentDailyAverage > 10) {
    rankingText = "high";
  } else if (currentDailyAverage > 5.4) {
    rankingText = "average";
  }

  return (
    <div id="carbon_app_root" className="min-h-screen bg-[#0A0F1D] text-[#E2E8F0] flex flex-col font-sans antialiased relative">
      
      {/* Toast Notification overlay with Artistic Cosmic Flair styling */}
      {toast.message && (
        <div id="toast_toast_container" className="fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 animate-fade-in bg-[#111A2E] border-[#223354] text-[#2DD4BF]">
          <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Top Header Navigation */}
      <header id="carbon_main_header" className="sticky top-0 z-40 bg-[#0A0F1D] border-b border-[#223354] px-5 md:px-8 py-5 flex items-center justify-between backdrop-blur-md bg-[#0A0F1D]/90">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#2DD4BF] text-[#0A0F1D] rounded-xl shadow-lg">
            <Leaf className="w-5 h-5 text-[#0A0F1D]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-serif italic font-bold text-white leading-tight tracking-tight text-xl">EcoPulse AI</h1>
              <span className="bg-[#2DD4BF]/10 text-[#2DD4BF] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#2DD4BF]/20 tracking-wider uppercase font-mono">Platform v2</span>
            </div>
            <p className="text-[9px] text-[#2DD4BF] uppercase tracking-[0.2em] font-semibold mt-0.5">Generative AI Environmental Impact Hub</p>
          </div>
        </div>

        {/* Global Key Warning or Quick Status indicator */}
        <div className="flex items-center gap-3">
          {!geminiConfigured && (
            <div className="hidden sm:flex items-center gap-1.5 p-1 px-2.5 bg-[#111A2E] text-[#FF6B6B] border border-[#223354] rounded-lg text-[10px] font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-[#FF6B6B]" />
              <span>Offline Coach (Self-Optimized)</span>
            </div>
          )}
          <span className="text-[10px] font-mono font-semibold bg-[#111A2E] text-[#2DD4BF] border border-[#223354] px-2.5 py-1 rounded-sm">
            UTC {new Date().toISOString().substring(11, 16)}
          </span>
        </div>
      </header>

      {/* Primary Dashboard Body space */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Ecosystem Profile Archetype Switcher Bar */}
        <section id="ecosense_profile_banner" className="bg-[#111A2E] border border-[#223354] rounded-[32px] p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2DD4BF]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <span className="bg-[#2DD4BF]/10 text-[#2DD4BF] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#2DD4BF]/20 tracking-widest uppercase font-mono">WORKSPACE SECTOR PROFILE</span>
              <h2 className="text-lg font-serif italic text-white mt-1">Ecosystem Archetype Scope</h2>
              <p className="text-xs text-[#E2E8F0]/50 mt-0.5 leading-relaxed font-sans max-w-sm">
                Define your environmental footprint boundary. Baselines and AI recommendations will customize automatically.
              </p>
            </div>
            
            {/* Quick selectors row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
              {[
                { id: "individual", label: "🏡 Individual", desc: "Citizen metrics" },
                { id: "digital_nomad", label: "💻 Tech Nomad", desc: "Remote coder style" },
                { id: "corporate", label: "🏢 Enterprise", desc: "Office utility grid" },
                { id: "small_business", label: "☕ Green Retail", desc: "Cafe & store footprint" }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleUpdateArchetypeSetting(opt.id as any)}
                  className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                    profileArchetype === opt.id
                      ? "bg-[#2DD4BF] border-[#2DD4BF] text-[#0A0F1D] shadow-[0_0_12px_rgba(45,212,191,0.25)]"
                      : "bg-[#0A0F1D] border-[#223354] text-[#E2E8F0]/70 hover:border-[#2DD4BF]/30 hover:text-white"
                  }`}
                >
                  <span className="text-[11px] font-bold block">{opt.label}</span>
                  <span className={`text-[8.5px] block font-medium mt-0.5 ${
                    profileArchetype === opt.id ? "text-[#0A0F1D]/75" : "text-slate-500"
                  }`}>
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
        
        {/* Banner Alert if Gemini API key is missing */}
        {!geminiConfigured && (
          <div className="p-4 bg-[#111A2E] border border-[#223354] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#E2E8F0]/80 animate-fade-in">
            <div className="flex items-start sm:items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#FF6B6B] shrink-0 mt-0.5 sm:mt-0" />
              <p className="font-medium">
                To unlock customizable personalized Gemini AI Footprint Coaching, dynamic challenge feedback, and structural summaries, configure your <span className="text-[#2DD4BF] font-bold">GEMINI_API_KEY</span> in the <span className="text-white underline">Settings Secrets panel</span>!
              </p>
            </div>
            <a 
              href="https://ai.studio/build" 
              onClick={(e) => e.preventDefault()}
              className="text-[#2DD4BF] hover:text-[#2DD4BF]/80 font-bold underline shrink-0 whitespace-nowrap self-end sm:self-auto"
            >
              Get free API key
            </a>
          </div>
        )}

        {/* Key KPI Stats Summary Cards Row - styled beautifully in Artistic theme */}
        <section id="carbon_kpi_row" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          
          {/* Carbon Footprint score */}
          <div className="bg-[#111A2E] p-6 rounded-[32px] border border-[#223354] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 ease-out">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF]">Net Carbon Score</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-5xl font-serif italic text-white tracking-tighter">
                  {netCarbonTotal.toFixed(1)}
                </span>
                <span className="text-xs text-[#E2E8F0]/60 font-semibold font-sans">kg CO₂e</span>
              </div>
              <p className="text-[10px] text-[#E2E8F0]/50 mt-4 leading-relaxed font-sans">Accumulated emissions minus positive offsets</p>
            </div>
          </div>

          {/* Active streak */}
          <div className="bg-[#111A2E] p-6 rounded-[32px] border border-[#223354] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 ease-out">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF]">Sustain Stature</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-5xl font-serif italic text-[#2DD4BF] tracking-tighter">{currentStreak}</span>
                <span className="text-xs text-[#E2E8F0]/60 font-semibold font-sans">Pts</span>
              </div>
              <p className="text-[10px] text-[#2DD4BF] font-bold mt-4 flex items-center gap-1.5 font-sans">
                <Flame className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
                <span>Habit multiplier active</span>
              </p>
            </div>
          </div>

          {/* Cumulative savings */}
          <div className="bg-[#111A2E] p-6 rounded-[32px] border border-[#223354] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 ease-out">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF]">Total Offsets Credit</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-5xl font-serif italic text-[#FF6B6B] tracking-tighter">-{totalActiveOffsets.toFixed(1)}</span>
                <span className="text-xs text-[#E2E8F0]/60 font-semibold font-sans">kg CO₂e</span>
              </div>
              <p className="text-[10px] text-[#E2E8F0]/50 mt-4 leading-relaxed font-sans">Compensatory reduction captured</p>
            </div>
          </div>

          {/* Global ranking assessment */}
          <div className="bg-[#111A2E] p-6 rounded-[32px] border border-[#223354] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 ease-out">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF]">Efficiency Tier</p>
              <div className="mt-2.5 flex items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0A0F1D] px-3 py-1 bg-[#2DD4BF] rounded-full whitespace-nowrap">
                  {rankingText} Tier
                </span>
              </div>
              <p className="text-[10px] text-[#E2E8F0]/50 mt-4 font-sans leading-relaxed">Daily average footprint: {currentDailyAverage.toFixed(1)} kg</p>
            </div>
          </div>

          {/* Monthly Carbon Budget Tracking Card */}
          <div className="bg-[#111A2E] p-6 rounded-[32px] border border-[#223354] flex flex-col justify-between transition-transform hover:scale-[1.02] duration-300 ease-out col-span-2 md:col-span-1">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#2DD4BF]">Monthly Budget</p>
                
                {/* Inline budget adjuster trigger */}
                <button
                  onClick={() => {
                    setIsEditingBudget(!isEditingBudget);
                    setBudgetValueInput(monthlyBudget.toString());
                  }}
                  className="p-1 text-slate-400 hover:text-[#2DD4BF] transition-colors border-0 cursor-pointer bg-transparent text-xs"
                  title="Adjust Monthly Target"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
              </div>

              {isEditingBudget ? (
                <div className="mt-2.5 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={budgetValueInput}
                      onChange={(e) => setBudgetValueInput(e.target.value)}
                      className="w-full bg-[#0A0F1D] border border-[#223354] rounded-lg text-white font-mono text-xs px-2 py-1 focus:outline-hidden focus:border-[#2DD4BF] min-w-0"
                      placeholder="kg"
                    />
                    <button
                      onClick={() => handleUpdateBudget(Number(budgetValueInput))}
                      className="bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-[#0A0F1D] text-[10px] font-bold px-2 py-1 rounded-lg border-0 cursor-pointer transition-colors shrink-0"
                    >
                      Save
                    </button>
                  </div>
                  <button
                    onClick={() => setIsEditingBudget(false)}
                    className="text-[9px] text-slate-500 hover:text-white font-semibold flex items-center bg-transparent border-0 cursor-pointer p-0"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-serif italic text-white tracking-tighter">
                      {monthlyBudget}
                    </span>
                    <span className="text-[10px] text-[#E2E8F0]/40 font-semibold font-sans">kg CO₂e</span>
                  </div>
                  
                  {/* Progress ratio stats */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider mb-1 text-[#E2E8F0]/50">
                      <span>Usage</span>
                      <span className={budgetProgressPercent >= 90 ? "text-[#FF6B6B]" : "text-[#2DD4BF]"}>
                        {currentMonthNet.toFixed(1)} / {monthlyBudget} kg ({budgetProgressPercent}%)
                      </span>
                    </div>

                    {/* Dynamic Progress indicator bar */}
                    <div className="w-full bg-[#0A0F1D] h-1.5 rounded-full overflow-hidden border border-[#223354]/40">
                      <div
                        className={`h-full transition-all duration-500 ease-out ${
                          budgetProgressPercent >= 100
                            ? "bg-red-500 shadow-[0_0_8px_#EF4444]"
                            : budgetProgressPercent >= 80
                              ? "bg-amber-400"
                              : "bg-[#2DD4BF] shadow-[0_0_8px_rgba(45,212,191,0.2)]"
                        }`}
                        style={{ width: `${budgetProgressPercent}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

              <p className="text-[10px] text-[#E2E8F0]/50 mt-4 leading-relaxed font-sans">
                {budgetProgressPercent >= 100 
                  ? "❌ Monthly limit reached!" 
                  : `${(100 - budgetProgressPercent)}% remaining budget`}
              </p>
            </div>
          </div>

        </section>

        {/* Primary Functional Grid: Bento Box structure */}
        <div id="desktop_bento_grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT CHUNK (8 COLS): Analytics, charts, and record entries journal table */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Dynamic Analytics Recharts Block */}
            <AnalyticsCharts logs={logs} />

            {/* Achievements dashboard badge tracker */}
            <Achievements logs={logs} streak={currentStreak} challenges={challenges} />

            {/* Global benchmarking and comparative statistics module */}
            <CarbonComparison userDailyAverage={currentDailyAverage} profileArchetype={profileArchetype} />

            {/* EcoPulse Leaderboard & Stature Leveling Milestone center */}
            <ClimateLeaderboard 
              logs={logs} 
              challenges={challenges} 
              currentDailyAverage={currentDailyAverage} 
              profileArchetype={profileArchetype} 
            />

            {/* 2. Logging logs journal table */}
            <LogsTable 
              logs={logs} 
              onDeleteLog={handleDeleteLog} 
              onOpenAddModal={() => setIsAddModalOpen(true)}
            />

          </div>

          {/* RIGHT CHUNK (4 COLS): Eco Coaching insights & Coach Live conversation */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 3. Eco Checklist / Active Challenges */}
            <ActiveChallenges 
              challenges={challenges}
              onToggleChallenge={handleToggleChallenge}
              loading={challengesLoading}
            />

            {/* 4. AI Insights powered by Gemini */}
            <CarbonInsights 
              insight={insights}
              loading={insightsLoading}
              onRefresh={handleGenerateInsights}
              dailyAverage={currentDailyAverage}
            />

            {/* 5. Personal Carbon Coach dialogue chat box */}
            <AIPersonalCoach 
              messages={chatMessages}
              onSendMessage={handleSendChatMessage}
              loading={chatLoading}
              onClearHistory={handleClearChatHistory}
            />

          </div>

        </div>

      </main>

      {/* Daily Input Modal drawer */}
      <AddLogModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddLog={handleAddLog}
      />

      {/* Footer credits line */}
      <footer id="workspace_footer" className="bg-[#0D1527] border-t border-[#223354] py-8 px-5 mt-12 text-center text-[10px] text-[#E2E8F0]/40 uppercase tracking-widest font-mono">
        <p>CO₂.TRACE APPLET • Powered by Google Gemini & Express Fullstack</p>
      </footer>

    </div>
  );
}
