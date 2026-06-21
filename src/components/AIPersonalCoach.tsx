/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, RefreshCw, Compass } from "lucide-react";
import { ChatMessage } from "../types";

interface AIPersonalCoachProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  loading: boolean;
  onClearHistory: () => void;
}

export default function AIPersonalCoach({ messages, onSendMessage, loading, onClearHistory }: AIPersonalCoachProps) {
  const [inputText, setInputText] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestionPills = [
    "What diets save the most CO₂?",
    "Explain gas boilers vs heat pumps",
    "Estimate flight carbon offset rates",
    "How can I cut energy index in winter?"
  ];

  // Auto-scroll chat window when new elements arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const textToSend = inputText;
    setInputText("");
    await onSendMessage(textToSend);
  };

  const handleSuggestionClick = async (pillText: string) => {
    if (loading) return;
    await onSendMessage(pillText);
  };  return (
    <div id="ai_coach_card" className="bg-[#111A2E] rounded-[32px] border border-[#223354] overflow-hidden flex flex-col h-[540px]">
      
      {/* Header section */}
      <div className="p-6 border-b border-[#223354] flex items-center justify-between shrink-0 bg-[#0A0F1D]/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#2DD4BF] flex items-center justify-center text-[#0A0F1D] text-xs font-bold font-serif shadow-xs">
            CC
          </div>
          <div>
            <h3 className="font-serif italic text-white text-sm">Carbon Coaching Companion</h3>
            <span className="text-[9px] text-[#2DD4BF] font-bold uppercase tracking-widest block">Online • Climate Intelligence</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          className="px-3 py-1.5 bg-[#0A0F1D] border border-[#223354] text-[10px] font-bold text-[#E2E8F0]/60 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          Clear Logs
        </button>
      </div>

      {/* Message space */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0D1527]/25">
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <MessageSquare className="w-10 h-10 text-[#2DD4BF] mb-2.5" />
            <p className="text-xs font-bold text-white">Chat with your Carbon Coach</p>
            <p className="text-[10px] text-[#E2E8F0]/50 max-w-sm mt-2 leading-relaxed">
              Ask questions about carbon offset protocols, energy-saving configurations, meat alternatives, transit options, and personalized lifestyle strategies.
            </p>
            
            {/* Quick Suggestions box */}
            <div className="mt-5 w-full max-w-xs space-y-1.5 text-left">
              <span className="text-[9px] font-bold text-[#2DD4BF] uppercase tracking-widest block mb-1">Quick Prompts</span>
              {suggestionPills.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(p)}
                  className="w-full text-[11px] font-semibold text-left p-2.5 bg-[#0A0F1D] border border-[#223354] text-[#E2E8F0]/80 hover:text-[#2DD4BF] hover:border-[#2DD4BF]/30 transition-all font-sans cursor-pointer block truncate rounded-xl"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => {
              const isAI = m.sender === "ai";
              return (
                <div key={m.id} className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                  
                  {/* Persona icon badge */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isAI ? "bg-[#2DD4BF] text-[#0A0F1D] font-bold text-[10px]" : "bg-[#223354] text-[#E2E8F0]"
                  }`}>
                    {isAI ? "AI" : <User className="w-3.5 h-3.5" />}
                  </div>

                  {/* Bubble content */}
                  <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs font-sans leading-relaxed ${
                    isAI 
                      ? "bg-[#0A0F1D] text-[#E2E8F0] rounded-tl-none border border-[#223354]" 
                      : "bg-[#2DD4BF] text-[#0A0F1D] rounded-tr-none font-bold shadow-xs"
                  }`}>
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span className={`text-[8px] font-semibold mt-1 block text-right ${isAI ? "text-[#E2E8F0]/40" : "text-[#0A0F1D]/60"}`}>
                      {m.timestamp}
                    </span>
                  </div>

                </div>
              );
            })}

            {/* AI thinking bubble active */}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#2DD4BF] text-[#0A0F1D] font-bold text-[10px] flex items-center justify-center shrink-0 animate-pulse">
                  AI
                </div>
                <div className="bg-[#0A0F1D] text-[#E2E8F0]/60 rounded-2xl rounded-tl-none border border-[#223354] p-3.5 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2DD4BF]" />
                  <span>Coach resides formulating response...</span>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </>
        )}

      </div>

      {/* Context pill templates during ongoing chats */}
      {messages.length > 0 && (
        <div className="p-3 bg-[#0A0F1D]/80 border-t border-[#223354] flex gap-1.5 overflow-x-auto shrink-0 select-none no-scrollbar">
          {suggestionPills.slice(0, 3).map((p, idx) => (
            <button
               key={idx}
               type="button"
               disabled={loading}
               onClick={() => handleSuggestionClick(p)}
               className="text-[10px] font-bold px-3 py-1.5 bg-[#0D1527] border border-[#223354] text-[#E2E8F0]/70 hover:text-white hover:border-[#2DD4BF]/40 rounded-full shrink-0 transition-colors cursor-pointer"
            >
               {p}
            </button>
          ))}
        </div>
      )}

      {/* Control Input drawer */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-[#223354] bg-[#111A2E] flex gap-2.5 items-center shrink-0">
        <label htmlFor="id_chat_input" className="sr-only">Ask Carbon Coach sustainability question</label>
        <input
          id="id_chat_input"
          type="text"
          placeholder="Ask Carbon Coach sustainability queries..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading}
          className="flex-1 bg-[#0A0F1D] border border-[#223354] text-[#E2E8F0] text-xs rounded-xl px-4 py-2.5 focus:outline-hidden focus:ring-1 focus:ring-[#2DD4BF] transition-colors disabled:opacity-75 placeholder-[#E2E8F0]/30"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-3 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-[#0A0F1D] rounded-xl flex items-center justify-center transition-all disabled:opacity-30 border-0 cursor-pointer text-xs"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
