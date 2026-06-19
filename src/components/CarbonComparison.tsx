import React, { useState } from "react";
import { 
  Globe, 
  MapPin, 
  TrendingDown, 
  TrendingUp, 
  Leaf, 
  Car, 
  Smartphone, 
  TreePine, 
  Info,
  Sparkles
} from "lucide-react";

interface RegionalBenchmark {
  id: string;
  name: string;
  dailyAverage: number;
  info: string;
  flag: string;
}

const REGIONAL_BENCHMARKS: RegionalBenchmark[] = [
  {
    id: "paris_target",
    name: "Paris Accord Target (Sustainable Limit)",
    dailyAverage: 5.4,
    info: "The maximum individual daily limit to contain climate global warming under 1.5°C globally.",
    flag: "🇺🇳"
  },
  {
    id: "global",
    name: "Global Individual Average",
    dailyAverage: 13.7,
    info: "The worldwide current estimated daily carbon footprint rate per average citizen.",
    flag: "🌐"
  },
  {
    id: "usa",
    name: "United States Average",
    dailyAverage: 42.5,
    info: "Due to vehicle-reliance, high electricity needs, and food supply chains, the US maintains premium emissions.",
    flag: "🇺🇸"
  },
  {
    id: "eu",
    name: "European Union Average",
    dailyAverage: 18.2,
    info: "A dynamic balance of advanced public transport networks, green initiatives, and lower residential averages.",
    flag: "🇪🇺"
  },
  {
    id: "china",
    name: "China Average",
    dailyAverage: 21.1,
    info: "Rapid industrial transformation has propelled high national power grid emission coefficients per capita.",
    flag: "🇨🇳"
  },
  {
    id: "india",
    name: "India Average",
    dailyAverage: 6.2,
    info: "A lower individual carbon coefficient, close to the ideal global sustainable target standard.",
    flag: "🇮🇳"
  }
];

interface CarbonComparisonProps {
  userDailyAverage: number;
  profileArchetype?: string;
}

export default function CarbonComparison({ userDailyAverage, profileArchetype = "individual" }: CarbonComparisonProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string>("global");
  
  const getArchetypeLimit = (type: string) => {
    switch(type) {
      case "corporate": return 45.0;
      case "small_business": return 25.0;
      case "digital_nomad": return 6.5;
      default: return 5.4;
    }
  };

  const dynamicArchetypeLimit = getArchetypeLimit(profileArchetype);
  const selectedRegion = REGIONAL_BENCHMARKS.find(r => r.id === selectedRegionId) || REGIONAL_BENCHMARKS[1];
  
  // Guard for zero data / no logs recorded
  const normalizedUserAverage = userDailyAverage || 0;
  
  // Calculate relative differences
  const percentDifference = selectedRegion.dailyAverage > 0 
    ? ((normalizedUserAverage - selectedRegion.dailyAverage) / selectedRegion.dailyAverage) * 100
    : 0;

  const isBelowAverage = normalizedUserAverage < selectedRegion.dailyAverage;
  const absPercent = Math.abs(Math.round(percentDifference));

  // Ecological equivalents based on EPA greenhouse formulas:
  // 1 kg CO2e is approximately:
  // - 2.5 miles driven in an average gasoline passenger car
  // - 121 smartphone charges
  // - 0.016 tree seedlings grown for 10 years (or 1 tree seedling can offset ~60kg in its first 10 years)
  const yearlyFootprintKg = normalizedUserAverage * 365;
  const carMilesEquivalent = yearlyFootprintKg * 2.5;
  const phoneChargesEquivalent = yearlyFootprintKg * 121.6;
  const treeSaplingsEquivalent = yearlyFootprintKg * 0.0165;

  return (
    <div id="carbon_comparison_section" className="bg-[#111A2E] rounded-[32px] border border-[#223354] overflow-hidden">
      
      {/* Top Banner Header */}
      <div className="p-6 border-b border-[#223354] bg-gradient-to-r from-[#223354]/30 to-[#111A2E]">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#2DD4BF]" />
          <h3 className="font-serif italic text-white text-lg">Global Footprint Benchmarks</h3>
        </div>
        <p className="text-xs text-[#E2E8F0]/60 mt-1 leading-relaxed">
          Benchmark your personal footprint against global sectors and national averages to find context
        </p>
      </div>

      {/* Selector and Main Comparative stats */}
      <div className="p-6 space-y-6">
        
        {/* Comparison Dropdown Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="w-full md:w-3/5">
            <label htmlFor="benchmark_selector_select" className="block text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest mb-2">
              Select Comparison Target
            </label>
            <div className="relative">
              <select
                id="benchmark_selector_select"
                value={selectedRegionId}
                onChange={(e) => setSelectedRegionId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0A0F1D] border border-[#223354] text-[#E2E8F0] text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#2DD4BF] focus:border-[#2DD4BF]"
              >
                {REGIONAL_BENCHMARKS.map((benchmark) => (
                  <option key={benchmark.id} value={benchmark.id} className="bg-[#0A0F1D] text-[#E2E8F0]">
                    {benchmark.flag} {benchmark.name} ({benchmark.dailyAverage} kg/day)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-[#0A0F1D]/40 p-4 rounded-xl border border-[#223354] text-xs flex items-start gap-2 h-full md:w-2/5">
            <Info className="w-4 h-4 text-[#2DD4BF] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#E2E8F0]/60 leading-relaxed font-sans italic">
              {selectedRegion.info}
            </p>
          </div>
        </div>

        {/* Diagnostic Assessment Banner */}
        <div className={`p-4.5 rounded-2x border flex items-start gap-3.5 transition-all ${
          normalizedUserAverage === 0 
            ? "bg-[#0D1527] border-[#223354]"
            : isBelowAverage 
              ? "bg-[#0D1527] border-[#2dd4bf]/40" 
              : "bg-[#040813] border-[#FF6B6B]/40"
        }`}>
          {normalizedUserAverage === 0 ? (
            <div className="p-2.5 bg-slate-800 text-slate-400 rounded-xl mt-0.5 shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
          ) : isBelowAverage ? (
            <div className="p-2.5 bg-[#2DD4BF]/10 text-[#2DD4BF] rounded-xl mt-0.5 shrink-0 border border-[#2DD4BF]/20">
              <TrendingDown className="w-5 h-5 animate-bounce" />
            </div>
          ) : (
            <div className="p-2.5 bg-red-500/10 text-[#FF6B6B] rounded-xl mt-0.5 shrink-0 border border-red-500/20">
              <TrendingUp className="w-5 h-5 animate-bounce" />
            </div>
          )}

          <div>
            <span className="text-[9px] uppercase tracking-widest font-bold font-mono text-[#2DD4BF] block mb-1">
              Assessment Diagnostics
            </span>
            <p className="text-xs text-[#E2E8F0]/90 leading-relaxed font-sans">
              {normalizedUserAverage === 0 ? (
                "Insert some eco-logs to let the benchmark engine compute live diagnostics."
              ) : isBelowAverage ? (
                <span>
                  Outstanding stewardship! Your average daily footprint (<strong className="text-white">{normalizedUserAverage.toFixed(1)} kg</strong>) is <strong className="text-[#2DD4BF] font-mono">{absPercent}% below</strong> the {selectedRegion.name} average.
                </span>
              ) : (
                <span>
                  Action pathway required. Your average daily footprint (<strong className="text-white">{normalizedUserAverage.toFixed(1)} kg</strong>) is <strong className="text-[#FF6B6B] font-mono">{absPercent}% above</strong> the {selectedRegion.name} average. Adopt green habits below to neutralize!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Visual Progress Graph Bars */}
        <div className="space-y-4">
          <label className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest block mb-2">
            Relative Daily Footprint Comparison
          </label>
          <div className="bg-[#0A0F1D] p-5 rounded-2xl border border-[#223354] space-y-4">
            
            {/* User Footprint row */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-white mb-2">
                <span className="flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                  Your Active Average
                </span>
                <span className="font-mono text-xs text-[#2DD4BF] font-bold">
                  {normalizedUserAverage.toFixed(1)} <span className="text-[10px] text-slate-400">kg CO₂e/day</span>
                </span>
              </div>
              <div className="w-full bg-[#111A2E] h-3 rounded-full overflow-hidden border border-[#223354]">
                <div 
                  className={`h-full transition-all duration-500 ease-out ${
                    normalizedUserAverage <= 5.4 
                      ? "bg-[#2DD4BF] shadow-[0_0_8px_#2DD4BF/20]" 
                      : normalizedUserAverage <= 18 
                        ? "bg-amber-400" 
                        : "bg-[#FF6B6B]"
                  }`}
                  style={{ width: `${Math.min((normalizedUserAverage / 45) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Selected benchmark footprint row */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 italic">
                  <span>{selectedRegion.flag}</span>
                  {selectedRegion.name}
                </span>
                <span className="font-mono text-xs text-white">
                  {selectedRegion.dailyAverage} <span className="text-[10px] text-slate-400">kg CO₂e/day</span>
                </span>
              </div>
              <div className="w-full bg-[#111A2E] h-2.5 rounded-full overflow-hidden border border-[#223354]">
                <div 
                  className="bg-slate-400 h-full opacity-60"
                  style={{ width: `${Math.min((selectedRegion.dailyAverage / 45) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Custom Archetype Limit Target footprint benchmark */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-2">
                <span className="flex items-center gap-1.5 italic">
                  <span>🎯</span>
                  Dynamic Profile Limit ({profileArchetype.replace("_", " ")})
                </span>
                <span className="font-mono text-xs text-[#2DD4BF] font-bold">
                  {dynamicArchetypeLimit.toFixed(1)} <span className="text-[10px] text-slate-400">kg CO₂e/day</span>
                </span>
              </div>
              <div className="w-full bg-[#111A2E] h-2.5 rounded-full overflow-hidden border border-[#223354]">
                <div 
                  className="bg-[#2DD4BF]/80 h-full shadow-[0_0_8px_#2dd4bf/10]"
                  style={{ width: `${Math.min((dynamicArchetypeLimit / 45) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* Note on mapping ratios */}
            <p className="text-[9px] text-[#E2E8F0]/40 text-center italic font-sans">
              *Visual comparison is indexed to relative scale bounds (0 to 45 kg max limit).
            </p>

          </div>
        </div>

        {/* Equivalency Calculator Grid */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
            <label className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-widest block">
              Annual Footprint Humanized Equivalencies
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            {/* Passenger Car Equivalent */}
            <div className="bg-[#0A0F1D] p-4 rounded-2xl border border-[#223354] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2 text-[#E2E8F0]/70 text-xs font-bold uppercase tracking-wider">
                <Car className="w-4 h-4 text-amber-400" />
                <span>Road Miles</span>
              </div>
              <div>
                <p className="text-xl font-serif italic text-white tracking-tight">
                  {normalizedUserAverage === 0 ? "0" : carMilesEquivalent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-[#E2E8F0]/40 mt-1 font-sans leading-relaxed">
                  equivalent average gasoline car miles driven per year.
                </p>
              </div>
            </div>

            {/* Phone charges Equivalent */}
            <div className="bg-[#0A0F1D] p-4 rounded-2xl border border-[#223354] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2 text-[#E2E8F0]/70 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Phone Charges</span>
              </div>
              <div>
                <p className="text-xl font-serif italic text-white tracking-tight">
                  {normalizedUserAverage === 0 ? "0" : phoneChargesEquivalent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[10px] text-[#E2E8F0]/40 mt-1 font-sans leading-relaxed">
                  smartphone battery lifecycles fully charged annually.
                </p>
              </div>
            </div>

            {/* Tree offset seedling requirement */}
            <div className="bg-[#0A0F1D] p-4 rounded-2xl border border-[#223354] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2 text-[#E2E8F0]/70 text-xs font-bold uppercase tracking-wider">
                <TreePine className="w-4 h-4 text-[#2DD4BF]" />
                <span>Tree Seedlings</span>
              </div>
              <div>
                <p className="text-xl font-serif italic text-[#2DD4BF] tracking-tight">
                  {normalizedUserAverage === 0 ? "0" : treeSaplingsEquivalent.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                </p>
                <p className="text-[10px] text-[#E2E8F0]/40 mt-1 font-sans leading-relaxed">
                  urban trees seedlings growing for 10 years to sequester emissions.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
      
    </div>
  );
}
