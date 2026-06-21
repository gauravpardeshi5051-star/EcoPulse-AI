/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Trash2, Search, Filter, Car, Zap, Leaf, ShoppingBag, PlusCircle, HelpCircle } from "lucide-react";
import { CarbonLog, CARBON_CONFIG, CarbonCategory } from "../types";

interface LogsTableProps {
  logs: CarbonLog[];
  onDeleteLog: (id: string) => Promise<void>;
  onOpenAddModal: () => void;
}

export default function LogsTable({ logs, onDeleteLog, onOpenAddModal }: LogsTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<CarbonCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategoryFilter = (cat: CarbonCategory | "all") => {
    setSelectedCategory(cat);
  };

  const getSubcategoryName = (cat: CarbonCategory, subId: string): string => {
    const matched = CARBON_CONFIG[cat]?.subcategories.find((s) => s.id === subId);
    return matched?.label || subId;
  };

  const getCategoryIcon = (cat: CarbonCategory) => {
    switch (cat) {
      case "transport": return <Car className="w-4 h-4 text-blue-600" />;
      case "energy": return <Zap className="w-4 h-4 text-amber-600" />;
      case "diet": return <PlusCircle className="w-4 h-4 text-emerald-600" />;
      case "consumption": return <ShoppingBag className="w-4 h-4 text-purple-600" />;
      case "offset": return <Leaf className="w-4 h-4 text-pink-600" />;
      default: return <HelpCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  // Filter logs logic
  const filteredLogs = logs.filter((log) => {
    const matchesCategory = selectedCategory === "all" || log.category === selectedCategory;
    const notesText = log.notes?.toLowerCase() || "";
    const subcatText = getSubcategoryName(log.category, log.subcategory).toLowerCase();
    const matchesSearch = notesText.includes(searchQuery.toLowerCase()) || subcatText.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort logs by date descending
  const sortedLogs = [...filteredLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div id="logs_table_section" className="bg-[#111A2E] rounded-[32px] border border-[#223354] overflow-hidden">
      
      {/* Table Header Filter controls */}
      <div className="p-6 border-b border-[#223354]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif italic text-white text-xl">Activity Journal</h3>
            <p className="text-xs text-[#E2E8F0]/60 mt-0.5">View and manage logged carbon impact records</p>
          </div>
          
          {/* Action button in header styled with custom sage outline/accent */}
          <button 
            type="button"
            onClick={onOpenAddModal} 
            className="self-start md:self-auto px-5 py-2.5 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-[#0A0F1D] font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors shadow-xs"
          >
            Log New Activity
          </button>
        </div>

        {/* Search & Filter row */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <label htmlFor="id_search_input" className="sr-only">Search logs by note or subcategory</label>
            <Search className="w-4 h-4 text-[#2DD4BF] absolute left-3 top-3.5" />
            <input
              id="id_search_input"
              type="text"
              placeholder="Search by note/subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#0A0F1D] border border-[#223354] text-[#E2E8F0] text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#2DD4BF] placeholder-[#E2E8F0]/40"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-1.5 overflow-x-auto pb-1">
            <Filter className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
            <button
              onClick={() => handleCategoryFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all cursor-pointer ${
                selectedCategory === "all" 
                  ? "bg-[#2DD4BF] text-[#0A0F1D]" 
                  : "bg-[#0A0F1D] border border-[#223354] text-[#E2E8F0]/70 hover:bg-[#223354]/40 hover:text-white"
              }`}
            >
              All
            </button>
            {(Object.keys(CARBON_CONFIG) as CarbonCategory[]).map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg shrink-0 transition-all capitalize cursor-pointer ${
                    isActive 
                      ? "bg-[#2DD4BF] text-[#0A0F1D]" 
                      : "bg-[#0A0F1D] border border-[#223354] text-[#E2E8F0]/70 hover:bg-[#223354]/40 hover:text-white"
                  }`}
                >
                  {cat === "offset" ? "Offsets" : cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table content block */}
      <div className="overflow-x-auto">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-[#E2E8F0]/60 bg-[#0D1527]/30">
            <div className="w-12 h-12 bg-[#0A0F1D] border border-[#223354] text-[#2DD4BF] rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-white">No logs found</p>
            <p className="text-xs text-[#E2E8F0]/50 max-w-sm mx-auto mt-2 leading-relaxed">
              There are no logging events matching the current filter. try adding a new carbon log activity!
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0D1527] text-[10px] uppercase tracking-widest text-[#2DD4BF] font-bold border-b border-[#223354]">
                <th className="py-3 px-6">Source / Activity</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Logged Amount</th>
                <th className="py-3 px-4 text-right">CO₂ Equivalent</th>
                <th className="py-3 px-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#223354]/40 text-xs text-[#E2E8F0]">
              {sortedLogs.map((log) => {
                const isOffSet = log.category === "offset";
                return (
                  <tr key={log.id} className="hover:bg-[#0D1527]/40 transition-colors">
                    
                    {/* Activity name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg shrink-0" style={{ backgroundColor: `${CARBON_CONFIG[log.category]?.color}25` }}>
                          {getCategoryIcon(log.category)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">
                            {getSubcategoryName(log.category, log.subcategory)}
                          </div>
                          {log.notes && (
                            <span className="text-[10px] text-[#E2E8F0]/50 block truncate max-w-[180px] md:max-w-xs">{log.notes}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs font-semibold text-[#E2E8F0]/60 whitespace-nowrap">
                      {log.date}
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-right font-mono text-xs text-[#E2E8F0]/80 whitespace-nowrap">
                      <span className="font-bold text-white">{log.amount}</span> {log.unit}
                    </td>

                    {/* Calculated CO2 */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 font-serif">
                        <span className={`font-bold ${isOffSet ? "text-[#FF6B6B]" : "text-[#2DD4BF]"} text-sm italic`}>
                          {isOffSet ? "" : "+"}{log.co2e}
                        </span>
                        <span className="text-[9px] font-bold text-[#E2E8F0]/40 uppercase tracking-wider">kg CO₂e</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteLog(log.id)}
                        className="p-2 text-[#E2E8F0]/40 hover:text-[#FF6B6B] rounded-lg hover:bg-[#FF6B6B]/15 border-0 cursor-pointer transition-all"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
