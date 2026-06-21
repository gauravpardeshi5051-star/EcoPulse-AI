/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { X, Car, Zap, Leaf, ShoppingBag, Sparkles, PlusCircle } from "lucide-react";
import { CARBON_CONFIG, CarbonCategory, CarbonLog } from "../types";

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLog: (newLog: Omit<CarbonLog, "id" | "createdAt">) => Promise<void>;
}

export default function AddLogModal({ isOpen, onClose, onAddLog }: AddLogModalProps) {
  const [category, setCategory] = useState<CarbonCategory>("transport");
  const [subcategory, setSubcategory] = useState("");
  const [amount, setAmount] = useState<number>(10);
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize category change to set the first subcategory as default
  useEffect(() => {
    const subcats = CARBON_CONFIG[category].subcategories;
    if (subcats.length > 0) {
      setSubcategory(subcats[0].id);
    }
  }, [category]);

  // Adjust defaults per subcategory
  useEffect(() => {
    if (subcategory) {
      const config = CARBON_CONFIG[category].subcategories.find((s) => s.id === subcategory);
      if (config) {
        if (config.unit === "km") {
          if (config.id === "flight_long") setAmount(1200);
          else if (config.id === "flight_short") setAmount(350);
          else if (config.id === "escooter" || config.id === "bicycle") setAmount(5);
          else setAmount(25);
        } else if (config.unit === "kWh") {
          setAmount(45);
        } else if (config.unit === "meals") {
          setAmount(1);
        } else if (config.unit === "items") {
          setAmount(1);
        } else {
          setAmount(1);
        }
      }
    }
  }, [subcategory, category]);

  if (!isOpen) return null;

  const currentCategoryConfig = CARBON_CONFIG[category];
  const currentSubcatMeta = currentCategoryConfig.subcategories.find((s) => s.id === subcategory);
  const factor = currentSubcatMeta?.factor || 0;
  const calculatedCO2e = Number((amount * factor).toFixed(2));

  // Determine dynamic ranges based on specific options
  const getSliderMeta = () => {
    if (!currentSubcatMeta) return { min: 1, max: 100, step: 1 };
    const id = currentSubcatMeta.id;
    const unit = currentSubcatMeta.unit;
    
    if (id === "flight_long") return { min: 100, max: 8000, step: 100 };
    if (id === "flight_short") return { min: 20, max: 1500, step: 20 };
    if (unit === "km") {
      if (id === "escooter" || id === "bicycle") return { min: 1, max: 40, step: 1 };
      return { min: 1, max: 400, step: 5 };
    }
    if (unit === "kWh") {
      return { min: 1, max: 400, step: 2 };
    }
    if (unit === "meals") {
      return { min: 1, max: 21, step: 1 }; // log up to 3 meals a day for a full week
    }
    if (unit === "items") {
      if (id === "item_appliance_large") return { min: 1, max: 5, step: 1 };
      return { min: 1, max: 15, step: 1 };
    }
    if (unit === "trees") {
      return { min: 1, max: 50, step: 1 };
    }
    if (unit === "credits") {
      return { min: 1, max: 100, step: 1 };
    }
    if (unit === "bins") {
      return { min: 1, max: 15, step: 1 };
    }
    if (unit === "days") {
      return { min: 1, max: 31, step: 1 };
    }
    if (unit === "showers") {
      return { min: 1, max: 30, step: 1 };
    }
    return { min: 1, max: 100, step: 1 };
  };

  const sliderConfig = getSliderMeta();

  const categoryIcons: Record<CarbonCategory, React.ReactNode> = {
    transport: <Car className="w-5 h-5" />,
    energy: <Zap className="w-5 h-5" />,
    diet: <PlusCircle className="w-5 h-5 text-emerald-500" />, // Use standard lucide icon
    consumption: <ShoppingBag className="w-5 h-5" />,
    offset: <Leaf className="w-5 h-5" />
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    
    setIsSubmitting(true);
    try {
      await onAddLog({
        category,
        subcategory,
        amount,
        unit: currentSubcatMeta?.unit || "",
        co2e: calculatedCO2e,
        notes,
        date
      });
      // Reset defaults
      setNotes("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="add_log_modal_backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/90 backdrop-blur-md animate-fade-in">
      <div id="add_log_modal_card" className="w-full max-w-lg bg-[#111A2E] rounded-[31px] shadow-2xl border border-[#223354] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#223354] bg-[#0A0F1D]/40">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-[#2DD4BF] text-[#0A0F1D] rounded-xl">
              <Leaf className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-serif italic text-white text-lg">Log Daily Activity</h3>
              <p className="text-xs text-[#E2E8F0]/60">Record habit detail to compute CO₂ impact</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 px-2.5 hover:bg-[#0A0F1D] text-[#E2E8F0]/50 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Category Tabs */}
          <div>
            <label className="block text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest mb-2">Category</label>
            <div id="category_selector_row" className="grid grid-cols-5 gap-1.5 p-1 bg-[#0A0F1D] border border-[#223354] rounded-2xl">
              {(Object.keys(CARBON_CONFIG) as CarbonCategory[]).map((cat) => {
                const isActive = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-col items-center justify-center py-2.5 rounded-xl border-0 transition-all cursor-pointer ${
                      isActive 
                        ? "bg-[#2DD4BF] text-[#0A0F1D] shadow-xs font-bold" 
                        : "text-[#E2E8F0]/50 hover:text-white hover:bg-[#111A2E]"
                    }`}
                  >
                    {categoryIcons[cat]}
                    <span className="text-[9px] mt-1 font-bold capitalize truncate max-w-full px-0.5">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory dropdown */}
          <div>
            <label htmlFor="id_subcategory_select" className="block text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest mb-2">Subcategory Spec</label>
            <div className="relative">
              <select
                id="id_subcategory_select"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A0F1D] border border-[#223354] text-[#E2E8F0] text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#2DD4BF] focus:border-[#2DD4BF]"
              >
                {currentCategoryConfig.subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id} className="bg-[#0A0F1D] text-[#E2E8F0]">{sub.label}</option>
                ))}
              </select>
            </div>
            {currentSubcatMeta && (
              <p className="text-xs text-[#E2E8F0]/60 mt-2 italic font-serif leading-relaxed">{currentSubcatMeta.description}</p>
            )}
          </div>

          {/* Amount input & slider */}
          <div className="bg-[#0A0F1D] p-4.5 rounded-2xl border border-[#223354]">
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="id_amount_input" className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest">
                Amount ({currentSubcatMeta?.unit || ""})
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="id_amount_input"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                  className="w-20 px-2 py-1 text-right bg-[#111A2E] border border-[#223354] rounded-md text-xs font-bold text-white focus:outline-hidden focus:ring-1 focus:ring-[#2DD4BF]"
                />
                <span className="text-[11px] font-bold text-[#E2E8F0]/50">{currentSubcatMeta?.unit || ""}</span>
              </div>
            </div>

            {/* Slider */}
            <input
              id="id_amount_slider"
              type="range"
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={sliderConfig.step}
              value={amount}
              onChange={handleSliderChange}
              aria-label="Emission amount range slider"
              className="w-full h-1.5 bg-[#223354] rounded-lg appearance-none cursor-pointer accent-[#2DD4BF] mt-2.5 focus:outline-hidden focus:ring-1 focus:ring-[#2DD4BF]"
            />
          </div>

          {/* Optional notes & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="id_date_input" className="block text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest mb-2">Date</label>
              <input
                id="id_date_input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A0F1D] border border-[#223354] text-white text-xs rounded-xl focus:outline-hidden"
              />
            </div>
            <div>
              <label htmlFor="id_notes_input" className="block text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest mb-2">Notes</label>
              <input
                id="id_notes_input"
                type="text"
                placeholder="e.g. Commute to city"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0A0F1D] border border-[#223354] text-white text-xs rounded-xl focus:outline-hidden placeholder-[#E2E8F0]/30"
              />
            </div>
          </div>

          {/* Action Impact Preview Widget */}
          <div className="flex items-center justify-between p-4.5 bg-[#0D1527] rounded-2xl border border-[#223354]">
            <div className="flex items-center gap-1.5 text-[#2DD4BF] font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#2DD4BF] animate-pulse shrink-0" />
              <span>Diagnostic CO₂ Impact:</span>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-serif italic ${category === "offset" ? "text-[#2DD4BF]" : "text-white"}`}>
                {category === "offset" ? "-" : "+"}{calculatedCO2e}
              </span>
              <span className="text-[10px] font-bold text-[#E2E8F0]/50 ml-1">kg CO₂e</span>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold text-[#E2E8F0]/60 hover:text-white hover:bg-[#0A0F1D] rounded-xl border-0 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="px-6 py-2.5 bg-[#2DD4BF] hover:bg-[#2DD4BF]/90 text-[#0A0F1D] font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm"
            >
              {isSubmitting ? "Saving..." : "Add to Log"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
